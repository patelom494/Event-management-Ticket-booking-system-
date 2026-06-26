import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../auth/authService";
import { toast } from "react-toastify";
const menuItems = [
  { to: "/", icon: "bx bx-home-smile", label: "Dashboard" },
  { to: "/manage-categories", icon: "bx bx-category", label: "Categories" },
  { to: "/manage-events", icon: "bx bx-calendar-event", label: "Events" },
  { to: "/manage-bookings", icon: "bx bx-calendar-event", label: "Bookings" },
  { to: "/manage-users", icon: "bx bx-user", label: "Users" },
  { to: "/manage-payments", icon: "bx bx-credit-card", label: "Payments" },
  { to: "/manage-reviews", icon: "bx bx-star", label: "Reviews" },
  { to: "/manage-complaints", icon: "bx bx-message-error", label: "Complaints" },
  { to: "/profile", icon: "bx bx-user-circle", label: "Admin Profile" },
];

export default function Sidebar({ setIsAuthenticated, adminName }) {
  const { pathname } = useLocation();
  let navigate = useNavigate();
  const handleLogout = () => { removeToken(); setIsAuthenticated(false); toast.success("Logged out!"); navigate("/login"); };

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo">
        <Link to="/" className="app-brand-link gap-2">
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#e94560,#c7253e)", color: "#fff", fontSize: 16, fontWeight: 800 }}>🎭</span>
          <span className="app-brand-text demo fw-bold ms-2" style={{ fontSize: 16 }}>ArtXibition</span>
        </Link>
        <div className="layout-menu-toggle menu-link text-large ms-auto d-xl-none" onClick={() => document.documentElement.classList.remove("layout-menu-expanded")}>
          <i className="bx bx-chevron-left bx-sm" />
        </div>
      </div>
      <div className="menu-inner-shadow" />
      <ul className="menu-inner py-1">
        {menuItems.map((item) => (
          <li key={item.to} className={`menu-item${pathname === item.to ? " active" : ""}`}>
            <Link to={item.to} className={`menu-link${pathname === item.to ? " active" : ""}`}>
              <i className={`menu-icon icon-base ${item.icon}`} />
              <div>{item.label}</div>
            </Link>
          </li>
        ))}
        <li className="menu-item">
          <Link className="menu-link" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <i className="bx bx-power-off me-2" />Logout
          </Link>

        </li>
      </ul>

    </aside >
  );
}
