import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import { logout } from "../services/api";
import { removeToken } from "../auth/authService";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function Header({ isAuthenticated, setIsAuthenticated, userData }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch { }
    removeToken();
    setIsAuthenticated(false);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const isActive = (p) => location.pathname === p ? "active" : "";

  return (
    <>
      {/* Pre-header */}
      <div className="pre-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-sm-6">
              <span>🎭 Live Events & Concerts – Book Your Tickets Now!</span>
            </div>
            <div className="col-lg-6 col-sm-6">
              <div className="text-button">
                <Link to="/contact">Contact Us Now! <i className="fa fa-arrow-right" /></Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`header-area header-sticky${scrolled ? " background-header" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav className="main-nav">
                <Link to="/" className="logo">Art<em>Xibition</em></Link>

                <ul className={`nav ${menuOpen ? "open" : ""}`}>
                  <li><Link to="/" className={isActive("/")}>Home</Link></li>
                  {/* <li><Link to="/events"  className={isActive("/events")}>Events</Link></li> */}
                  <li><Link to="/tickets" className={isActive("/tickets")}>Tickets</Link></li>
                  <li><Link to="/reviews" className={isActive("/reviews")}>Reviews</Link></li>
                  <li><Link to="/about" className={isActive("/about")}>About Us</Link></li>
                  <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>

                  {isAuthenticated ? (
                    <li className="position-relative" style={{ listStyle: "none" }}>
                      <NavDropdown
                        title={
                          <span style={{ color: "#000", fontSize: 14, fontWeight: 500 }}>
                            <i className="fa fa-user me-1" />
                            {userData?.name?.split(" ")[0] || "Account"}
                          </span>
                        }
                        id="user-nav-dropdown"
                        className="artx-dropdown"
                      >
                        <NavDropdown.Item as={Link} to="/profile">
                          <i className="fa fa-user me-2" />My Profile
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/my-bookings">
                          <i className="fa fa-ticket me-2" />My Bookings
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/my-complaints">
                          <i className="fa fa-exclamation-circle me-2" />My Complaints
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={handleLogout} className="text-danger">
                          <i className="fa fa-sign-out me-2" />Logout
                        </NavDropdown.Item>
                      </NavDropdown>
                    </li>
                  ) : (
                    <>
                      <li><Link to="/login" className={isActive("/login")}>Login</Link></li>
                      <li>
                        <Link to="/register" className="main-dark-button" style={{ padding: "8px 20px", borderRadius: 4, marginLeft: 8 }}>
                          Register
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                <button
                  className="menu-trigger"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span>Menu</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        .artx-dropdown .dropdown-toggle { background: none !important; border: none !important; padding: 0 !important; }
        .artx-dropdown .dropdown-toggle::after { display: none; }
        .artx-dropdown .dropdown-menu { background: #1a1a2e; border: 1px solid rgba(255,255,255,.1); min-width: 180px; }
        .artx-dropdown .dropdown-item { color: rgba(255,255,255,.8); font-size: 14px; }
        .artx-dropdown .dropdown-item:hover { background: rgba(233,69,96,.15); color: #e94560; }
        .artx-dropdown .dropdown-divider { border-color: rgba(255,255,255,.1); }
      `}</style>
    </>
  );
}
