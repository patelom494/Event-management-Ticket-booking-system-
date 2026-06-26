import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { removeToken } from "../auth/authService";
export default function Navbar({ setIsAuthenticated, adminName }) {
  const navigate = useNavigate();
  const handleLogout = () => { removeToken(); setIsAuthenticated(false); toast.success("Logged out!"); navigate("/login"); };
  return (
    <nav className="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <div className="nav-item nav-link px-0 me-xl-6" onClick={() => document.documentElement.classList.toggle("layout-menu-expanded")} style={{cursor:"pointer"}}>
          <i className="icon-base bx bx-menu icon-md" />
        </div>
      </div>
      <div className="navbar-nav-right d-flex align-items-center justify-content-end w-100">
        <ul className="navbar-nav flex-row align-items-center ms-auto gap-2">
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle hide-arrow" href="#p" data-bs-toggle="dropdown">
              <div className="avatar avatar-online">
                <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#e94560,#c7253e)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:16}}>
                  {adminName?adminName.charAt(0).toUpperCase():"A"}
                </div>
              </div>
            </a>
            <ul className="dropdown-menu dropdown-menu-end m-0">
              <li><div className="dropdown-item-text px-4 py-2"><p className="mb-0 fw-semibold" style={{fontSize:14}}>{adminName||"Admin"}</p><small className="text-muted">Administrator</small></div></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="/profile"><i className="bx bx-user me-2" />My Profile</Link></li>
              <li><hr className="dropdown-divider" /></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
