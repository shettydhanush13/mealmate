import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth, isVendor } from "./context";

/**
 * Layout guard for admin-only routes (vendors page, settings, non-food
 * inventory). Vendor-admins are redirected back to the dashboard.
 */
export default function FullAdminOnly() {
  const { profile } = useAdminAuth();
  if (isVendor(profile)) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
