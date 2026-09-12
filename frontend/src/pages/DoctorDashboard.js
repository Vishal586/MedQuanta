import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
];

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showAllSystems, setShowAllSystems] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Debounce search so we're not firing a request on every keystroke.
    const timeout = setTimeout(() => {
      api
        .get("/cases", {
          params: {
            status: status || undefined,
            search: search || undefined,
            doctorType: showAllSystems ? "all" : undefined,
            page,
          },
        })
        .then((res) => {
          setCases(res.data.cases);
          setPages(res.data.pages);
          setTotal(res.data.total);
        })
        .catch(() => setError("Unable to load cases."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [status, search, showAllSystems, page]);

  function handleStatusChange(value) {
    setStatus(value);
    setPage(1);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white shadow-md shadow-teal-600/20">
                  M
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  MedQuanta
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>
                  Welcome, Dr.{" "}
                  <span className="font-semibold text-slate-700">
                    {user?.name}
                  </span>
                </span>

                {user?.medicalSystem && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold capitalize text-teal-700">
                      {user.medicalSystem}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to="/doctor/patients"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              >
                Search patients
              </Link>

              <button
                className="btn-secondary inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/10"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="space-y-6">

          {/* Page heading */}
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Clinical workspace
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Case dashboard
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Review and manage submitted patient cases.
            </p>
          </div>

          {/* Filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">

              {/* Status tabs */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Case status
                </p>

                <div
                  className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-fit"
                  role="tablist"
                  aria-label="Case status"
                >
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={status === tab.value}
                      className={`min-w-[90px] rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                        status === tab.value
                          ? "bg-white text-teal-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      onClick={() => handleStatusChange(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and system filter */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xl">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    ⌕
                  </span>

                  <input
                    aria-label="Search cases"
                    className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    placeholder="Search by patient name, phone, or ABHA ID"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    checked={showAllSystems}
                    onChange={(e) => {
                      setShowAllSystems(e.target.checked);
                      setPage(1);
                    }}
                  />

                  <span>Show all systems</span>
                </label>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
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

          {/* Cases */}
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />

                <p className="text-sm font-semibold text-slate-700">
                  Loading cases…
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest patient records.
                </p>
              </div>
            </section>
          ) : cases.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
                ✓
              </div>

              <h3 className="text-base font-bold text-slate-800">
                No cases found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There are no cases matching your current filters.
                Try changing the status or search criteria.
              </p>
            </section>
          ) : (
            <>
              {/* Results header */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Patient cases
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {total} {total === 1 ? "case" : "cases"} total
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    {status
                      ? status.charAt(0).toUpperCase() + status.slice(1)
                      : "All cases"}
                  </span>
                </div>

                {/* Case list */}
                <ul className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <li key={c._id}>
                      <Link
                        to={`/doctor/case/${c._id}`}
                        className="group block px-5 py-5 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-teal-500/10 sm:px-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          {/* Case information */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900 transition group-hover:text-teal-700">
                                {c.patient?.name}
                              </p>

                              <span className="text-sm text-slate-400">
                                {c.patient?.age} yrs
                              </span>

                              <span className="text-sm text-slate-300">
                                ·
                              </span>

                              <span className="text-sm capitalize text-slate-400">
                                {c.patient?.gender}
                              </span>

                              {c.urgent && (
                                <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                  Urgent
                                </span>
                              )}

                              {showAllSystems &&
                                c.patient?.preferredDoctorType && (
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium capitalize text-slate-500">
                                    {c.patient.preferredDoctorType}
                                  </span>
                                )}
                            </div>

                            <p className="text-sm leading-6 text-slate-500">
                              {c.chiefComplaint}
                            </p>
                          </div>

                          {/* Status */}
                          <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                c.status === "reviewed"
                                  ? "border-teal-100 bg-teal-50 text-teal-700"
                                  : "border-amber-100 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {c.status}
                            </span>

                            <span className="text-xs font-semibold text-slate-400 transition group-hover:text-teal-600">
                              View case →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Pagination */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="text-sm text-slate-500">
                  Showing page{" "}
                  <span className="font-semibold text-slate-700">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pages}
                  </span>
                </span>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <button
                    className="btn-secondary rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </button>

                  <span className="hidden rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 sm:inline-flex">
                    Page {page} of {pages}
                  </span>

                  <button
                    className="btn-secondary rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
