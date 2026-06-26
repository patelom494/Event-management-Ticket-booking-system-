import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signup } from "../services/api";

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

const inputStyle = {
  width: "100%", padding: "12px 16px",
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10, color: "#fff", fontSize: 14,
  outline: "none", transition: "border-color .2s",
};

const FIELDS = [
  { k: "name",     l: "Full Name",     t: "text",     p: "John Doe",          icon: "fa-user"     },
  { k: "email",    l: "Email Address", t: "email",    p: "you@example.com",   icon: "fa-envelope" },
  { k: "phone_no", l: "Phone Number",  t: "tel",      p: "9876543210",        icon: "fa-phone"    },
  { k: "address",  l: "City / Address",t: "text",     p: "Ahmedabad, Gujarat",icon: "fa-map-marker"},
  { k: "password", l: "Password",      t: "password", p: "Min 6 characters",  icon: "fa-lock"     },
];

export default function Register() {
  const [data,    setData]    = useState({ name: "", email: "", phone_no: "", address: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass,setShowPass]= useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await signup(data);
      if (res.data.success) {
        toast.success("Account created! Please login.");
        navigate("/login");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Registration failed!"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex" }}>
      <style>{SPIN}</style>

      {/* ── Left Panel ── */}
      <div className="d-none d-lg-flex" style={{ flex: "0 0 40%", position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "url('/assets/images/banner-bg.jpg') center/cover", opacity: .1 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 40%, rgba(233,69,96,.2) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: 48, textAlign: "center" }}>
          <Link to="/" style={{ fontSize: 32, fontWeight: 900, color: "#fff", textDecoration: "none", display: "block", marginBottom: 28 }}>
            Art<em style={{ color: "#e94560" }}>Xibition</em>
          </Link>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 26, marginBottom: 12, lineHeight: 1.3 }}>Join India's Biggest Event Community</h2>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.8, maxWidth: 300, margin: "0 auto 32px" }}>
            Get access to exclusive events, early bird offers, and seamless ticket booking.
          </p>
          <div className="d-flex flex-column gap-3 text-start">
            {[
              { icon: "fa-check-circle", text: "Instant booking confirmation" },
              { icon: "fa-check-circle", text: "Secure Razorpay payments"     },
              { icon: "fa-check-circle", text: "Easy cancellation & refunds"  },
              { icon: "fa-check-circle", text: "Exclusive event updates"       },
            ].map((item) => (
              <div key={item.text} className="d-flex align-items-center gap-3">
                <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 16 }} />
                <span style={{ color: "rgba(255,255,255,.65)", fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div className="d-lg-none text-center mb-6" style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 28, fontWeight: 900, color: "#fff", textDecoration: "none" }}>
              Art<em style={{ color: "#e94560" }}>Xibition</em>
            </Link>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#fff", fontWeight: 800, marginBottom: 6, fontSize: 26 }}>Create Account ⚡</h3>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>Join thousands of event lovers — it's free!</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {FIELDS.map((f) => (
                <div key={f.k} className={f.k === "address" || f.k === "password" ? "col-12" : "col-md-6"}>
                  <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>
                    {f.l}
                  </label>
                  <div style={{ position: "relative" }}>
                    <i className={`fa ${f.icon}`} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.25)", fontSize: 14 }} />
                    <input
                      type={f.k === "password" && showPass ? "text" : f.t}
                      value={data[f.k]}
                      onChange={(e) => setData({ ...data, [f.k]: e.target.value })}
                      required placeholder={f.p}
                      style={{ ...inputStyle, paddingLeft: 40, paddingRight: f.k === "password" ? 44 : 16 }}
                      onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                      onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                      minLength={f.k === "password" ? 6 : undefined}
                    />
                    {f.k === "password" && (
                      <button
                        type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", padding: 0 }}
                      >
                        <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ color: "rgba(255,255,255,.3)", fontSize: 12, margin: "14px 0 20px" }}>
              By registering you agree to our{" "}
              <span style={{ color: "#e94560", cursor: "pointer" }}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: "#e94560", cursor: "pointer" }}>Privacy Policy</span>.
            </p>

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "rgba(233,69,96,.6)" : "#e94560", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(233,69,96,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,.4)", fontSize: 14, marginTop: 24, marginBottom: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#e94560", fontWeight: 700, textDecoration: "none" }}>
              Sign In →
            </Link>
          </p>

          <p style={{ textAlign: "center", marginTop: 24 }}>
            <Link to="/" style={{ color: "rgba(255,255,255,.25)", fontSize: 13, textDecoration: "none" }}>
              <i className="fa fa-arrow-left me-1" />Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
