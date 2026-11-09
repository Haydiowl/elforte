import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../lib/auth";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
