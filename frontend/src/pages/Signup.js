import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    medicalSystem: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/auth/register", { ...form, role });
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-10">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-700 ring-8 ring-teal-50/70">
              ✓
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              MedQuanta
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Account created
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your account has been created successfully. You can now log in
              and we'll email you a code to verify it's you.
            </p>

            <button
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
              onClick={() => navigate("/login")}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">

          {/* Left branding section */}
          <div className="hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                M
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">
                MedQuanta
              </p>

              <h2 className="max-w-sm text-4xl font-bold leading-tight">
                Your healthcare journey starts here.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-teal-50/90">
                Create a secure account and get started with a simpler,
                more organized healthcare experience.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-teal-50/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                  ✓
                </span>
                Secure account registration
              </div>

              <div className="flex items-center gap-3 text-sm text-teal-50/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                  ✓
                </span>
                Designed for patients and doctors
              </div>

              <div className="flex items-center gap-3 text-sm text-teal-50/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                  ✓
                </span>
                Simple and organized healthcare access
              </div>
            </div>
          </div>

          {/* Signup form */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile branding */}
              <div className="mb-8 lg:hidden">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/20">
                  M
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                  MedQuanta
                </p>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Get started
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Create an account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose the type of account you need and enter your details
                  below.
                </p>
              </div>

              {/* Account type selector */}
              <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    aria-pressed={role === "patient"}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                      role === "patient"
                        ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                    }`}
                    onClick={() => setRole("patient")}
                  >
                    <span className="block">Patient</span>
                    <span className="mt-0.5 block text-xs font-normal opacity-70">
                      For personal care
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={role === "doctor"}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                      role === "doctor"
                        ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                    }`}
                    onClick={() => setRole("doctor")}
                  >
                    <span className="block">Doctor</span>
                    <span className="mt-0.5 block text-xs font-normal opacity-70">
                      For clinical access
                    </span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Full name */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="name"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={form.name}
                    onChange={update("name")}
                    required
                  />
                </div>

                {/* Doctor fields */}
                {role === "doctor" && (
                  <>
                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="medicalSystem"
                      >
                        System of medicine
                      </label>

                      <select
                        id="medicalSystem"
                        className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                        value={form.medicalSystem}
                        onChange={update("medicalSystem")}
                        required
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="ayurvedic">
                          Ayurvedic
                        </option>
                        <option value="allopathic">
                          Allopathic
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="specialization"
                      >
                        Specialization
                      </label>

                      <input
                        id="specialization"
                        className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                        value={form.specialization}
                        onChange={update("specialization")}
                        placeholder="e.g. General Medicine"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={form.email}
                    onChange={update("email")}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    value={form.password}
                    onChange={update("password")}
                    minLength={6}
                    required
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Password must be at least 6 characters.
                  </p>
                </div>

                {/* Patient information */}
                {role === "patient" && (
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                    Patient accounts can register up to 10 people
                    (yourself and others) per week.
                  </p>
                )}

                {/* Error */}
                {error && (
                  <p
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary w-full rounded-xl bg-teal-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating account…"
                    : `Create ${role} account`}
                </button>
              </form>

              {/* Login */}
              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 transition hover:text-teal-800 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
