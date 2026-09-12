const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // "patient" = a person who logs in to register themselves/family and fill case forms.
    // "doctor"  = clinician who logs in to review cases.
    role: { type: String, enum: ["patient", "doctor", "admin"], required: true },

    specialization: { type: String, trim: true }, // doctors only

    // Which system of medicine a doctor practices — required for doctors so
    // patients can be routed/filtered accordingly (Ayurvedic vs Allopathic).
    medicalSystem: {
      type: String,
      enum: ["ayurvedic", "allopathic"],
      required: function () {
        return this.role === "doctor";
      },
    },

    // Email 2FA
    isVerified: { type: Boolean, default: false }, // set true after first successful OTP login
    otp: {
      codeHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lockedUntil: { type: Date, default: null },
    },

    // Self-service registration limit for patient accounts:
    // up to 10 Patient records per rolling 7-day window, then resets.
    weeklyPatientRegistration: {
      count: { type: Number, default: 0 },
      weekStart: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never send password hash or OTP internals back in JSON responses
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otp;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);