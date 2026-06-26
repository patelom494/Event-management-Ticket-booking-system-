import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeToken } from "../auth/authService";
import { logout } from "../services/api";
import { toast } from "react-toastify";

export default function Footer({ isAuthenticated, setIsAuthenticated, userData }) {
  let navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
    } catch { }
    removeToken();
    setIsAuthenticated(false);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <footer style={{ background: "#14141f", color: "rgba(255,255,255,.6)", padding: "60px 0 0" }}>
      <div className="container">
        <div className="row gy-5">
          <div className="col-lg-4">
            <Link to="/" style={{ color: "#fff", fontSize: 28, fontWeight: 800, textDecoration: "none" }}>
              Art<em style={{ color: "#e94560" }}>Xibition</em>
            </Link>
            <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.8 }}>
              India's premier live event and concert platform. Discover, book, and experience unforgettable shows.
            </p>
            <div className="d-flex gap-3 mt-3">
              {["facebook", "twitter", "instagram", "youtube"].map((s) => (
                <a key={s} href={`#${s}`} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.6)", transition: "all .3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.color = "#e94560"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}>
                  <i className={`fa fa-${s}`} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-sm-6">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1, fontSize: 13 }}>Quick Links</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[{ l: "Home", p: "/" }, { l: "Events", p: "/events" }, { l: "Tickets", p: "/tickets" }, { l: "Reviews", p: "/reviews" }, { l: "About", p: "/about" }].map((i) => (
                <li key={i.l} style={{ marginBottom: 10 }}>
                  <Link to={i.p} style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: 14, transition: "color .3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#e94560"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}>
                    <i className="fa fa-angle-right me-2" />{i.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3 col-sm-6">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1, fontSize: 13 }}>My Account</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {
                isAuthenticated ?
                  <li style={{ marginBottom: 10 }}>
                    <Link onClick={handleLogout} style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: 14, transition: "color .3s" }}>
                      <i className="fa fa-angle-right me-2" />Logout
                    </Link>
                  </li>
                  :

                  (<>
                    <li style={{ marginBottom: 10 }}>
                      <Link to="/register" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: 14, transition: "color .3s" }}>
                        <i className="fa fa-angle-right me-2" />Register
                      </Link>
                    </li>

                    <li style={{ marginBottom: 10 }}>
                      <Link to="/register" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: 14, transition: "color .3s" }}>
                        <i className="fa fa-angle-right me-2" />Login
                      </Link>
                    </li>

                  </>)
              }
              {[{ l: "My Bookings", p: "/my-bookings" }, { l: "My Profile", p: "/profile" }, { l: "Contact Us", p: "/contact" }].map((i) => (
                <li key={i.l} style={{ marginBottom: 10 }}>
                  <Link to={i.p} style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: 14, transition: "color .3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#e94560"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}>
                    <i className="fa fa-angle-right me-2" />{i.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1, fontSize: 13 }}>Contact Info</h6>
            <div className="d-flex flex-column gap-3" style={{ fontSize: 14 }}>
              <div><i className="fa fa-map-marker me-2" style={{ color: "#e94560" }} />Navrangpura, Ahmedabad, Gujarat</div>
              <div><i className="fa fa-phone me-2" style={{ color: "#e94560" }} />+91-12345-67890</div>
              <div><i className="fa fa-envelope me-2" style={{ color: "#e94560" }} />support@artxibition.in</div>
              <div><i className="fa fa-clock-o me-2" style={{ color: "#e94560" }} />Mon–Sat: 9:00 AM – 6:00 PM</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 40, padding: "20px 0", textAlign: "center", fontSize: 13 }}>
        <div className="container">
          © {new Date().getFullYear()} ArtXibition. All rights reserved. | Events & Ticket Platform
        </div>
      </div>
    </footer>
  );
}
