import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a route with this to require login. Pass `roles` to also restrict
// by account type, e.g. <ProtectedRoute roles={["doctor"]}>.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-muted">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
