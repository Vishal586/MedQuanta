import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">

            {/* Brand / Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 px-6 py-12 text-white sm:px-10 sm:py-14 lg:flex lg:min-h-[560px] lg:flex-col lg:justify-between lg:px-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />

              <div className="relative">
                {/* Logo */}
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                  M
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">
                  MedQuanta
                </p>

                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Healthcare made simpler.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-teal-50/90 sm:text-lg">
                  Structured intake before you even see the doctor — for
                  patients and clinicians alike.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="relative mt-10 space-y-4 lg:mt-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold ring-1 ring-white/10">
                    ✓
                  </span>
                  <span className="text-sm text-teal-50/90">
                    Streamlined patient intake
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold ring-1 ring-white/10">
                    ✓
                  </span>
                  <span className="text-sm text-teal-50/90">
                    Organized clinical information
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold ring-1 ring-white/10">
                    ✓
                  </span>
                  <span className="text-sm text-teal-50/90">
                    One place for patients and doctors
                  </span>
                </div>
              </div>
            </section>

            {/* Action Section */}
            <section className="flex items-center px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
              <div className="w-full max-w-md mx-auto">

                {/* Mobile logo */}
                <div className="mb-8 lg:hidden">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold text-white shadow-lg shadow-teal-600/20">
                    M
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                    MedQuanta
                  </p>
                </div>

                <div className="mb-8">
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Get started
                  </span>

                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Welcome to MedQuanta
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                    Choose an option below to continue. Patients can prepare
                    their intake information, while doctors can securely
                    access submitted cases.
                  </p>
                </div>

                {/* Buttons */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/login"
                    className="btn-primary inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    className="btn-secondary inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                  >
                    Sign up
                  </Link>
                </div>

                {/* Information cards */}
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">
                        P
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        For patients
                      </h3>

                      <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        Register and fill out your intake form ahead of your
                        visit.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-sm font-bold text-cyan-700">
                        D
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        For doctors
                      </h3>

                      <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        Log in to review submitted patient cases in one
                        place.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer message */}
                <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                  Secure access for patients and clinicians
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
