import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePassword } from "../services/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) return toast.error("Passwords don't match!");
    if (newPass.length < 6) return toast.error("Min 6 characters!");
    setLoading(true);
    try {
      const res = await changePassword({ email, newPassword: newPass });
      if (res.data.success) { toast.success("Password reset! Please login."); navigate("/login"); }
    } catch (err) { toast.error(err.response?.data?.message || "Reset failed!"); }
    finally { setLoading(false); }
  };

  const inputStyle = { width:"100%", padding:"11px 16px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, color:"#fff", fontSize:14, outline:"none", marginBottom:14 };

  return (
    <div style={{ minHeight:"100vh", background:"#14141f", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 20px" }}>
      <div style={{ background:"rgba(255,255,255,.04)", borderRadius:16, padding:44, width:"100%", maxWidth:440, border:"1px solid rgba(255,255,255,.08)" }}>
        <div className="text-center mb-4">
          <Link to="/" style={{ fontSize:28, fontWeight:800, color:"#fff", textDecoration:"none" }}>Art<em style={{ color:"#e94560" }}>Xibition</em></Link>
        </div>
        <h4 style={{ color:"#fff", fontWeight:700, marginBottom:6, textAlign:"center" }}>{step===1 ? "Forgot Password 🔑" : "Set New Password 🔒"}</h4>
        <p style={{ color:"rgba(255,255,255,.4)", textAlign:"center", fontSize:14, marginBottom:28 }}>
          {step===1 ? "Enter your registered email" : `Resetting for: ${email}`}
        </p>
        <div className="d-flex gap-2 mb-4">
          {[1,2].map((s) => <div key={s} style={{ flex:1, height:4, borderRadius:2, background:s<=step?"#e94560":"rgba(255,255,255,.1)", transition:"background .3s" }} />)}
        </div>
        {step===1 ? (
          <div>
            <label style={{ color:"rgba(255,255,255,.6)", fontSize:13, marginBottom:6, display:"block" }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
            <button onClick={() => { if (!email) { toast.error("Enter email"); return; } setStep(2); }} style={{ width:"100%", padding:"13px", background:"#e94560", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
              Continue →
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <label style={{ color:"rgba(255,255,255,.6)", fontSize:13, marginBottom:6, display:"block" }}>New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 6 characters" required minLength={6} style={inputStyle} />
            <label style={{ color:"rgba(255,255,255,.6)", fontSize:13, marginBottom:6, display:"block" }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" required style={inputStyle} />
            {confirm && newPass !== confirm && <small style={{ color:"#e94560", display:"block", marginBottom:10 }}>✗ Passwords don't match</small>}
            <div className="d-flex gap-2">
              <button type="button" onClick={() => setStep(1)} style={{ flex:1, padding:"13px", background:"rgba(255,255,255,.1)", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}>Back</button>
              <button type="submit" disabled={loading} style={{ flex:2, padding:"13px", background:"#e94560", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
        <p style={{ textAlign:"center", color:"rgba(255,255,255,.4)", fontSize:13, marginTop:16 }}>
          <Link to="/login" style={{ color:"#e94560" }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
