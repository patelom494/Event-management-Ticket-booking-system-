import React, { useEffect, useState } from "react";
import { getReviews } from "../services/api";

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState(0); // 0 = all

  useEffect(() => {
    getReviews()
      .then((r) => setReviews(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const displayed = filter === 0
    ? reviews
    : reviews.filter((r) => Math.round(r.rating) === filter);

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div className="page-heading-shows-events">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Audience Reviews</h2>
              <span>Real experiences from real attendees across India.</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "48px 0" }}>
        <div className="container">

          {/* ── Summary Card ── */}
          {!loading && reviews.length > 0 && (
            <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 18, padding: "32px 36px", marginBottom: 40, border: "1px solid rgba(255,255,255,.07)" }}>
              <div className="row g-4 align-items-center">
                {/* Big Rating */}
                <div className="col-md-3 text-center">
                  <div style={{ fontSize: 72, fontWeight: 900, color: "#e94560", lineHeight: 1 }}>{avg}</div>
                  <div className="d-flex justify-content-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className={`fa ${s <= Math.round(avg) ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 20 }} />
                    ))}
                  </div>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>
                    {reviews.length} total review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Bar Chart */}
                <div className="col-md-5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="d-flex align-items-center gap-3 mb-2">
                        <button
                          onClick={() => setFilter(filter === star ? 0 : star)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: filter === star ? "#e94560" : "rgba(255,255,255,.4)", fontSize: 13, fontWeight: 600, minWidth: 32 }}
                        >
                          {star} <i className="fa fa-star" style={{ fontSize: 11 }} />
                        </button>
                        <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,.07)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: star >= 4 ? "#e94560" : star === 3 ? "#ffa500" : "#dc3545", borderRadius: 4, transition: "width .4s" }} />
                        </div>
                        <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12, minWidth: 28, textAlign: "right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Stats */}
                <div className="col-md-4">
                  <div className="row g-3">
                    {[
                      { label: "Avg Rating",    value: avg,                                          color: "#e94560" },
                      { label: "5-Star Reviews", value: reviews.filter((r) => r.rating >= 4.5).length, color: "#28a745" },
                      { label: "Reviewers",     value: reviews.length,                               color: "#17a2b8" },
                    ].map((s) => (
                      <div key={s.label} className="col-4">
                        <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "14px 10px", textAlign: "center", border: "1px solid rgba(255,255,255,.06)" }}>
                          <h4 style={{ color: s.color, fontWeight: 800, margin: "0 0 4px", fontSize: 22 }}>{s.value}</h4>
                          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 11, margin: 0 }}>{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filter !== 0 && (
                    <button
                      onClick={() => setFilter(0)}
                      style={{ marginTop: 12, width: "100%", padding: "8px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                    >
                      <i className="fa fa-times me-1" />Clear Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filter hint */}
          {filter !== 0 && (
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>Showing</span>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => <i key={s} className={`fa ${s <= filter ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 14 }} />)}
              </div>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>reviews ({displayed.length})</span>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="text-center py-5">
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading reviews...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(233,69,96,.1)", border: "2px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <i className="fa fa-star-o" style={{ color: "#e94560", fontSize: 32 }} />
              </div>
              <h4 style={{ color: "rgba(255,255,255,.45)", fontWeight: 700 }}>
                {reviews.length === 0 ? "No reviews yet" : "No reviews for this rating"}
              </h4>
            </div>
          ) : (
            <div className="row g-4">
              {displayed.map((r, i) => (
                <div key={r._id || i} className="col-md-6 col-lg-4">
                  <div
                    style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,.07)", height: "100%", position: "relative", transition: "all .25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(233,69,96,.35)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.transform = "none"; }}
                  >
                    <i className="fa fa-quote-left" style={{ color: "rgba(233,69,96,.12)", fontSize: 32, position: "absolute", top: 18, right: 20 }} />
                    <div className="d-flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i key={s} className={`fa ${s <= r.rating ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 16 }} />
                      ))}
                    </div>
                    <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, fontStyle: "italic", lineHeight: 1.8, marginBottom: 16 }}>
                      "{r.review?.slice(0, 180)}{r.review?.length > 180 ? "..." : ""}"
                    </p>
                    {r.event?.event_name && (
                      <p style={{ color: "#e94560", fontSize: 12, marginBottom: 14, fontWeight: 600 }}>
                        <i className="fa fa-calendar me-1" />{r.event.event_name}
                      </p>
                    )}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#e94560,#c7253e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                        {r.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{r.user?.name || "Anonymous"}</p>
                        <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, margin: 0 }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
