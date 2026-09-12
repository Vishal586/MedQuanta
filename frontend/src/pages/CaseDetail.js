import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function Field({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}

export default function CaseDetail() {
  const { id } = useParams();
  const [caseDoc, setCaseDoc] = useState(null);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    api
      .get(`/cases/${id}`)
      .then((res) => {
        setCaseDoc(res.data);
        setNotes(res.data.doctorNotes || "");

        return api.get(
          `/cases/patient/${res.data.patient._id}/history`,
          {
            params: { excludeId: id },
          }
        );
      })
      .then((res) => setHistory(res?.data || []))
      .catch(() => setError("Unable to load this case."));
  }, [id]);

  async function handleMarkReviewed() {
    setSaving(true);
    setError("");

    try {
      const res = await api.patch(`/cases/${id}/review`, {
        doctorNotes: notes,
      });

      setCaseDoc(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update this case."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateSummary() {
    setSummarizing(true);
    setSummaryError("");

    try {
      const res = await api.post(`/cases/${id}/summarize`);
      setCaseDoc(res.data);
    } catch (err) {
      setSummaryError(
        err.response?.data?.message ||
          "Unable to generate a summary right now."
      );
    } finally {
      setSummarizing(false);
    }
  }

  if (error && !caseDoc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div
          className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg"
          role="alert"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h1 className="text-lg font-bold text-slate-900">
            Unable to load case
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <Link
            to="/doctor/dashboard"
            className="mt-6 inline-flex items-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!caseDoc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />

          <p className="text-sm font-semibold text-slate-700">
            Loading case…
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching patient information.
          </p>
        </div>
      </div>
    );
  }

  const { patient } = caseDoc;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Top navigation */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            to="/doctor/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>

          <button
            type="button"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            onClick={() => window.print()}
          >
            Print summary
          </button>
        </div>

        {/* Patient header */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-xl font-bold uppercase text-teal-700 ring-1 ring-teal-100">
                  {patient?.name?.charAt(0) || "P"}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-600">
                    Patient case
                  </p>

                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {patient?.name}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {patient?.age} yrs
                    <span className="mx-1.5 text-slate-300">·</span>
                    {patient?.gender}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {patient?.contactNumber}

                    {patient?.abhaId && (
                      <>
                        <span className="mx-1.5 text-slate-300">·</span>
                        ABHA {patient.abhaId}
                      </>
                    )}
                  </p>

                  {patient?.preferredDoctorType && (
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                      Wants {patient.preferredDoctorType} care
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {caseDoc.urgent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Urgent
                  </span>
                )}

                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                    caseDoc.status === "reviewed"
                      ? "border-teal-100 bg-teal-50 text-teal-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {caseDoc.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Patient information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Intake information
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Patient details
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Chief complaint"
                  value={caseDoc.chiefComplaint}
                />

                <Field
                  label="Other symptoms"
                  value={caseDoc.symptoms?.join(", ")}
                />

                <Field
                  label="Duration"
                  value={caseDoc.durationOfSymptoms}
                />

                <Field
                  label="Past medical history"
                  value={caseDoc.pastMedicalHistory}
                />

                <Field
                  label="Current medications"
                  value={caseDoc.currentMedications}
                />

                <Field
                  label="Allergies"
                  value={caseDoc.allergies}
                />
              </div>
            </section>

            {/* AI summary */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-sm font-bold text-violet-600">
                      AI
                    </span>

                    <h2 className="text-base font-bold text-slate-900">
                      AI-assisted summary
                    </h2>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Helps organize intake information for clinical review.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
                  onClick={handleGenerateSummary}
                  disabled={summarizing}
                >
                  {summarizing
                    ? "Generating…"
                    : caseDoc.aiSummary
                      ? "Regenerate"
                      : "Generate summary"}
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {summaryError && (
                  <div
                    className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {summaryError}
                  </div>
                )}

                {!caseDoc.aiSummary ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-violet-600 shadow-sm">
                      AI
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      Summary not generated yet
                    </p>

                    <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500">
                      This organizes the intake into a summary and flags
                      things worth double-checking — it doesn't diagnose,
                      so always verify against the patient directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 text-sm">

                    {/* Summary */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Summary
                      </p>

                      <p className="leading-7 text-slate-700">
                        {caseDoc.aiSummary.summary}
                      </p>
                    </div>

                    {/* Key symptoms */}
                    {caseDoc.aiSummary.keySymptoms?.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-bold text-slate-800">
                          Key symptoms
                        </h3>

                        <ul className="space-y-2">
                          {caseDoc.aiSummary.keySymptoms.map((s, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-sm leading-6 text-slate-600"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Possible considerations */}
                    {caseDoc.aiSummary.possibleConsiderations?.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-bold text-slate-800">
                          Worth considering
                        </h3>

                        <ul className="space-y-2">
                          {caseDoc.aiSummary.possibleConsiderations.map(
                            (s, i) => (
                              <li
                                key={i}
                                className="flex gap-3 text-sm leading-6 text-slate-600"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                                <span>{s}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Suggested next steps */}
                    {caseDoc.aiSummary.suggestedNextSteps?.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-bold text-slate-800">
                          Suggested next steps
                        </h3>

                        <ul className="space-y-2">
                          {caseDoc.aiSummary.suggestedNextSteps.map(
                            (s, i) => (
                              <li
                                key={i}
                                className="flex gap-3 text-sm leading-6 text-slate-600"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                                <span>{s}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Red flags */}
                    {caseDoc.aiSummary.redFlags?.length > 0 && (
                      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                            !
                          </span>

                          <p className="font-bold text-red-700">
                            Red flags to double-check
                          </p>
                        </div>

                        <ul className="space-y-2">
                          {caseDoc.aiSummary.redFlags.map((s, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-sm leading-6 text-red-700/90"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
                      Generated{" "}
                      {new Date(
                        caseDoc.aiSummary.generatedAt
                      ).toLocaleString()}{" "}
                      — AI-assisted, not a diagnosis.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Previous visits */}
            {history.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:hidden">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                    Patient history
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Previous visits
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Previous visits for this patient
                  </p>
                </div>

                <ul className="space-y-2">
                  {history.map((h) => (
                    <li
                      key={h._id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {h.chiefComplaint}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {h.urgent && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Urgent
                          </span>
                        )}

                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-500 ring-1 ring-slate-200">
                          {h.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Doctor notes sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:hidden">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                    Clinical review
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Doctor notes
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add diagnosis, follow-up instructions, prescriptions,
                    or other clinical notes.
                  </p>
                </div>

                <label
                  className="sr-only"
                  htmlFor="notes"
                >
                  Doctor notes
                </label>

                <textarea
                  id="notes"
                  className="field-input min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Diagnosis, follow-up instructions, prescriptions…"
                />

                {error && (
                  <p
                    className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  className="btn-primary mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleMarkReviewed}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : caseDoc.status === "reviewed"
                      ? "Update notes"
                      : "Mark as reviewed"}
                </button>

                {caseDoc.reviewedAt && (
                  <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs leading-5 text-slate-500">
                      Last reviewed{" "}
                      {new Date(
                        caseDoc.reviewedAt
                      ).toLocaleString()}
                      {caseDoc.doctor?.name &&
                        ` by Dr. ${caseDoc.doctor.name}`}
                    </p>
                  </div>
                )}
              </section>

              {/* Printable notes block */}
              <div className="hidden print:block border-t border-slate-200 pt-4">
                <p className="mb-1 text-sm font-semibold text-slate-500">
                  Doctor's notes
                </p>

                <p className="text-sm text-slate-800">
                  {caseDoc.doctorNotes || "—"}
                </p>
              </div>

              {/* Review history */}
              {caseDoc.reviewHistory?.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:hidden">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                      Audit trail
                    </p>

                    <h2 className="mt-1 text-base font-bold text-slate-900">
                      Review history
                    </h2>
                  </div>

                  <ul className="space-y-3">
                    {caseDoc.reviewHistory.map((h, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <p className="text-xs leading-5 text-slate-400">
                          Recorded{" "}
                          {new Date(
                            h.recordedAt
                          ).toLocaleString()}
                          {h.doctor?.name &&
                            ` — Dr. ${h.doctor.name}`}
                        </p>

                        {h.doctorNotes && (
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {h.doctorNotes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}