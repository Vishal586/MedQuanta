const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { generateOtp, hashOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/sendEmail");

const router = express.Router();

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MINUTES = 15;

// Throttle by IP so a script can't hammer these endpoints regardless of
// which account it's targeting. Per-account lockout (below) handles the
// case of someone guessing codes for one specific account.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts from this device. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many code attempts from this device. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function issueOtp(user) {
  const { code, codeHash, expiresAt } = generateOtp();
  user.otp = { codeHash, expiresAt, attempts: 0, lockedUntil: null };
  await user.save();
  await sendOtpEmail(user.email, code);
}

function minutesRemaining(until) {
  return Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
}

// @route  POST /api/auth/register
// @desc   Create a patient or doctor account. No token is issued here —
//         the person still has to log in (and pass OTP) afterward.
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["patient", "doctor"]).withMessage("Role must be patient or doctor"),
    body("medicalSystem")
      .if(body("role").equals("doctor"))
      .notEmpty()
      .withMessage("Select whether this doctor practices Ayurvedic or Allopathic medicine")
      .bail()
      .isIn(["ayurvedic", "allopathic"])
      .withMessage("Select whether this doctor practices Ayurvedic or Allopathic medicine"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role, specialization, medicalSystem } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const userData = {
        name,
        email,
        password,
        role,
      };

      // These fields belong only to clinician accounts. Omitting them for
      // patients keeps this payload aligned with the conditional User schema.
      if (role === "doctor") {
        userData.specialization = specialization;
        userData.medicalSystem = medicalSystem;
      }

      await User.create(userData);

      res.status(201).json({ message: "Account created. Please log in to continue." });
    } catch (err) {
      if (err.name === "ValidationError") {
        // Belt-and-braces: catches this even if a future client/script
        // bypasses the express-validator checks above.
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(" ") });
      }
      console.error(err);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// @route  POST /api/auth/login
// @desc   Step 1 of login: verify email + password, then email a one-time
//         code. No JWT is returned yet — that happens at /verify-otp.
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // A password-guessing lockout piggybacks on the same otp.lockedUntil
      // field: if someone's mid-lockout from bad OTP attempts, don't let a
      // fresh password check reset the clock and issue a brand new code.
      if (user.otp?.lockedUntil && user.otp.lockedUntil.getTime() > Date.now()) {
        return res.status(429).json({
          message: `Too many incorrect codes. Try again in ${minutesRemaining(user.otp.lockedUntil)} minute(s).`,
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await issueOtp(user);

      res.json({
        otpRequired: true,
        userId: user._id,
        message: "A verification code has been sent to your email",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// @route  POST /api/auth/verify-otp
// @desc   Step 2 of login: check the emailed code, issue the JWT. Locks the
//         account out of further OTP attempts after too many wrong guesses.
router.post(
  "/verify-otp",
  otpLimiter,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("6-digit code is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, code } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "No verification code pending for this account" });
      }

      if (user.otp?.lockedUntil && user.otp.lockedUntil.getTime() > Date.now()) {
        return res.status(429).json({
          message: `Too many incorrect codes. Try again in ${minutesRemaining(user.otp.lockedUntil)} minute(s).`,
        });
      }

      if (!user.otp?.codeHash || !user.otp?.expiresAt) {
        return res.status(400).json({ message: "No verification code pending for this account" });
      }

      if (user.otp.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "Code expired. Please log in again." });
      }

      if (hashOtp(code) !== user.otp.codeHash) {
        user.otp.attempts = (user.otp.attempts || 0) + 1;

        if (user.otp.attempts >= MAX_OTP_ATTEMPTS) {
          user.otp.lockedUntil = new Date(Date.now() + OTP_LOCKOUT_MINUTES * 60 * 1000);
          user.otp.codeHash = null; // the code itself is now dead too
          await user.save();
          return res.status(429).json({
            message: `Too many incorrect codes. Try again in ${OTP_LOCKOUT_MINUTES} minute(s).`,
          });
        }

        await user.save();
        return res.status(400).json({
          message: `Incorrect code. ${MAX_OTP_ATTEMPTS - user.otp.attempts} attempt(s) remaining.`,
        });
      }

      user.otp = { codeHash: null, expiresAt: null, attempts: 0, lockedUntil: null };
      user.isVerified = true;
      await user.save();

      const token = signToken(user);
      res.json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error during verification" });
    }
  }
);

// @route  POST /api/auth/resend-otp
router.post("/resend-otp", otpLimiter, [body("userId").notEmpty()], async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: "Account not found" });

    if (user.otp?.lockedUntil && user.otp.lockedUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: `Too many incorrect codes. Try again in ${minutesRemaining(user.otp.lockedUntil)} minute(s).`,
      });
    }

    await issueOtp(user);
    res.json({ message: "A new code has been sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while resending code" });
  }
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
