import { createContext, useContext, useState } from "react";

/**
 * In-memory admin auth. Holds the logged-in admin's profile
 * ({ isAdmin, type: 'admin'|'vendor', vendorName, name, phone }).
 * Intentionally NOT persisted — a page refresh clears it, so the user must
 * log in again. No tokens, no session/local storage.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const logout = () => setProfile(null);
  return (
    <AdminAuthContext.Provider value={{ profile, setProfile, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext) || { profile: null, setProfile: () => {}, logout: () => {} };
}

export const isVendor = (p) => p?.type === "vendor";
export const isFullAdmin = (p) => p?.isAdmin && p?.type !== "vendor";
