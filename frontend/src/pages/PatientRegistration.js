import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PatientRegistration() {
  const [searchParams] = useSearchParams();
  const isSelf = searchParams.get("self") === "1";
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: isSelf ? user?.name || "" : "",
    age: "",
    gender: "",
    contactNumber: "",
    abhaId: "",
    address: "",
    preferredDoctorType: "",
  });

  const [error, setError] = useState("");
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
      const res = await api.post("/patients", {
        ...form,
        age: Number(form.age),
        isSelf,
      });
      navigate(`/case/${res.data.patient._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to register patient."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Page heading */}
        <div className="mb-7 sm:mb-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
            <span
              className="h-1.5 w-1.5 rounded-full bg-teal-500"
              aria-hidden="true"
            />
            Patient registration
          </div>

          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/20 sm:flex">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 20a7 7 0 0 1 14 0M19 8v6M22 11h-6"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {isSelf ? "Register yourself" : "Register a patient"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {isSelf
                  ? "Confirm your details to begin intake."
                  : "Enter the patient's details to begin intake."}
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {/* Card header */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
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
                <h2 className="text-sm font-bold text-slate-900">
                  Patient information
                </h2>
                <p className="text-xs text-slate-500">
                  Please provide accurate information for your consultation.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7">
            <div className="space-y-6">
              {/* Personal information */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Personal details
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="patient-name"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Full name
                      <span className="ml-1 text-teal-600" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <input
                      id="patient-name"
                      className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Enter full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="patient-age"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Age
                        <span
                          className="ml-1 text-teal-600"
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>

                      <input
                        id="patient-age"
                        type="number"
                        min="0"
                        max="130"
                        className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                        value={form.age}
                        onChange={update("age")}
                        placeholder="e.g. 25"
                        inputMode="numeric"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="patient-gender"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Gender
                        <span
                          className="ml-1 text-teal-600"
                          aria-hidden="true"
                        >
                          *
                        </span>
                      </label>

                      <select
                        id="patient-gender"
                        className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                        value={form.gender}
                        onChange={update("gender")}
                        required
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="patient-contact"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Contact number
                      <span className="ml-1 text-teal-600" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <input
                      id="patient-contact"
                      className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      value={form.contactNumber}
                      onChange={update("contactNumber")}
                      placeholder="Enter contact number"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Additional information */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Additional information
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="patient-abha"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      ABHA ID{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="patient-abha"
                      className="field-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      value={form.abhaId}
                      onChange={update("abhaId")}
                      placeholder="Enter ABHA ID if available"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      You can leave this blank if you don't have an ABHA ID.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="patient-address"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Address
                    </label>

                    <textarea
                      id="patient-address"
                      className="field-input min-h-[110px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      rows={2}
                      value={form.address}
                      onChange={update("address")}
                      placeholder="Enter your current address"
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Doctor preference */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    3
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Doctor preference
                  </h3>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Which type of doctor would you like to see?
                    <span className="ml-1 text-teal-600" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={
                        form.preferredDoctorType === "ayurvedic"
                      }
                      className={`group rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                        form.preferredDoctorType === "ayurvedic"
                          ? "border-teal-500 bg-teal-50 shadow-sm shadow-teal-500/10"
                          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          preferredDoctorType: "ayurvedic",
                        }))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                            form.preferredDoctorType === "ayurvedic"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21c4.5-3 7-6.25 7-10a7 7 0 0 0-14 0c0 3.75 2.5 7 7 10Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 7v7M9.5 11.5h5"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-bold ${
                              form.preferredDoctorType === "ayurvedic"
                                ? "text-teal-900"
                                : "text-slate-800"
                            }`}
                          >
                            Ayurvedic
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Traditional medicine consultation
                          </p>
                        </div>

                        {form.preferredDoctorType === "ayurvedic" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className="h-4 w-4"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 10 3 3 7-7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-pressed={
                        form.preferredDoctorType === "allopathic"
                      }
                      className={`group rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                        form.preferredDoctorType === "allopathic"
                          ? "border-teal-500 bg-teal-50 shadow-sm shadow-teal-500/10"
                          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          preferredDoctorType: "allopathic",
                        }))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                            form.preferredDoctorType === "allopathic"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v8M8 12h8"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-bold ${
                              form.preferredDoctorType === "allopathic"
                                ? "text-teal-900"
                                : "text-slate-800"
                            }`}
                          >
                            Allopathic
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Modern medicine consultation
                          </p>
                        </div>

                        {form.preferredDoctorType === "allopathic" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              className="h-4 w-4"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 10 3 3 7-7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Select your preferred type before continuing to the case
                    form.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
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
                    <p className="font-semibold">Unable to continue</p>
                    <p className="mt-0.5 leading-6 text-red-600/80">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-200 active:translate-y-0"
                  disabled={submitting || !form.preferredDoctorType}
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
                      Registering…
                    </>
                  ) : (
                    <>
                      Continue to case form
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
                  You'll be taken to the case form after registration.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Security note */}
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