import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function PatientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null); // patientId currently showing cases
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setExpanded(null);

    try {
      const res = await api.get("/patients", { params: { search: query } });
      setResults(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to search patients."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(patientId) {
    if (expanded === patientId) {
      setExpanded(null);
      return;
    }

    try {
      const res = await api.get(
        `/cases/patient/${patientId}/history`
      );
      setCases(res.data);
      setExpanded(patientId);
    } catch {
      setError("Unable to load cases for this patient.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          >
            <span aria-hidden="true">←</span>
            Back to case dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Patient records
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Search patient records
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Look up a patient by name, phone number, or ABHA ID.
          </p>
        </div>

        {/* Search card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                ⌕
              </span>

              <input
                aria-label="Search patient records"
                className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                placeholder="e.g. Alice, 9876543210, or ABHA ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              className="btn-primary inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/20 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-28"
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
            role="alert"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold"
              aria-hidden="true"
            >
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
              {loading ? "…" : "⌕"}
            </div>

            <h2 className="text-base font-semibold text-slate-800">
              {loading
                ? "Searching patient records"
                : "No patient results yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {loading
                ? "Please wait while we look for matching patient records."
                : "Enter a patient's name, phone number, or ABHA ID above to begin your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Results header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Search results
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {results.length}{" "}
                  {results.length === 1 ? "patient" : "patients"} found
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Records
              </span>
            </div>

            {/* Patient list */}
            <ul className="divide-y divide-slate-100">
              {results.map((p) => (
                <li
                  key={p._id}
                  className="transition hover:bg-slate-50/70"
                >
                  <button
                    type="button"
                    aria-expanded={expanded === p._id}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition focus:outline-none focus:ring-4 focus:ring-inset focus:ring-teal-500/10 sm:px-6"
                    onClick={() => toggleExpand(p._id)}
                  >
                    <div className="flex min-w-0 items-center gap-4">

                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold uppercase text-teal-700 ring-1 ring-teal-100">
                        {p.name?.charAt(0) || "P"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {p.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {p.age} yrs
                          <span className="mx-1.5 text-slate-300">
                            ·
                          </span>
                          {p.gender}
                          <span className="mx-1.5 text-slate-300">
                            ·
                          </span>
                          {p.contactNumber}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.abhaId && (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              ABHA {p.abhaId}
                            </span>
                          )}

                          {p.preferredDoctorType && (
                            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium capitalize text-teal-700">
                              {p.preferredDoctorType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand control */}
                    <span
                      className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        expanded === p._id
                          ? "bg-slate-100 text-slate-700"
                          : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      }`}
                    >
                      {expanded === p._id
                        ? "Hide cases"
                        : "View cases"}

                      <span
                        className={`transition-transform ${
                          expanded === p._id
                            ? "rotate-180"
                            : ""
                        }`}
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                    </span>
                  </button>

                  {/* Cases */}
                  {expanded === p._id && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Case history
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Previous cases associated with this patient
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                          {cases.length}
                        </span>
                      </div>

                      {cases.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                          <p className="text-sm font-medium text-slate-600">
                            No cases on file.
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            There are no previous cases available for this
                            patient.
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {cases.map((c) => (
                            <li key={c._id}>
                              <Link
                                to={`/doctor/case/${c._id}`}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 transition group-hover:text-teal-700">
                                    {c.chiefComplaint}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {new Date(
                                      c.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                                  {c.status}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}