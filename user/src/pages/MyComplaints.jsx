import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { myComplaints } from "../services/api";

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

const STATUS_CONFIG = {
  Pending:  { bg: "rgba(255,165,0,.15)",  color: "#ffa500", icon: "fa-clock-o",       label: "Pending"  },
  Resolved: { bg: "rgba(40,167,69,.15)",  color: "#28a745", icon: "fa-check-circle",  label: "Resolved" },
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [expanded,   setExpanded]   = useState(null);

  useEffect(() => {
    myComplaints()
      .then((r) => setComplaints(r.data.data || []))
      .catch(() => toast.error("Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    All:      complaints.length,
    Pending:  complaints.filter((c) => c.status === "Pending").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const filtered = filter === "All" ? complaints : complaints.filter((c) => c.status === filter);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "80px 0 40px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 50%, rgba(233,69,96,.08) 0%, transparent 60%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(233,69,96,.15)", border: "1px solid rgba(233,69,96,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa fa-exclamation-circle" style={{ color: "#e94560", fontSize: 22 }} />
            </div>
            <div>
              <h2 style={{ color: "#fff", fontWeight: 800, margin: 0, fontSize: 28 }}>My Complaints</h2>
              <p style={{ color: "rgba(255,255,255,.4)", margin: 0, fontSize: 14 }}>
                <Link to="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Home</Link>
                <i className="fa fa-angle-right mx-2" style={{ fontSize: 11 }} />
                My Complaints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 0", minHeight: "60vh" }}>
        <div className="container">

          {/* Stats Cards */}
          {!loading && (
            <div className="row g-3 mb-5">
              {[
                { key: "All",      label: "Total Complaints", icon: "fa-list",         color: "#e94560" },
                { key: "Pending",  label: "Pending",          icon: "fa-clock-o",      color: "#ffa500" },
                { key: "Resolved", label: "Resolved",         icon: "fa-check-circle", color: "#28a745" },
              ].map((s) => (
                <div key={s.key} className="col-md-4">
                  <div
                    onClick={() => setFilter(s.key)}
                    style={{
                      background: filter === s.key ? `${s.color}15` : "rgba(255,255,255,.03)",
                      border: `2px solid ${filter === s.key ? s.color : "rgba(255,255,255,.07)"}`,
                      borderRadius: 14,
                      padding: "20px 24px",
                      cursor: "pointer",
                      transition: "all .25s",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                    onMouseEnter={(e) => { if (filter !== s.key) e.currentTarget.style.borderColor = `${s.color}60`; }}
                    onMouseLeave={(e) => { if (filter !== s.key) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
                    </div>
                    <div>
                      <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</p>
                      <h3 style={{ color: s.color, fontWeight: 800, margin: 0, fontSize: 28 }}>{counts[s.key]}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="text-center py-5">
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading your complaints...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(233,69,96,.1)", border: "2px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <i className="fa fa-exclamation-circle" style={{ color: "#e94560", fontSize: 36 }} />
              </div>
              <h4 style={{ color: "rgba(255,255,255,.5)", fontWeight: 700, marginBottom: 8 }}>
                {complaints.length === 0 ? "No complaints filed" : "No matching complaints"}
              </h4>
              <p style={{ color: "rgba(255,255,255,.25)", fontSize: 14, marginBottom: 24 }}>
                {complaints.length === 0
                  ? "You haven't filed any complaints yet. Complaints can be raised from My Bookings."
                  : "Try changing your filter."}
              </p>
              {complaints.length === 0 && (
                <Link to="/my-bookings" className="main-dark-button" style={{ display: "inline-block" }}>
                  Go to My Bookings
                </Link>
              )}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Pending;
                const isOpen = expanded === c._id;
                return (
                  <div
                    key={c._id}
                    style={{
                      background: "rgba(255,255,255,.03)",
                      borderRadius: 14,
                      border: `1px solid ${isOpen ? "rgba(233,69,96,.3)" : "rgba(255,255,255,.07)"}`,
                      overflow: "hidden",
                      transition: "all .25s",
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16 }}
                      onClick={() => setExpanded(isOpen ? null : c._id)}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <i className={`fa ${cfg.icon}`} style={{ color: cfg.color, fontSize: 18 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                          <div>
                            <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 16 }}>{c.subject}</h5>
                            {c.booking?.event?.event_name && (
                              <p style={{ color: "#e94560", fontSize: 12, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                                <i className="fa fa-calendar" /> {c.booking.event.event_name}
                              </p>
                            )}
                            <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, margin: 0 }}>
                              <i className="fa fa-clock-o me-1" />Filed on {fmt(c.created_at)}
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .5, border: `1px solid ${cfg.color}40` }}>
                              {cfg.label}
                            </span>
                            <i className={`fa fa-chevron-${isOpen ? "up" : "down"}`} style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", background: "rgba(0,0,0,.2)" }}>
                        <div className="row g-4">
                          <div className="col-md-8">
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Message</p>
                            <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, lineHeight: 1.7, marginBottom: 0, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,.06)" }}>
                              {c.message}
                            </p>
                          </div>
                          <div className="col-md-4">
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Details</p>
                            <div className="d-flex flex-column gap-2">
                              {[
                                { label: "Status",   value: c.status,    color: cfg.color },
                                { label: "Filed On", value: fmt(c.created_at) },
                                c.booking?._id && { label: "Booking #", value: `#${c.booking._id.toString().slice(-8).toUpperCase()}` },
                              ].filter(Boolean).map((item) => (
                                <div key={item.label} style={{ background: "rgba(255,255,255,.04)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(255,255,255,.06)" }}>
                                  <p style={{ color: "rgba(255,255,255,.35)", fontSize: 11, margin: "0 0 2px" }}>{item.label}</p>
                                  <p style={{ color: item.color || "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {c.status === "Resolved" && (
                          <div style={{ marginTop: 16, background: "rgba(40,167,69,.08)", border: "1px solid rgba(40,167,69,.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                            <i className="fa fa-check-circle" style={{ color: "#28a745", fontSize: 18 }} />
                            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, margin: 0 }}>
                              This complaint has been reviewed and resolved by our support team. Thank you for your patience.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          {!loading && complaints.length > 0 && (
            <div style={{ marginTop: 32, textAlign: "center", padding: "20px", background: "rgba(255,255,255,.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }}>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, margin: 0 }}>
                <i className="fa fa-info-circle me-2" />
                To file a new complaint, go to{" "}
                <Link to="/my-bookings" style={{ color: "#e94560", textDecoration: "none", fontWeight: 600 }}>My Bookings</Link>
                {" "}and click "Complaint" on a paid booking.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
