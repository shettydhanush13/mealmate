import { createContext, useContext, useState } from "react";
import { clearToken } from "../../services/authToken";

/**
 * In-memory admin auth. Holds the logged-in admin's profile
 * ({ isAdmin, type: 'admin'|'vendor', vendorName, name, phone }).
 * The profile itself is NOT persisted — a page refresh clears it, so the user
 * must log in again. The JWT (used to authenticate API calls) lives in
 * localStorage and is cleared on logout.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const logout = () => { clearToken(); setProfile(null); };
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
