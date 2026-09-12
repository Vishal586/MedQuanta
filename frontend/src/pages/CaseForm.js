import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const initialForm = {
  chiefComplaint: "",
  symptoms: "",
  durationOfSymptoms: "",
  pastMedicalHistory: "",
  currentMedications: "",
  allergies: "",
};

function toFormShape(caseDoc) {
  return {
    chiefComplaint: caseDoc.chiefComplaint || "",
    symptoms: (caseDoc.symptoms || []).join(", "),
    durationOfSymptoms: caseDoc.durationOfSymptoms || "",
    pastMedicalHistory: caseDoc.pastMedicalHistory || "",
    currentMedications: caseDoc.currentMedications || "",
    allergies: caseDoc.allergies || "",
  };
}

export default function CaseForm() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [existingCase, setExistingCase] = useState(null); // null until we know
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/cases/by-patient/${patientId}`)
      .then((res) => {
        if (res.data.case) {
          setExistingCase(res.data.case);
          setForm(toFormShape(res.data.case));
        }
      })
      .catch(() => setError("Unable to check for an existing case."))
      .finally(() => setLoading(false));
  }, [patientId]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function buildPayload() {
    return {
      ...form,
      symptoms: form.symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/cases", { patient: patientId, ...buildPayload() });
      setSubmitted(true);
    } catch (err) {
      // A 409 here means another tab/request already created it — refetch and edit instead.
      if (err.response?.status === 409 && err.response.data.caseId) {
        const res = await api.get(`/cases/by-patient/${patientId}`);
        setExistingCase(res.data.case);
        setForm(toFormShape(res.data.case));
      } else {
        setError(
          err.response?.data?.message || "Unable to save case details."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.patch(
        `/cases/${existingCase._id}`,
        buildPayload()
      );
      setExistingCase(res.data);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update case details."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="h-11 w-11 rounded-full border-4 border-slate-200 border-t-teal animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Preparing your case form…
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // Already reviewed — locked, read-only, show the doctor's notes.
  if (existingCase && existingCase.status === "reviewed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4 py-8 sm:py-12">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-8 text-white sm:px-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Case reviewed
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your case has been reviewed
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-teal-50 sm:text-base">
                This case has been reviewed by your doctor and can no longer
                be edited.
              </p>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chief complaint
                </p>
                <p className="text-base font-medium leading-7 text-slate-800">
                  {existingCase.chiefComplaint}
                </p>
              </div>

              {existingCase.doctorNotes && (
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10h8M8 14h5M7 19l-3 2v-4.5A7.5 7.5 0 0 1 11.5 9h1A7.5 7.5 0 0 1 20 16.5V17a2 2 0 0 1-2 2H7Z"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-bold text-teal-900">
                      Doctor's notes
                    </p>
                  </div>

                  <p className="text-sm leading-7 text-teal-900/80">
                    {existingCase.doctorNotes}
                  </p>
                </div>
              )}

              <button
                type="button"
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 active:scale-[0.99]"
                onClick={() => navigate("/patient/dashboard")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-2 h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 18 9 12l6-6"
                  />
                </svg>
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4 py-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/60 sm:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-8 ring-teal-50/60">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4.5 4.5L19 7"
                />
              </svg>
            </div>

            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-teal-600">
              Successfully saved
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {existingCase ? "Case updated" : "Thank you"}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
              Your details have been recorded. The doctor will review it
              before your visit.
            </p>

            <button
              type="button"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-200 active:translate-y-0"
              onClick={() => navigate("/patient/dashboard")}
            >
              Back to dashboard
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="ml-2 h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEdit = Boolean(existingCase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-7 sm:mb-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            <span
              className="h-1.5 w-1.5 rounded-full bg-teal-500"
              aria-hidden="true"
            />
            Patient intake
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {isEdit
              ? "Update your case details"
              : "Tell us why you're here today"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {isEdit
              ? "You can still make changes — this hasn't been reviewed yet."
              : "Share a few details about your symptoms so your doctor can prepare before you're called in."}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h8M12 8v8M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {isEdit ? "Case information" : "Tell us about your symptoms"}
                </h2>
                <p className="text-xs text-slate-500">
                  All fields are kept secure and used for your consultation.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={isEdit ? handleUpdate : handleCreate}
            className="space-y-6 p-5 sm:p-7"
          >
            <div>
              <label
                htmlFor="chiefComplaint"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                What's the main problem you're facing?
                <span className="ml-1 text-teal-600" aria-hidden="true">
                  *
                </span>
              </label>

              <textarea
                id="chiefComplaint"
                className="field-input min-h-[120px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                rows={2}
                value={form.chiefComplaint}
                onChange={update("chiefComplaint")}
                placeholder="Briefly describe the main reason for your visit"
                required
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Start with the symptom or concern that bothers you the most.
              </p>
            </div>

            <div>
              <label
                htmlFor="symptoms"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Other symptoms
              </label>

              <input
                id="symptoms"
                className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="e.g. fever, headache, fatigue"
                value={form.symptoms}
                onChange={update("symptoms")}
              />

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-3.5 w-3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 10h12"
                  />
                </svg>
                Separate multiple symptoms with commas.
              </div>
            </div>

            <div>
              <label
                htmlFor="durationOfSymptoms"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                How long have you had these symptoms?
              </label>

              <input
                id="durationOfSymptoms"
                className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="e.g. 3 days"
                value={form.durationOfSymptoms}
                onChange={update("durationOfSymptoms")}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pastMedicalHistory"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Past medical history
                </label>

                <textarea
                  id="pastMedicalHistory"
                  className="field-input min-h-[120px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  rows={2}
                  value={form.pastMedicalHistory}
                  onChange={update("pastMedicalHistory")}
                  placeholder="e.g. diabetes, hypertension, past surgeries"
                />
              </div>

              <div>
                <label
                  htmlFor="currentMedications"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Current medications
                </label>

                <input
                  id="currentMedications"
                  className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  value={form.currentMedications}
                  onChange={update("currentMedications")}
                  placeholder="List any medicines you're currently taking"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="allergies"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Known allergies
              </label>

              <input
                id="allergies"
                className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                value={form.allergies}
                onChange={update("allergies")}
                placeholder="e.g. penicillin, peanuts, no known allergies"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6v4m0 3h.01M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold">Something went wrong</p>
                  <p className="mt-0.5 leading-6 text-red-600/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-2">
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-200 active:translate-y-0"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="mr-2 h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth="3"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    {isEdit ? "Save changes" : "Submit case"}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-2 h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                Please review your information before submitting.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.5 9V6.75a3.5 3.5 0 1 1 7 0V9m-8 0h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"
            />
          </svg>
          Your information is securely handled.
        </div>
      </div>
    </div>
  );
}