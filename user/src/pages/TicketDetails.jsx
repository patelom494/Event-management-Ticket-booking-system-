import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getEventDetails, bookEvent, genOrderId, verifyPayment } from "../services/api";

const BACKEND      = "http://localhost:8000";
const RAZORPAY_KEY = "rzp_test_VQhEfe2NCXbbwI";
const SPIN         = `@keyframes spin{to{transform:rotate(360deg)}}`;
const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function TicketDetails({ isAuthenticated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event,   setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats,   setSeats]   = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getEventDetails(id)
      .then((r) => setEvent(r.data.data))
      .catch(() => { toast.error("Event not found!"); navigate("/tickets"); })
      .finally(() => setLoading(false));
  }, [id]);

  const total = event ? event.price_per_seat * seats : 0;
  const maxSeats = event ? Math.min(10, event.available_seats) : 10;

  const handleBook = async () => {
    if (!isAuthenticated) { toast.info("Please login to book tickets"); navigate("/login"); return; }
    if (seats < 1 || seats > maxSeats) return toast.error(`Select 1–${maxSeats} seats`);
    setBooking(true);
    try {
      const bookRes = await bookEvent({ event_id: id, seats: String(seats) });
      if (!bookRes.data.success) { toast.error(bookRes.data.message); return; }

      const { myBookings } = await import("../services/api");
      const bRes = await myBookings();
      const latest = (bRes.data.data || []).find((b) => String(b.event_id) === id || b.event?._id === id);
      if (!latest) { toast.success("Booked! Pay from My Bookings."); navigate("/my-bookings"); return; }

      const orderRes = await genOrderId({ booking_id: latest._id });
      if (!orderRes.data.success) { toast.error("Order creation failed!"); return; }
      const { order_id, amount, booking_id } = orderRes.data.data;

      if (!(await loadRazorpay())) { toast.error("Razorpay failed to load!"); return; }

      new window.Razorpay({
        key: RAZORPAY_KEY, amount, currency: "INR",
        name: "ArtXibition",
        description: `${event.event_name} – ${seats} seat(s)`,
        order_id,
        handler: async (response) => {
          try {
            const vRes = await verifyPayment({
              booking_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (vRes.data.success) { toast.success("🎉 Booking confirmed! Enjoy the show!"); navigate("/my-bookings"); }
          } catch { toast.error("Payment verification failed!"); }
        },
        theme: { color: "#e94560" },
      }).open();
    } catch (err) { toast.error(err.response?.data?.message || "Booking failed!"); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{SPIN}</style>
      <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading ticket info...</p>
    </div>
  );

  if (!event) return null;

  return (
    <div style={{ background: "#0d0d1a" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div className="page-heading-shows-events" style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 50%, rgba(233,69,96,.12) 0%, transparent 60%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="row">
            <div className="col-lg-12">
              <h2>Tickets On Sale!</h2>
              <span>Secure your seat for <strong style={{ color: "#e94560" }}>{event.event_name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "48px 0 64px" }}>
        <div className="container">
          <div className="row g-5">

            {/* ── Left: Event Info ── */}
            <div className="col-lg-8">
              {/* Hero Image */}
              <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28, position: "relative" }}>
                <img
                  src={event.event_img ? `${BACKEND}${event.event_img}` : "/assets/images/ticket-details.jpg"}
                  alt={event.event_name}
                  style={{ width: "100%", maxHeight: 400, objectFit: "cover" }}
                  onError={(e) => { e.target.src = "/assets/images/ticket-details.jpg"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <span style={{ background: "#e94560", color: "#fff", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {event.category?.name || "Event"}
                  </span>
                </div>
              </div>

              {/* Event Title */}
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(22px,3vw,36px)", marginBottom: 6 }}>{event.event_name}</h2>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 28 }}>
                <Link to={`/event/${event._id}`} style={{ color: "#e94560", textDecoration: "none", fontWeight: 600 }}>View full event details →</Link>
              </p>

              {/* Artist Card */}
              <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,.07)", marginBottom: 24 }}>
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Performing Artist</p>
                <div className="d-flex gap-4 align-items-center">
                  {event.artist_image ? (
                    <img
                      src={`${BACKEND}${event.artist_image}`} alt={event.artist_name}
                      style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #e94560", flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#e94560,#c7253e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                      {event.artist_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 style={{ color: "#fff", fontWeight: 800, marginBottom: 4 }}>{event.artist_name}</h4>
                    <span style={{ background: "rgba(233,69,96,.12)", color: "#e94560", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{event.category?.name}</span>
                  </div>
                </div>
              </div>

              {/* Event Specs */}
              <div className="row g-3">
                {[
                  { icon: "fa-calendar",   label: "Date & Time",     value: `${new Date(event.datetime).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · ${new Date(event.datetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` },
                  { icon: "fa-map-marker", label: "Venue",           value: event.address },
                  { icon: "fa-ticket",     label: "Total Seats",     value: `${event.total_seats} seats` },
                  { icon: "fa-users",      label: "Available Seats", value: `${event.available_seats} remaining` },
                ].map((s) => (
                  <div key={s.label} className="col-md-6">
                    <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(233,69,96,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`fa ${s.icon}`} style={{ color: "#e94560", fontSize: 16 }} />
                      </div>
                      <div>
                        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: .8, margin: "0 0 3px" }}>{s.label}</p>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{s.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {event.lattitute && event.longitude && (
                <div style={{ marginTop: 16 }}>
                  <a
                    href={`https://maps.google.com/?q=${event.lattitute},${event.longitude}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#e94560", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <i className="fa fa-map-marker" />View Venue on Google Maps →
                  </a>
                </div>
              )}
            </div>

            {/* ── Right: Booking Widget ── */}
            <div className="col-lg-4">
              <div style={{ background: "#1a1a2e", borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", position: "sticky", top: 90, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
                {/* Top accent */}
                <div style={{ background: "linear-gradient(135deg, #e94560, #c7253e)", height: 5 }} />

                <div style={{ padding: 28 }}>
                  <h4 style={{ color: "#fff", fontWeight: 800, marginBottom: 4, fontSize: 18 }}>{event.event_name}</h4>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 24 }}>
                    {event.available_seats} {event.available_seats === 1 ? "ticket" : "tickets"} still available
                  </p>

                  {event.available_seats === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <i className="fa fa-frown-o" style={{ color: "#e94560", fontSize: 48, marginBottom: 12, display: "block" }} />
                      <h5 style={{ color: "#e94560", fontWeight: 700, marginBottom: 8 }}>Sold Out!</h5>
                      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 20 }}>This event is fully booked. Check out other upcoming events.</p>
                      <Link to="/tickets" className="main-dark-button" style={{ display: "block", textAlign: "center" }}>Browse Other Events</Link>
                    </div>
                  ) : (
                    <>
                      {/* Price */}
                      <div style={{ background: "rgba(233,69,96,.08)", borderRadius: 12, padding: "16px 18px", marginBottom: 20, border: "1px solid rgba(233,69,96,.2)" }}>
                        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Standard Ticket</p>
                        <p style={{ color: "#e94560", fontWeight: 900, fontSize: 28, margin: 0 }}>₹{event.price_per_seat} <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>/ seat</span></p>
                      </div>

                      {/* Seats Selector */}
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>Number of Seats</p>
                        <div className="d-flex align-items-center justify-content-between" style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", padding: "8px 12px" }}>
                          <button
                            onClick={() => setSeats(Math.max(1, seats - 1))}
                            style={{ width: 36, height: 36, borderRadius: 8, background: seats > 1 ? "rgba(233,69,96,.2)" : "rgba(255,255,255,.06)", border: "none", color: seats > 1 ? "#e94560" : "rgba(255,255,255,.2)", fontSize: 20, cursor: seats > 1 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                          >
                            −
                          </button>
                          <span style={{ color: "#fff", fontWeight: 800, fontSize: 28, minWidth: 40, textAlign: "center" }}>{seats}</span>
                          <button
                            onClick={() => setSeats(Math.min(maxSeats, seats + 1))}
                            style={{ width: 36, height: 36, borderRadius: 8, background: seats < maxSeats ? "rgba(233,69,96,.2)" : "rgba(255,255,255,.06)", border: "none", color: seats < maxSeats ? "#e94560" : "rgba(255,255,255,.2)", fontSize: 20, cursor: seats < maxSeats ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>
                        <p style={{ color: "rgba(255,255,255,.25)", fontSize: 11, marginTop: 6 }}>Max {maxSeats} tickets per booking</p>
                      </div>

                      {/* Order Summary */}
                      <div style={{ background: "rgba(0,0,0,.25)", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid rgba(255,255,255,.06)" }}>
                        {[
                          { label: "Price per seat", value: `₹${event.price_per_seat}` },
                          { label: "Seats",          value: `× ${seats}` },
                        ].map((row) => (
                          <div key={row.label} className="d-flex justify-content-between mb-2">
                            <span style={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>{row.label}</span>
                            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>{row.value}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Total</span>
                          <span style={{ color: "#e94560", fontWeight: 900, fontSize: 26 }}>₹{total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={handleBook} disabled={booking}
                        style={{ display: "block", width: "100%", padding: "15px", background: booking ? "rgba(233,69,96,.5)" : "#e94560", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: booking ? "not-allowed" : "pointer", transition: "all .25s", boxShadow: "0 4px 20px rgba(233,69,96,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        onMouseEnter={(e) => { if (!booking) e.currentTarget.style.background = "#c7253e"; }}
                        onMouseLeave={(e) => { if (!booking) e.currentTarget.style.background = "#e94560"; }}
                      >
                        {booking ? (
                          <>
                            <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                            Processing...
                          </>
                        ) : isAuthenticated
                          ? `🎫 Purchase ${seats} Ticket${seats > 1 ? "s" : ""}`
                          : "🔐 Login to Purchase"}
                      </button>

                      {!isAuthenticated && (
                        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 10, marginBottom: 0 }}>
                          <Link to="/login" style={{ color: "#e94560" }}>Login</Link> or{" "}
                          <Link to="/register" style={{ color: "#e94560" }}>Register</Link> to book tickets
                        </p>
                      )}

                      {/* Trust Badges */}
                      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                        {[
                          { icon: "fa-lock",        text: "Secure payment via Razorpay"  },
                          { icon: "fa-envelope",    text: "Confirmation to your email"   },
                          { icon: "fa-times-circle",text: "Free cancellation available"  },
                        ].map((t) => (
                          <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className={`fa ${t.icon}`} style={{ color: "rgba(255,255,255,.2)", fontSize: 12 }} />
                            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
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
