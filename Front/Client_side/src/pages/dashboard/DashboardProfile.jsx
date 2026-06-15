import React from "react";
import { useAuth } from "../../context/AuthContext";

function accountRoleLabel(role) {
  if (role === "shipper") return "Shipper";
  if (role === "retailer") return "Retailer";
  return "Client";
}

export function DashboardProfile() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1 className="vf-account-title">Profile</h1>
      <div className="vf-account-profile-card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user?.name || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "—"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{user?.phone || "—"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{user?.address || "—"}</dd>
          </div>
          <div>
            <dt>Account type</dt>
            <dd>{accountRoleLabel(user?.role)}</dd>
          </div>
          {user?.company_name && (
            <div>
              <dt>Company</dt>
              <dd>{user.company_name}</dd>
            </div>  
          )}
          {user?.role === "retailer" && (
            <div>
              <dt>Retailer status</dt>
              <dd style={{ textTransform: "capitalize" }}>{user.retailer_status || "pending"}</dd>
            </div>
          )}
        </dl>
        <button type="button" className="vf-account-signout" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
