import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleCredentials(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      setUserId(res.data.userId);
      setNotice("We've emailed you a 6-digit code.");
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/verify-otp", { userId, code });
      login(res.data.token, res.data.user);
      navigate(
        res.data.user.role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Incorrect or expired code."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");

    try {
      await api.post("/auth/resend-otp", { userId });
      setNotice("A new code has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to resend code."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">

          {/* Left Branding Section */}
          <div className="hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                M
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">
                MedQuanta
              </p>

              <h2 className="max-w-sm text-4xl font-bold leading-tight">
                Simple, secure access to your healthcare.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-teal-50/90">
                Sign in securely and continue managing your healthcare
                journey from one convenient place.
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-teal-50/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                ✓
              </span>

              Secure authentication
            </div>
          </div>

          {/* Login Section */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile Branding */}
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
                  {step === "credentials"
                    ? "Welcome back"
                    : "Two-step verification"}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {step === "credentials"
                    ? "Sign in to your account"
                    : "Verify your identity"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step === "credentials"
                    ? "Enter your details to securely continue."
                    : "Enter the 6-digit code we emailed you to finish signing in."}
                </p>
              </div>

              {/* Credentials Step */}
              {step === "credentials" ? (
                <form
                  onSubmit={handleCredentials}
                  className="space-y-5"
                >
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

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
                    className="btn-primary w-full rounded-xl bg-teal-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-teal-600/30 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting ? "Checking…" : "Continue"}
                  </button>
                </form>
              ) : (
                /* OTP Step */
                <form
                  onSubmit={handleVerify}
                  className="space-y-5"
                >
                  {/* OTP */}
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-slate-700"
                      htmlFor="code"
                    >
                      6-digit code
                    </label>

                    <input
                      id="code"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      className="field-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-semibold tracking-[0.45em] text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      value={code}
                      onChange={(e) =>
                        setCode(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      required
                    />
                  </div>

                  {/* Notice */}
                  {notice && (
                    <p
                      className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800"
                      role="status"
                    >
                      {notice}
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

                  {/* Verify */}
                  <button
                    type="submit"
                    className="btn-primary w-full rounded-xl bg-teal-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 hover:shadow-teal-600/30 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Verifying…"
                      : "Verify and sign in"}
                  </button>

                  {/* Resend */}
                  <button
                    type="button"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                    onClick={handleResend}
                  >
                    Resend code
                  </button>
                </form>
              )}

              {/* Signup */}
              <p className="mt-8 text-center text-sm text-slate-500">
                No account yet?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-teal-700 transition hover:text-teal-800 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                >
                  Sign up
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
