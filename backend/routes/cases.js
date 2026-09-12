const express = require("express");
const { body, validationResult } = require("express-validator");
const Case = require("../models/Case");
const Patient = require("../models/Patient");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/roleCheck");
const { isUrgentCase } = require("../utils/urgentDetection");
const { generateCaseSummary } = require("../utils/aiClient");

const router = express.Router();

const INTAKE_FIELDS = [
  "chiefComplaint",
  "symptoms",
  "durationOfSymptoms",
  "pastMedicalHistory",
  "currentMedications",
  "allergies",
];

function applyIntakeFields(target, body) {
  for (const field of INTAKE_FIELDS) {
    if (body[field] !== undefined) target[field] = body[field];
  }
  target.urgent = isUrgentCase(target);
}

// @route  POST /api/cases
// @desc   Submit a case-taking form for a patient. One case per patient
//         record — if one already exists, use PATCH /:id instead (while
//         it's still pending) rather than creating a duplicate.
router.post(
  "/",
  protect,
  restrictTo("patient"),
  [
    body("patient").notEmpty().withMessage("Patient ID is required"),
    body("chiefComplaint").trim().notEmpty().withMessage("Chief complaint is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const patientDoc = await Patient.findById(req.body.patient);
      if (!patientDoc) {
        return res.status(404).json({ message: "Patient not found" });
      }
      if (String(patientDoc.accountOwner) !== req.user.id) {
        return res.status(403).json({ message: "You can only submit cases for patients you registered" });
      }

      const existing = await Case.findOne({ patient: patientDoc._id });
      if (existing) {
        return res.status(409).json({
          message: "A case has already been submitted for this patient",
          caseId: existing._id,
        });
      }

      const newCase = new Case({ patient: req.body.patient });
      applyIntakeFields(newCase, req.body);
      await newCase.save();

      res.status(201).json(newCase);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while saving case" });
    }
  }
);

// @route  GET /api/cases/by-patient/:patientId
// @desc   Used by the kiosk/patient UI to check whether this patient already
//         has a case on file, so it can show/edit it instead of duplicating.
router.get("/by-patient/:patientId", protect, restrictTo("patient"), async (req, res) => {
  try {
    const patientDoc = await Patient.findById(req.params.patientId);
    if (!patientDoc) return res.status(404).json({ message: "Patient not found" });
    if (String(patientDoc.accountOwner) !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this record" });
    }

    const existing = await Case.findOne({ patient: patientDoc._id });
    res.json({ case: existing || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while checking for an existing case" });
  }
});

// @route  PATCH /api/cases/:id
// @desc   Patient-side edit window — the account that submitted a case can
//         correct it up until a doctor reviews it. Locked afterward.
router.patch("/:id", protect, restrictTo("patient"), async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id).populate("patient");
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    if (String(caseDoc.patient.accountOwner) !== req.user.id) {
      return res.status(403).json({ message: "You can only edit cases you submitted" });
    }
    if (caseDoc.status === "reviewed") {
      return res.status(409).json({ message: "This case has already been reviewed and can no longer be edited" });
    }

    applyIntakeFields(caseDoc, req.body);
    await caseDoc.save();
    res.json(caseDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating case" });
  }
});

// @route  GET /api/cases
// @desc   Doctor dashboard: list cases with search, status filter, and
//         pagination. Defaults to cases whose patient requested this
//         doctor's system of medicine — pass ?doctorType=all to see both.
//         Urgent cases always sort first within a page.
router.get("/", protect, restrictTo("doctor", "admin"), async (req, res) => {
  try {
    const { status, search, doctorType, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};
    if (status && ["pending", "reviewed"].includes(status)) {
      filter.status = status;
    }

    const patientFilter = {};
    if (search && search.trim()) {
      patientFilter.$text = { $search: search.trim() };
    }
    if (req.user.role === "doctor" && doctorType !== "all") {
      const doctor = await User.findById(req.user.id);
      patientFilter.preferredDoctorType = doctorType || doctor.medicalSystem;
    } else if (doctorType && doctorType !== "all") {
      patientFilter.preferredDoctorType = doctorType;
    }

    if (Object.keys(patientFilter).length > 0) {
      const matchingPatients = await Patient.find(patientFilter).select("_id");
      filter.patient = { $in: matchingPatients.map((p) => p._id) };
    }

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate("patient", "name age gender contactNumber abhaId preferredDoctorType")
        .populate("doctor", "name")
        .sort({ urgent: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Case.countDocuments(filter),
    ]);

    res.json({
      cases,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching cases" });
  }
});

// @route  GET /api/cases/patient/:patientId/history
// @desc   Other cases on file for the same patient — lets a doctor see a
//         patient's visit history from within the current case, and lets
//         a patient account see their own past submissions for that person.
router.get("/patient/:patientId/history", protect, async (req, res) => {
  try {
    const patientDoc = await Patient.findById(req.params.patientId);
    if (!patientDoc) return res.status(404).json({ message: "Patient not found" });

    if (req.user.role === "patient" && String(patientDoc.accountOwner) !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this history" });
    }

    const filter = { patient: patientDoc._id };
    if (req.query.excludeId) filter._id = { $ne: req.query.excludeId };

    const cases = await Case.find(filter)
      .select("chiefComplaint status urgent createdAt reviewedAt")
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching patient history" });
  }
});

// @route  GET /api/cases/:id
// @desc   Full case detail. Doctors can view any case; a patient account
//         can only view cases for patients it registered.
router.get("/:id", protect, async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate("patient")
      .populate("doctor", "name specialization")
      .populate("reviewHistory.doctor", "name");

    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    if (req.user.role === "patient" && String(caseDoc.patient.accountOwner) !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to view this case" });
    }

    res.json(caseDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching case" });
  }
});

// @route  POST /api/cases/:id/summarize
// @desc   Ask the configured AI provider to turn the raw intake into a
//         structured summary for the doctor. Doctor-triggered, not automatic
//         on submission — keeps API costs tied to cases actually being opened.
router.post("/:id/summarize", protect, restrictTo("doctor", "admin"), async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id).populate("patient");
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    const aiSummary = await generateCaseSummary(caseDoc);
    caseDoc.aiSummary = { ...aiSummary, generatedAt: new Date() };
    await caseDoc.save();

    res.json(caseDoc);
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: "The AI summary could not be generated. You can try again or continue without it." });
  }
});

// @route  PATCH /api/cases/:id/review
// @desc   Doctor marks a case reviewed and optionally adds notes. If the
//         case was already reviewed, the prior state is archived to
//         reviewHistory first, so edits after review are auditable.
router.patch(
  "/:id/review",
  protect,
  restrictTo("doctor", "admin"),
  [body("doctorNotes").optional().trim()],
  async (req, res) => {
    try {
      const caseDoc = await Case.findById(req.params.id);
      if (!caseDoc) return res.status(404).json({ message: "Case not found" });

      if (caseDoc.status === "reviewed") {
        caseDoc.reviewHistory.push({
          doctor: caseDoc.doctor,
          status: caseDoc.status,
          doctorNotes: caseDoc.doctorNotes,
          reviewedAt: caseDoc.reviewedAt,
        });
      }

      caseDoc.status = "reviewed";
      caseDoc.doctor = req.user.id;
      caseDoc.reviewedAt = new Date();
      if (typeof req.body.doctorNotes === "string") {
        caseDoc.doctorNotes = req.body.doctorNotes;
      }

      await caseDoc.save();
      await caseDoc.populate("doctor", "name specialization");
      await caseDoc.populate("reviewHistory.doctor", "name");
      res.json(caseDoc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while updating case" });
    }
  }
);

module.exports = router;