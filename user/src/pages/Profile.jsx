import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfile, updateProfile, changePassword, myBookings } from "../services/api";

const BACKEND = "http://localhost:8000";
const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

const inputStyle = {
  width: "100%", padding: "11px 16px",
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 8, color: "#fff", fontSize: 14, outline: "none",
};
const roStyle = {
  ...inputStyle,
  background: "rgba(255,255,255,.02)",
  color: "rgba(255,255,255,.4)", cursor: "not-allowed",
};

export default function Profile({ userData, setUserData }) {
  const [profile,     setProfile]     = useState(null);
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("info");
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [imageFile,   setImageFile]   = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [form,        setForm]        = useState({ name: "", phone_no: "", address: "" });
  const [passForm,    setPassForm]    = useState({ newPassword: "", confirmPassword: "" });
  const [changingPass,setChangingPass]= useState(false);
  const [showPass,    setShowPass]    = useState({ new: false, confirm: false });

  const fetchAll = async () => {
    try {
      const [pRes, bRes] = await Promise.all([getProfile(), myBookings()]);
      const d = pRes.data.data;
      setProfile(d);
      setForm({ name: d.name || "", phone_no: d.phone_no || "", address: d.address || "" });
      setBookings(bRes.data.data || []);
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e) => {
    e?.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone_no", form.phone_no);
      fd.append("address", form.address);
      if (imageFile) fd.append("profile_pic", imageFile);
      const r = await updateProfile(fd);
      if (r.data.success) {
        toast.success("Profile updated successfully!");
        setEditing(false); setImageFile(null); setPreview(null);
        fetchAll();
        setUserData((prev) => ({ ...prev, name: form.name }));
      }
    } catch (err) { toast.error(err.response?.data?.message || "Update failed!"); }
    finally { setSaving(false); }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error("Passwords don't match!");
    if (passForm.newPassword.length < 6) return toast.error("Min 6 characters!");
    setChangingPass(true);
    try {
      const r = await changePassword({ email: profile.email, newPassword: passForm.newPassword });
      if (r.data.success) { toast.success("Password changed successfully!"); setPassForm({ newPassword: "", confirmPassword: "" }); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to change password"); }
    finally { setChangingPass(false); }
  };

  const avatarSrc = preview
    ? preview
    : profile?.profile_pic
      ? `${BACKEND}${profile.profile_pic}`
      : null;

  // Stats from bookings
  const totalBookings  = bookings.length;
  const paidBookings   = bookings.filter((b) => b.payment_status === "Success").length;
  const totalSpent     = bookings.filter((b) => b.payment_status === "Success").reduce((s, b) => s + (b.total_price || 0), 0);
  const activeBookings = bookings.filter((b) => b.status === "Booked").length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{SPIN}</style>
      <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading profile...</p>
    </div>
  );

  const TABS = [
    { key: "info",     label: "Account Info",       icon: "fa-user"    },
    { key: "password", label: "Change Password",    icon: "fa-lock"    },
    { key: "activity", label: "My Activity",        icon: "fa-history" },
  ];

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
        padding: "80px 0 40px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%, rgba(233,69,96,.1) 0%, transparent 60%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "#fff", fontWeight: 800, margin: "0 0 4px", fontSize: 28 }}>My Profile</h2>
          <p style={{ color: "rgba(255,255,255,.4)", margin: 0, fontSize: 14 }}>
            <Link to="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Home</Link>
            <i className="fa fa-angle-right mx-2" style={{ fontSize: 11 }} />
            My Profile
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: "#111827", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "20px 0" }}>
        <div className="container">
          <div className="row g-0">
            {[
              { label: "Total Bookings",  value: totalBookings,                  icon: "fa-ticket",       color: "#e94560" },
              { label: "Paid Bookings",   value: paidBookings,                   icon: "fa-check-circle", color: "#28a745" },
              { label: "Active Bookings", value: activeBookings,                  icon: "fa-calendar",     color: "#17a2b8" },
              { label: "Total Spent",     value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: "fa-rupee", color: "#ffa500" },
            ].map((s, i) => (
              <div key={s.label} className="col-6 col-md-3">
                <div style={{ padding: "16px 20px", borderRight: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa ${s.icon}`} style={{ color: s.color, fontSize: 17 }} />
                    </div>
                    <div>
                      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: .8 }}>{s.label}</p>
                      <h4 style={{ color: s.color, fontWeight: 800, margin: 0, fontSize: 20 }}>{s.value}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 0" }}>
        <div className="container">
          <div className="row g-4">

            {/* ── LEFT: Avatar Card ── */}
            <div className="col-lg-4">
              <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", position: "sticky", top: 90 }}>
                {/* Avatar Header */}
                <div style={{ background: "linear-gradient(135deg, #e94560, #c7253e)", padding: "36px 24px", textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, opacity: .15, background: "url('/assets/images/banner-bg.jpg') center/cover" }} />
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc} alt="Profile"
                        style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(255,255,255,.4)" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, color: "#fff", fontWeight: 800, border: "4px solid rgba(255,255,255,.3)" }}>
                        {profile?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", background: "#1a1a2e", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.4)" }}>
                      <i className="fa fa-camera" style={{ color: "#e94560", fontSize: 12 }} />
                      <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }} />
                    </label>
                  </div>
                  <h4 style={{ color: "#fff", fontWeight: 800, margin: "0 0 4px", position: "relative" }}>{profile?.name}</h4>
                  <p style={{ color: "rgba(255,255,255,.75)", fontSize: 13, margin: 0, position: "relative" }}>{profile?.email}</p>
                  <span style={{ display: "inline-block", marginTop: 10, background: "rgba(255,255,255,.2)", color: "#fff", padding: "3px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, position: "relative" }}>
                    {profile?.role}
                  </span>
                </div>

                {/* Profile Info */}
                <div style={{ padding: "24px" }}>
                  {[
                    { icon: "fa-phone",      label: "Phone",   value: profile?.phone_no },
                    { icon: "fa-map-marker", label: "Address", value: profile?.address  },
                    { icon: "fa-calendar",   label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—" },
                  ].map((item) => (
                    <div key={item.label} className="d-flex align-items-start gap-3 mb-3">
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(233,69,96,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 13 }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .8 }}>{item.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", margin: 0 }}>{item.value || "Not set"}</p>
                      </div>
                    </div>
                  ))}

                  {imageFile && (
                    <button
                      onClick={handleSave} disabled={saving}
                      style={{ width: "100%", padding: "11px", background: "#e94560", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, marginTop: 4 }}
                    >
                      {saving ? "Saving..." : "💾 Save New Photo"}
                    </button>
                  )}

                  <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", marginTop: 20, paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link to="/my-bookings" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(233,69,96,.08)", border: "1px solid rgba(233,69,96,.2)", borderRadius: 8, color: "#e94560", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                      <i className="fa fa-ticket" /> My Bookings
                    </Link>
                    <Link to="/my-complaints" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, color: "rgba(255,255,255,.6)", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                      <i className="fa fa-exclamation-circle" /> My Complaints
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Tabs ── */}
            <div className="col-lg-8">
              <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)" }}>
                {/* Tab Nav */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(0,0,0,.2)" }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        flex: 1, padding: "16px 8px", border: "none", background: "none", cursor: "pointer",
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        color: activeTab === tab.key ? "#e94560" : "rgba(255,255,255,.35)",
                        borderBottom: activeTab === tab.key ? "2px solid #e94560" : "2px solid transparent",
                        fontSize: 13, transition: "all .2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <i className={`fa ${tab.icon}`} />
                      <span className="d-none d-sm-inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ padding: "32px" }}>

                  {/* ── Account Info ── */}
                  {activeTab === "info" && (
                    <form onSubmit={handleSave}>
                      <div className="d-flex justify-content-between align-items-center mb-5">
                        <div>
                          <h5 style={{ color: "#fff", fontWeight: 700, margin: "0 0 4px" }}>Account Information</h5>
                          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>Update your personal details</p>
                        </div>
                        {!editing && (
                          <button type="button" onClick={() => setEditing(true)} className="main-dark-button" style={{ padding: "9px 20px", fontSize: 13 }}>
                            <i className="fa fa-pencil me-2" />Edit Profile
                          </button>
                        )}
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Full Name</label>
                          {editing
                            ? <input type="text" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            : <div style={roStyle}>{profile?.name || "—"}</div>}
                        </div>
                        <div className="col-md-6">
                          <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Phone Number</label>
                          {editing
                            ? <input type="tel" style={inputStyle} value={form.phone_no} onChange={(e) => setForm({ ...form, phone_no: e.target.value })} required />
                            : <div style={roStyle}>{profile?.phone_no || "—"}</div>}
                        </div>
                        <div className="col-12">
                          <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Address</label>
                          {editing
                            ? <input type="text" style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            : <div style={roStyle}>{profile?.address || "—"}</div>}
                        </div>
                        <div className="col-12">
                          <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Email Address</label>
                          <div style={{ ...roStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{profile?.email}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Cannot be changed</span>
                          </div>
                        </div>
                      </div>

                      {editing && (
                        <div className="d-flex gap-2 mt-4">
                          <button type="submit" disabled={saving} style={{ flex: 2, padding: "13px", background: "#e94560", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                            {saving ? "Saving..." : "✓ Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditing(false); setForm({ name: profile.name, phone_no: profile.phone_no, address: profile.address }); }}
                            style={{ flex: 1, padding: "13px", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* ── Change Password ── */}
                  {activeTab === "password" && (
                    <form onSubmit={handlePassChange}>
                      <div className="mb-5">
                        <h5 style={{ color: "#fff", fontWeight: 700, margin: "0 0 4px" }}>Change Password</h5>
                        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>Set a new secure password for your account</p>
                      </div>
                      <div style={{ background: "rgba(233,69,96,.07)", border: "1px solid rgba(233,69,96,.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="fa fa-shield" style={{ color: "#e94560", fontSize: 18 }} />
                        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, margin: 0 }}>Password must be at least 6 characters long. Use a mix of letters and numbers for better security.</p>
                      </div>

                      {[
                        { field: "newPassword",     label: "New Password",     ph: "Min 6 characters",  show: showPass.new,     toggle: () => setShowPass({ ...showPass, new: !showPass.new }) },
                        { field: "confirmPassword", label: "Confirm Password", ph: "Repeat new password", show: showPass.confirm, toggle: () => setShowPass({ ...showPass, confirm: !showPass.confirm }) },
                      ].map((f) => (
                        <div key={f.field} style={{ marginBottom: 18 }}>
                          <label style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>{f.label}</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={f.show ? "text" : "password"}
                              value={passForm[f.field]}
                              onChange={(e) => setPassForm({ ...passForm, [f.field]: e.target.value })}
                              placeholder={f.ph} required minLength={6}
                              style={{ ...inputStyle, paddingRight: 44 }}
                            />
                            <button type="button" onClick={f.toggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer" }}>
                              <i className={`fa ${f.show ? "fa-eye-slash" : "fa-eye"}`} />
                            </button>
                          </div>
                          {f.field === "confirmPassword" && passForm.confirmPassword && (
                            <small style={{ color: passForm.newPassword === passForm.confirmPassword ? "#28a745" : "#e94560", marginTop: 4, display: "block", fontSize: 12 }}>
                              <i className={`fa ${passForm.newPassword === passForm.confirmPassword ? "fa-check" : "fa-times"} me-1`} />
                              {passForm.newPassword === passForm.confirmPassword ? "Passwords match" : "Passwords don't match"}
                            </small>
                          )}
                        </div>
                      ))}

                      <button type="submit" disabled={changingPass} style={{ padding: "13px 32px", background: "#e94560", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                        {changingPass ? "Updating..." : "🔒 Update Password"}
                      </button>
                    </form>
                  )}

                  {/* ── Activity ── */}
                  {activeTab === "activity" && (
                    <div>
                      <div className="mb-5">
                        <h5 style={{ color: "#fff", fontWeight: 700, margin: "0 0 4px" }}>My Activity</h5>
                        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>Quick access to all your account sections</p>
                      </div>
                      <div className="row g-3">
                        {[
                          { icon: "fa-ticket",             label: "My Bookings",    desc: "View and manage all your event bookings",          to: "/my-bookings",    color: "#e94560",  count: totalBookings },
                          { icon: "fa-exclamation-circle", label: "My Complaints",  desc: "View complaints you've filed on events",           to: "/my-complaints",  color: "#ffa500",  count: null          },
                          { icon: "fa-star",               label: "All Reviews",    desc: "Browse reviews from all attendees",                to: "/reviews",        color: "#17a2b8",  count: null          },
                          { icon: "fa-calendar",           label: "Browse Events",  desc: "Discover upcoming live events near you",           to: "/events",         color: "#28a745",  count: null          },
                          { icon: "fa-shopping-cart",      label: "Buy Tickets",    desc: "Get tickets for the hottest upcoming shows",       to: "/tickets",        color: "#6f42c1",  count: null          },
                          { icon: "fa-phone",              label: "Contact Support","desc": "Reach out to our support team anytime",          to: "/contact",        color: "#fd7e14",  count: null          },
                        ].map((item) => (
                          <div key={item.label} className="col-md-6">
                            <Link to={item.to} style={{ textDecoration: "none", display: "block" }}>
                              <div
                                style={{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 18, border: `1px solid ${item.color}25`, transition: "all .25s", display: "flex", alignItems: "center", gap: 14 }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${item.color}25`; e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.transform = "none"; }}
                              >
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <i className={`fa ${item.icon}`} style={{ color: item.color, fontSize: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <h6 style={{ color: "#fff", fontWeight: 700, margin: "0 0 3px", fontSize: 14 }}>{item.label}</h6>
                                  <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, margin: 0 }}>{item.desc}</p>
                                </div>
                                {item.count !== null && (
                                  <span style={{ background: item.color, color: "#fff", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                    {item.count}
                                  </span>
                                )}
                                <i className="fa fa-angle-right" style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }} />
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
