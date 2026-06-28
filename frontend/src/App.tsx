import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/auth";
import BusinessSetup from "@/pages/BusinessSetup";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasToken = Boolean(localStorage.getItem("access_token"));
  if (!hasToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Routed() {
  useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/business-setup"
        element={
          <ProtectedRoute>
            <BusinessSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
