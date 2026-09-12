// Simple keyword-based triage flag. This is NOT a clinical decision tool —
// it exists only to surface cases a doctor should probably look at first
// on a busy dashboard. False negatives are expected; when in doubt a
// doctor still reviews every case regardless of this flag.
const URGENT_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "shortness of breath",
  "can't breathe",
  "cannot breathe",
  "severe bleeding",
  "heavy bleeding",
  "unconscious",
  "unresponsive",
  "seizure",
  "stroke",
  "slurred speech",
  "severe pain",
  "high fever",
  "suicidal",
  "chest tightness",
  "fainted",
  "fainting",
  "paralysis",
  "severe allergic reaction",
  "anaphylaxis",
];

function isUrgentCase({ chiefComplaint = "", symptoms = [] }) {
  const haystack = [chiefComplaint, ...(Array.isArray(symptoms) ? symptoms : [])]
    .join(" ")
    .toLowerCase();

  return URGENT_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

module.exports = { isUrgentCase, URGENT_KEYWORDS };
