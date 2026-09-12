const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chiefComplaint: { type: String, required: true, trim: true },
    symptoms: [{ type: String, trim: true }],
    durationOfSymptoms: { type: String, trim: true },
    pastMedicalHistory: { type: String, trim: true },
    currentMedications: { type: String, trim: true },
    allergies: { type: String, trim: true },
    vitals: {
      bloodPressure: String,
      pulse: String,
      temperature: String,
      weight: String,
    },
    // Populated in Week 3 by the AI summary route — left here so the schema
    // is ready without needing a migration later.
    aiSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
    urgent: { type: Boolean, default: false },
    doctorNotes: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date, default: null },
    // Every time a doctor (re)saves a review, the state being replaced is
    // pushed here first — so edits after the initial review are auditable.
    reviewHistory: [
      {
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: String,
        doctorNotes: String,
        reviewedAt: Date,
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Doctor dashboard queries filter by status and/or patient, always sorted
// by recency, with urgent cases surfaced first — index accordingly.
caseSchema.index({ status: 1, createdAt: -1 });
caseSchema.index({ urgent: -1, createdAt: -1 });
caseSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("Case", caseSchema);