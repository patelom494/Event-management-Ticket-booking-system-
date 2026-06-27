import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../services/api";
import { setToken } from "../auth/authService";

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

const inputStyle = {
  width: "100%", padding: "13px 16px",
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10, color: "#fff", fontSize: 14,
  outline: "none", transition: "border-color .2s",
};

export default function Login({ setIsAuthenticated, setUserData }) {
  const [data,     setData]     = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await login(data);
      if (res.data.success) {
        if (res.data.userData?.session?.role === "Admin") {
          toast.error("Admins must use the Admin Panel.");
          return;
        }
        setToken(res.data.token);
        setIsAuthenticated(true);
        setUserData(res.data.userData?.session || null);
        toast.success("Welcome back! 🎭");
        navigate("/");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Login failed!"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex" }}>
      <style>{SPIN}</style>

      {/* ── Left Panel (decorative) ── */}
      <div className="d-none d-lg-flex" style={{ flex: "0 0 45%", position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "url('/assets/images/banner-bg.jpg') center/cover", opacity: .12 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 60%, rgba(233,69,96,.25) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: 48, textAlign: "center" }}>
          <Link to="/" style={{ fontSize: 36, fontWeight: 900, color: "#fff", textDecoration: "none", display: "block", marginBottom: 32 }}>
            Art<em style={{ color: "#e94560" }}>Xibition</em>
          </Link>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 28, marginBottom: 14, lineHeight: 1.3 }}>Your Next Favourite Show Awaits</h2>
          <p style={{ color: "rgba(255,255,255,.55)", fontSize: 15, lineHeight: 1.8, maxWidth: 320, margin: "0 auto 36px" }}>
            Book tickets for the best live events, concerts, and cultural shows across India.
          </p>
          <div className="row g-3">
            {[
              { n: "500+", l: "Events" },
              { n: "50K+", l: "Attendees" },
              { n: "4.8★", l: "Rating" },
            ].map((s) => (
              <div key={s.l} className="col-4">
                <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 12, padding: "16px 8px", border: "1px solid rgba(255,255,255,.1)" }}>
                  <h4 style={{ color: "#e94560", fontWeight: 900, margin: "0 0 2px" }}>{s.n}</h4>
                  <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, margin: 0 }}>{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="d-lg-none text-center mb-6" style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 28, fontWeight: 900, color: "#fff", textDecoration: "none" }}>
              Art<em style={{ color: "#e94560" }}>Xibition</em>
            </Link>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, marginBottom: 6, fontSize: 26 }}>Welcome Back! 🎭</h3>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>Sign in to your account to book events and manage tickets</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Email Address</label>
              <input
                type="email" value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: "#e94560", textDecoration: "none", fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 16, padding: 0 }}
                >
                  <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "rgba(233,69,96,.6)" : "#e94560", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 24, boxShadow: "0 4px 20px rgba(233,69,96,.3)", transition: "all .25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                  Signing in...
                </>
              ) : "Sign In →"}
            </button>
          </form>

<div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <a
              href="https://event-management-ticket-booking-sys-three.vercel.app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 18px",
                background: "#1f2937",
                color: "#fff",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
                border: "1px solid rgba(233,69,96,.3)",
                transition: "transform .2s, background .2s",
              }}
            >
              Login as Admin
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            <span style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#e94560", fontWeight: 700, textDecoration: "none" }}>
              Create Account →
            </Link>
          </p>

          <p style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/" style={{ color: "rgba(255,255,255,.25)", fontSize: 13, textDecoration: "none" }}>
              <i className="fa fa-arrow-left me-1" />Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
