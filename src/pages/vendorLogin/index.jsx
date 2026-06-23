import React from "react";
import Seo from "../../components/seo";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/adminAuth/LoginForm";
import { useAdminAuth, isVendor } from "../../components/adminAuth/context";
import "../../components/requireAdmin/styles.scss";

/**
 * Dedicated vendor sign-in at /vendor/login. Authenticates a vendor-admin and
 * sends them into their restricted portal (food & combos for their items).
 */
export default function VendorLogin() {
  const navigate = useNavigate();
  const { setProfile } = useAdminAuth();

  const onAuthed = (profile) => {
    setProfile(profile);
    // a full admin signing in here is logged in as admin (dashboard);
    // a vendor lands in their restricted portal.
    navigate(isVendor(profile) ? "/admin/inventory/food" : "/admin");
  };

  return (
    <div className="admin-gate">
      <Seo title="Vendor Sign In" path="/vendor/login" noindex />
      <LoginForm
        brand="CaterKart Vendor"
        subtitle="Enter your registered vendor phone number."
        onAuthed={onAuthed}
        altPrompt="Are you an admin?"
        altCta="Log in here"
        altTo="/admin"
      />
    </div>
  );
}
