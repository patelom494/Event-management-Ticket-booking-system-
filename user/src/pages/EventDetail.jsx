import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getEventDetails, getReviews } from "../services/api";

const BACKEND = "http://localhost:8000";
const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

export default function EventDetail({ isAuthenticated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event,   setEvent]   = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEventDetails(id), getReviews()])
      .then(([eR, rR]) => {
        setEvent(eR.data.data);
        const all = rR.data.data || [];
        setReviews(all.filter((r) => String(r.event?._id) === id || String(r.booking?.event_id) === id).slice(0, 6));
      })
      .catch(() => { toast.error("Event not found!"); navigate("/events"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{SPIN}</style>
      <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading event details...</p>
    </div>
  );

  if (!event) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isPast = new Date(event.datetime) < new Date();

  return (
    <div style={{ background: "#0d0d1a" }}>
      <style>{SPIN}</style>

      {/* ── Hero Image Banner ── */}
      <div style={{ position: "relative", height: "clamp(280px, 45vw, 480px)", overflow: "hidden" }}>
        <img
          src={event.event_img ? `${BACKEND}${event.event_img}` : "/assets/images/ticket-details.jpg"}
          alt={event.event_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.src = "/assets/images/ticket-details.jpg"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,13,26,.4) 0%, rgba(13,13,26,.8) 60%, #0d0d1a 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px" }}>
          <div className="container">
            {/* Breadcrumb */}
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginBottom: 12 }}>
              <Link to="/" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none" }}>Home</Link>
              <i className="fa fa-angle-right mx-2" style={{ fontSize: 11 }} />
              <Link to="/events" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none" }}>Events</Link>
              <i className="fa fa-angle-right mx-2" style={{ fontSize: 11 }} />
              <span style={{ color: "#fff" }}>{event.event_name}</span>
            </p>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span style={{ background: "#e94560", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {event.category?.name || "Event"}
              </span>
              {isPast && (
                <span style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  Past Event
                </span>
              )}
              {avgRating && (
                <span style={{ background: "rgba(233,69,96,.15)", color: "#e94560", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid rgba(233,69,96,.3)" }}>
                  <i className="fa fa-star me-1" />{avgRating} ({reviews.length} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 0 64px" }}>
        <div className="container">
          <div className="row g-5">

            {/* ── Left: Info ── */}
            <div className="col-lg-8">
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(24px,4vw,42px)", marginBottom: 8, lineHeight: 1.2, marginTop: 32 }}>{event.event_name}</h1>

              {/* Rating stars */}
              {avgRating && (
                <div className="d-flex align-items-center gap-2 mb-28" style={{ marginBottom: 28 }}>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => <i key={s} className={`fa ${s <= Math.round(avgRating) ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 15 }} />)}
                  </div>
                  <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{avgRating} out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
                </div>
              )}

              {/* Specs Grid */}
              <div className="row g-3 mb-5" style={{ marginTop: avgRating ? 0 : 28 }}>
                {[
                  { icon: "fa-calendar",    label: "Date & Time",       value: `${new Date(event.datetime).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · ${new Date(event.datetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` },
                  { icon: "fa-map-marker",  label: "Venue",             value: event.address },
                  { icon: "fa-ticket",      label: "Seats Available",   value: `${event.available_seats} of ${event.total_seats} seats` },
                  { icon: "fa-rupee",       label: "Price per Seat",    value: `₹${event.price_per_seat}` },
                ].map((s) => (
                  <div key={s.label} className="col-md-6">
                    <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(233,69,96,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`fa ${s.icon}`} style={{ color: "#e94560", fontSize: 17 }} />
                      </div>
                      <div>
                        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: .8, margin: "0 0 4px" }}>{s.label}</p>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{s.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Link */}
              {event.lattitute && event.longitude && (
                <div style={{ marginBottom: 32 }}>
                  <a
                    href={`https://maps.google.com/?q=${event.lattitute},${event.longitude}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#e94560", fontWeight: 600, fontSize: 14, textDecoration: "none", padding: "10px 20px", background: "rgba(233,69,96,.1)", borderRadius: 8, border: "1px solid rgba(233,69,96,.2)", transition: "all .25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,69,96,.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(233,69,96,.1)"; }}
                  >
                    <i className="fa fa-map-marker" />View Venue on Google Maps <i className="fa fa-external-link" style={{ fontSize: 12 }} />
                  </a>
                </div>
              )}

              {/* Artist */}
              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,.07)", marginBottom: 32 }}>
                <h5 style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Performing Artist</h5>
                <div className="d-flex gap-4 align-items-center">
                  {event.artist_image ? (
                    <img
                      src={`${BACKEND}${event.artist_image}`} alt={event.artist_name}
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #e94560", flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#e94560,#c7253e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                      {event.artist_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 style={{ color: "#fff", fontWeight: 800, marginBottom: 4 }}>{event.artist_name}</h3>
                    <span style={{ background: "rgba(233,69,96,.12)", color: "#e94560", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{event.category?.name}</span>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 20, fontSize: 20 }}>
                    Audience Reviews
                    <span style={{ color: "rgba(255,255,255,.3)", fontSize: 14, fontWeight: 500, marginLeft: 8 }}>({reviews.length})</span>
                  </h4>
                  <div className="row g-3">
                    {reviews.map((r, i) => (
                      <div key={r._id || i} className="col-md-6">
                        <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: 18, border: "1px solid rgba(255,255,255,.07)", height: "100%" }}>
                          <div className="d-flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((s) => <i key={s} className={`fa ${s <= r.rating ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 14 }} />)}
                          </div>
                          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 13, fontStyle: "italic", lineHeight: 1.7, marginBottom: 14 }}>"{r.review}"</p>
                          <div className="d-flex align-items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#e94560,#c7253e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                              {r.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600 }}>{r.user?.name || "Anonymous"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Booking Card ── */}
            <div className="col-lg-4">
              <div style={{ background: "#1a1a2e", borderRadius: 18, padding: 28, border: "1px solid rgba(255,255,255,.08)", position: "sticky", top: 90, boxShadow: "0 16px 48px rgba(0,0,0,.4)" }}>
                <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 18 }}>Book Your Seat</h5>
                <p style={{ color: event.available_seats > 0 ? "#28a745" : "#dc3545", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                  <i className={`fa ${event.available_seats > 0 ? "fa-check-circle" : "fa-times-circle"} me-1`} />
                  {event.available_seats > 0 ? `${event.available_seats} seats remaining` : "Sold Out"}
                </p>

                {/* Price */}
                <div style={{ background: "rgba(233,69,96,.08)", borderRadius: 12, padding: "18px 20px", marginBottom: 20, border: "1px solid rgba(233,69,96,.2)", textAlign: "center" }}>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>Price per seat</p>
                  <p style={{ color: "#e94560", fontWeight: 900, fontSize: 36, margin: 0 }}>₹{event.price_per_seat}</p>
                </div>

                {/* CTA */}
                {isPast ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "rgba(255,255,255,.35)", fontSize: 14 }}>
                    <i className="fa fa-calendar-times-o" style={{ fontSize: 28, marginBottom: 8, display: "block", color: "rgba(255,255,255,.2)" }} />
                    This event has already taken place.
                  </div>
                ) : event.available_seats > 0 ? (
                  <Link
                    to={`/ticket/${event._id}`}
                    style={{ display: "block", textAlign: "center", padding: "15px", background: "#e94560", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 20px rgba(233,69,96,.3)", transition: "all .25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#c7253e"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#e94560"; }}
                  >
                    🎫 Purchase Tickets
                  </Link>
                ) : (
                  <div style={{ textAlign: "center", padding: "15px", background: "rgba(255,255,255,.05)", borderRadius: 10, color: "rgba(255,255,255,.3)", fontWeight: 600, fontSize: 15 }}>
                    Sold Out
                  </div>
                )}

                {/* Trust badges */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "fa-lock",        text: "Secure payment via Razorpay"  },
                    { icon: "fa-times-circle",text: "Free cancellation available"  },
                    { icon: "fa-envelope",    text: "Booking confirmation by email" },
                  ].map((t) => (
                    <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa ${t.icon}`} style={{ color: "rgba(255,255,255,.25)", fontSize: 13, width: 16 }} />
                      <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>{t.text}</span>
                    </div>
                  ))}
                </div>

                {/* Share / Back */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", marginTop: 20, paddingTop: 16 }}>
                  <Link to="/events" style={{ color: "rgba(255,255,255,.35)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="fa fa-arrow-left" />Back to Events
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
