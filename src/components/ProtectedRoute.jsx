import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const {
    user,
    loading
  } = useAuth();

  // Firebase is checking the current session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but email isn't verified
  if (!user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );
  }

  // Everything is okay
  return children;
}

export default ProtectedRoute;