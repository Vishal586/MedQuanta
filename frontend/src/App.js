import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRegistration from "./pages/PatientRegistration";
import CaseForm from "./pages/CaseForm";
import DoctorDashboard from "./pages/DoctorDashboard";
import CaseDetail from "./pages/CaseDetail";
import PatientSearch from "./pages/PatientSearch";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient-facing flow */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/register"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/case/:patientId"
            element={
              <ProtectedRoute roles={["patient"]}>
                <CaseForm />
              </ProtectedRoute>
            }
          />

          {/* Doctor-facing flow */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/case/:id"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <CaseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <PatientSearch />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}