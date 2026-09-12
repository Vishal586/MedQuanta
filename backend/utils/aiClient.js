// Thin provider abstraction so the summarize route doesn't care whether
// it's talking to OpenAI or Gemini — set AI_PROVIDER in .env to switch.
// Both branches ask for a JSON-only response and hand back the parsed object.

const SUMMARY_INSTRUCTIONS = `You are assisting a doctor by structuring a patient's intake form into a
clinical summary. You do not diagnose — you organize what the patient reported and
flag anything that looks urgent, so the doctor can review faster.

Respond with ONLY a JSON object (no markdown, no prose outside the JSON) in exactly
this shape:
{
  "summary": "2-3 sentence plain-language summary of the case",
  "keySymptoms": ["short phrase", "..."],
  "possibleConsiderations": ["differential or consideration to look into", "..."],
  "suggestedNextSteps": ["e.g. specific vitals to check, tests to consider", "..."],
  "redFlags": ["anything urgent or inconsistent worth double-checking, or empty array"]
}`;

function buildPrompt(caseDoc) {
  const p = caseDoc.patient;
  return `Patient: ${p.age} years old, ${p.gender}.
Chief complaint: ${caseDoc.chiefComplaint}
Other symptoms: ${(caseDoc.symptoms || []).join(", ") || "none reported"}
Duration: ${caseDoc.durationOfSymptoms || "not specified"}
Past medical history: ${caseDoc.pastMedicalHistory || "none reported"}
Current medications: ${caseDoc.currentMedications || "none reported"}
Allergies: ${caseDoc.allergies || "none reported"}`;
}

function extractJson(text) {
  // Models sometimes wrap JSON in ```json fences despite instructions — strip them.
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SUMMARY_INSTRUCTIONS },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return extractJson(data.choices[0].message.content);
}

async function callGemini(prompt) {
  const model = process.env.AI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SUMMARY_INSTRUCTIONS}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return extractJson(text);
}

async function generateCaseSummary(caseDoc) {
  const prompt = buildPrompt(caseDoc);
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") return callGemini(prompt);
  return callOpenAI(prompt);
}

module.exports = { generateCaseSummary, extractJson };
