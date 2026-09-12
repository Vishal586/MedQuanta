import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/patients/mine")
      .then((res) => setData(res.data))
      .catch(() => setError("Unable to load your registrations."));
  }, []);

  const atLimit = data && data.remaining <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s-7-4.35-7-10.25A4.75 4.75 0 0 1 9.75 6c1.05 0 1.98.4 2.25 1.05C12.27 6.4 13.2 6 14.25 6A4.75 4.75 0 0 1 19 10.75C19 16.65 12 21 12 21Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v5M9.5 11.5h5"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                MedQuanta
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Your healthcare dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200 active:scale-[0.98]"
            onClick={logout}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17l5-5-5-5M20 12H9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"
              />
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Welcome section */}
        <section className="mb-7">
          <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-xl shadow-teal-600/15 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-50 ring-1 ring-white/15">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                    aria-hidden="true"
                  />
                  Patient portal
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome, {user?.name}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50 sm:text-base">
                  Manage your registered patients and complete their medical
                  intake details before your visit.
                </p>
              </div>

              <div className="hidden shrink-0 sm:block">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-10 w-10 text-white"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 21a8 8 0 0 0-16 0"
                    />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
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
              <p className="font-semibold">Unable to load your data</p>
              <p className="mt-0.5 text-red-600/80">{error}</p>
            </div>
          </div>
        )}

        {/* Registration usage */}
        {data && (
          <section className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
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
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="9" cy="7" r="4" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 8v6M22 11h-6"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Weekly registrations
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {data.used}
                      </span>{" "}
                      of {data.limit} registrations used
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-2 text-left sm:text-right">
                  <p className="text-xs font-medium text-slate-400">
                    Remaining
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      atLimit ? "text-red-600" : "text-teal-600"
                    }`}
                  >
                    {Math.max(0, data.remaining)}
                  </p>
                </div>
              </div>

              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"
                aria-label={`${data.used} of ${data.limit} weekly registrations used`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.used / data.limit) * 100
                    )}%`,
                  }}
                />
              </div>

              {atLimit && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6v4m0 3h.01M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                    />
                  </svg>

                  <p className="text-xs leading-5 text-amber-800">
                    <span className="font-bold">Limit reached.</span>{" "}
                    Registrations reset{" "}
                    {new Date(data.resetsAt).toLocaleDateString()}.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Registration actions */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Add a patient
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register yourself or someone you are managing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/patient/register?self=1"
              className={`group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10 focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                atLimit ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition group-hover:bg-teal-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 20a7 7 0 0 1 14 0M19 8v5M16.5 10.5h5"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">
                    Register myself
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add your own patient profile
                  </p>
                </div>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>
              </div>
            </Link>

            <Link
              to="/patient/register"
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                atLimit ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-slate-200">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="8" r="3.5" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M22 11h-6"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">
                    Register someone else
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add a family member or patient
                  </p>
                </div>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Registered patients */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Registered patients
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage your registered patient cases.
              </p>
            </div>

            {data && data.patients.length > 0 && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 sm:inline-flex">
                {data.patients.length}{" "}
                {data.patients.length === 1 ? "patient" : "patients"}
              </span>
            )}
          </div>

          {!data || data.patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 20a7 7 0 0 1 14 0"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No patients registered yet
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                Register a patient above to start completing their medical
                intake information.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
              <ul className="divide-y divide-slate-100">
                {data.patients.map((p) => (
                  <li
                    key={p._id}
                    className="group p-4 transition hover:bg-slate-50/80 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 text-sm font-bold text-teal-700">
                          {p.name
                            ?.split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-bold text-slate-900">
                              {p.name}
                            </p>

                            {p.isSelf && (
                              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                                You
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {p.age} yrs · {p.gender}
                            {p.preferredDoctorType && (
                              <span className="capitalize">
                                {" "}
                                · {p.preferredDoctorType}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/case/${p._id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-200 sm:shrink-0"
                      >
                        Fill / view case
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="ml-2 h-4 w-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 18 6-6-6-6"
                          />
                        </svg>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          MedQuanta · Secure patient intake
        </footer>
      </main>
    </div>
  );
}
