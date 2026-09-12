const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    contactNumber: { type: String, required: true, trim: true },
    abhaId: { type: String, trim: true }, // ABHA-linked ID, optional at registration
    address: { type: String, trim: true },

    // Which system of medicine this patient wants to consult for this visit.
    preferredDoctorType: {
      type: String,
      enum: ["ayurvedic", "allopathic"],
      required: true,
    },

    // The logged-in patient account that added this record — could be the
    // account holder themselves (isSelf: true) or a family member/dependent
    // they registered on their behalf.
    accountOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isSelf: { type: Boolean, default: false },
  },
  { timestamps: true }
);

patientSchema.index({ name: "text", contactNumber: "text", abhaId: "text" });

module.exports = mongoose.model("Patient", patientSchema);
