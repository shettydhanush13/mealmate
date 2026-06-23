import Seo from "../seo";
import { Outlet } from "react-router-dom";
import AdminHeader from "../adminHeader";
import LoginForm from "../adminAuth/LoginForm";
import { useAdminAuth } from "../adminAuth/context";
import "./styles.scss";

/**
 * Gate for all /admin routes. Verifies the phone is a registered admin (DB),
 * then a real OTP via SMS. Auth lives only in memory (refresh = re-login).
 * Both full admins and vendor-admins enter here; the UI is restricted by role.
 */
export default function RequireAdmin() {
  const { profile, setProfile, logout } = useAdminAuth();

  if (profile?.isAdmin) {
    return (
      <div className="admin-shell">
        <AdminHeader onLogout={logout} profile={profile} />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="admin-gate">
      <Seo title="Admin Sign In" path="/admin" noindex />
      <LoginForm
        brand="CaterKart Admin"
        subtitle="Enter your registered admin phone number."
        onAuthed={setProfile}
        altPrompt="Are you a vendor?"
        altCta="Log in here"
        altTo="/vendor/login"
      />
    </div>
  );
}
