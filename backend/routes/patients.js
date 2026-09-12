const express = require("express");
const { body, validationResult } = require("express-validator");
const Patient = require("../models/Patient");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/roleCheck");

const router = express.Router();

const WEEKLY_LIMIT = 10;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Resets the counter if the 7-day window has elapsed, then returns the
// (possibly reset) user document. Does not save — caller decides when to.
function refreshWeeklyWindowIfNeeded(user) {
  const windowStart = user.weeklyPatientRegistration.weekStart.getTime();
  if (Date.now() - windowStart >= WEEK_MS) {
    user.weeklyPatientRegistration.count = 0;
    user.weeklyPatientRegistration.weekStart = new Date();
  }
  return user;
}

// @route  POST /api/patients
// @desc   A logged-in patient account registers a clinical patient record —
//         themselves (isSelf: true) or someone else (e.g. a family member).
//         Capped at 10 per rolling 7-day window per account.
router.post(
  "/",
  protect,
  restrictTo("patient"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("age").isInt({ min: 0, max: 130 }).withMessage("Valid age is required"),
    body("gender").notEmpty().bail().isIn(["male", "female", "other"]).withMessage("Gender is required"),
    body("contactNumber").trim().notEmpty().withMessage("Contact number is required"),
    body("preferredDoctorType")
      .notEmpty()
      .withMessage("Select whether you'd like to see an Ayurvedic or Allopathic doctor")
      .bail()
      .isIn(["ayurvedic", "allopathic"])
      .withMessage("Select whether you'd like to see an Ayurvedic or Allopathic doctor"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      refreshWeeklyWindowIfNeeded(user);

      if (user.weeklyPatientRegistration.count >= WEEKLY_LIMIT) {
        const resetsAt = new Date(user.weeklyPatientRegistration.weekStart.getTime() + WEEK_MS);
        return res.status(429).json({
          message: `You've reached the weekly limit of ${WEEKLY_LIMIT} patient registrations.`,
          resetsAt,
        });
      }

      const { name, age, gender, contactNumber, abhaId, address, isSelf, preferredDoctorType } = req.body;

      const patient = await Patient.create({
        name,
        age,
        gender,
        contactNumber,
        abhaId,
        address,
        preferredDoctorType,
        accountOwner: user._id,
        isSelf: Boolean(isSelf),
      });

      user.weeklyPatientRegistration.count += 1;
      await user.save();

      res.status(201).json({
        patient,
        remainingThisWeek: WEEKLY_LIMIT - user.weeklyPatientRegistration.count,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(" ") });
      }
      console.error(err);
      res.status(500).json({ message: "Server error while registering patient" });
    }
  }
);

// @route  GET /api/patients/mine
// @desc   List patients this account has registered (self + others), plus
//         how many registration slots remain this week.
router.get("/mine", protect, restrictTo("patient"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    refreshWeeklyWindowIfNeeded(user);
    await user.save();

    const patients = await Patient.find({ accountOwner: user._id }).sort({ createdAt: -1 });
    const resetsAt = new Date(user.weeklyPatientRegistration.weekStart.getTime() + WEEK_MS);

    res.json({
      patients,
      used: user.weeklyPatientRegistration.count,
      remaining: WEEKLY_LIMIT - user.weeklyPatientRegistration.count,
      limit: WEEKLY_LIMIT,
      resetsAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching your patients" });
  }
});

// @route  GET /api/patients
// @desc   List / search all patients — doctor dashboard (Week 2). Defaults
//         to patients who requested this doctor's system of medicine;
//         pass ?doctorType=all to see across both.
router.get("/", protect, restrictTo("doctor", "admin"), async (req, res) => {
  try {
    const { search, doctorType } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };

    if (req.user.role === "doctor" && doctorType !== "all") {
      const doctor = await User.findById(req.user.id);
      query.preferredDoctorType = doctorType || doctor.medicalSystem;
    } else if (doctorType && doctorType !== "all") {
      query.preferredDoctorType = doctorType;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching patients" });
  }
});

// @route  GET /api/patients/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // A patient-account can only view records it registered; doctors can view any.
    if (req.user.role === "patient" && String(patient.accountOwner) !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this record" });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching patient" });
  }
});

module.exports = router;