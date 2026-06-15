import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faTag,
  faStore,
  faEnvelope,
  faCircleQuestion,
  faPlus,
  faBars,
  faTimes,
  faClipboardList,
  faUsers,
  faTruck,
  faCreditCard,
  faChartLine,
  faRightFromBracket,
  faCrown,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/verdalis-foods-logo.png";
import "../assets/css/AdminNav.css";

const mainNavItems = [
  { path: "/admin/analytics", label: "Analytics", icon: faChartLine },
  { path: "/admin/orders", label: "Orders", icon: faClipboardList },
  { path: "/admin/clients", label: "Clients", icon: faUsers },
  { path: "/admin/admins", label: "Admins", icon: faUserShield },
  { path: "/admin/shippers", label: "Shippers", icon: faTruck },
  { path: "/admin/payments", label: "Payments", icon: faCreditCard },
  { path: "/admin/products", label: "Products", icon: faBox },
  { path: "/admin/categories", label: "Categories", icon: faTag },
  { path: "/admin/stores", label: "Stores", icon: faStore },
  { path: "/admin/contact-messages", label: "Contact Messages", icon: faEnvelope },
  { path: "/admin/questions", label: "Questions", icon: faCircleQuestion },
];

const managementNavItems = [
  { path: "/admin/add-admin", label: "Add admin", icon: faPlus },
  { path: "/admin/add-shipper", label: "Add shipper", icon: faPlus },
  { path: "/admin/add-product", label: "Add product", icon: faPlus },
  { path: "/admin/add-store", label: "Add store", icon: faPlus },
  { path: "/admin/add-category", label: "Add category", icon: faPlus },
];

export function AdminNav({ open: controlledOpen, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();
  const isControlled = controlledOpen !== undefined;
  const menuOpen = isControlled ? controlledOpen : internalOpen;
  const closeMenu = isControlled ? (onClose || (() => {})) : () => setInternalOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          className="admin-nav-toggle"
          onClick={() => setInternalOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      )}
      {menuOpen && (
        <button type="button" className="admin-nav-overlay" aria-label="Close menu" onClick={closeMenu} />
      )}
      <aside className={`admin-nav ${menuOpen ? "admin-nav-open" : ""}`}>
        <div className="admin-nav-inner">
          <Link to="/admin/analytics" className="admin-nav-brand" onClick={closeMenu}>
            <img src={logo} alt="" className="admin-nav-brand-img" />
            <div className="admin-nav-brand-text">
              <span className="admin-nav-brand-name">VERDALIS FOODS</span>
              <span className="admin-nav-brand-tag">Wholesale &amp; Distribution</span>
            </div>
          </Link>

          <nav className="admin-nav-links" aria-label="Main navigation">
            {mainNavItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`admin-nav-link ${isActive(path) ? "admin-nav-link-active" : ""}`}
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={icon} className="admin-nav-link-icon" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="admin-nav-section">
            <span className="admin-nav-section-label">Management</span>
            {managementNavItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`admin-nav-link admin-nav-link--mgmt ${isActive(path) ? "admin-nav-link-active" : ""}`}
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={icon} className="admin-nav-link-icon" />
                {label}
              </Link>
            ))}
          </div>

          {/* <div className="admin-nav-upgrade">
            <FontAwesomeIcon icon={faCrown} className="admin-nav-upgrade-icon" />
            <p className="admin-nav-upgrade-title">Upgrade to Pro</p>
            <p className="admin-nav-upgrade-desc">Unlock advanced analytics and exports</p>
            <button type="button" className="admin-nav-upgrade-btn">Upgrade Now</button>
          </div> */}

          <Link to="/admin/login" className="admin-nav-logout" onClick={closeMenu}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
