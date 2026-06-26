import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { myBookings, cancelBooking, genOrderId, verifyPayment, addReview, addComplaint } from "../services/api";

const BACKEND      = "http://localhost:8000";
const RAZORPAY_KEY = "rzp_test_T6HlGeWKiUG0PP";
const SPIN         = `@keyframes spin{to{transform:rotate(360deg)}}`;

// Suppress Razorpay CORS tracking errors (harmless analytics)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0]?.includes?.('CORS') && args[0]?.includes?.('razorpay')) return;
    if (args[0]?.includes?.('lumberjack')) return;
    originalError.apply(console, args);
  };
}

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

function StatusBadge({ status, payment }) {
  const sMap = {
    Booked:    { bg: "rgba(40,167,69,.15)",  color: "#28a745" },
    Cancelled: { bg: "rgba(220,53,69,.15)",  color: "#dc3545" },
  };
  const pMap = {
    Success: { bg: "rgba(40,167,69,.15)",  color: "#28a745" },
    Pending: { bg: "rgba(255,165,0,.15)",  color: "#ffa500" },
  };
  const s = sMap[status]  || sMap.Cancelled;
  const p = pMap[payment] || pMap.Pending;
  return (
    <div className="d-flex gap-2 flex-wrap">
      <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.color}40` }}>
        <i className={`fa ${status === "Booked" ? "fa-check-circle" : "fa-times-circle"} me-1`} />{status}
      </span>
      <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.bg, color: p.color, border: `1px solid ${p.color}40` }}>
        <i className={`fa ${payment === "Success" ? "fa-check" : "fa-clock-o"} me-1`} />{payment || "Pending"}
      </span>
    </div>
  );
}

export default function MyBookings() {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try { const r = await myBookings(); setBookings(r.data.data || []); }
    catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking? Seats will be released.")) return;
    try {
      const r = await cancelBooking({ booking_id: bookingId });
      if (r.data.success) { toast.success("Booking cancelled!"); fetchBookings(); }
    } catch (err) { toast.error(err.response?.data?.message || "Cancel failed!"); }
  };

  const handlePay = async (booking) => {
    try {
      const orderRes = await genOrderId({ booking_id: booking._id });
      if (!orderRes.data.success) return toast.error("Order creation failed!");
      const { order_id, amount, booking_id } = orderRes.data.data;
      if (!(await loadRazorpay())) return toast.error("Razorpay failed to load!");
      new window.Razorpay({
        key: RAZORPAY_KEY, amount, currency: "INR",
        name: "ArtXibition",
        description: `${booking.event?.event_name} – ${booking.seats} seat(s)`,
        order_id,
        handler: async (response) => {
          try {
            const vRes = await verifyPayment({
              booking_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (vRes.data.success) { toast.success("🎉 Payment successful!"); fetchBookings(); }
          } catch { toast.error("Payment verification failed!"); }
        },
        theme: { color: "#e94560" },
      }).open();
    } catch (err) { toast.error(err.response?.data?.message || "Payment failed!"); }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      let r;
      if (modal.type === "review") {
        r = await addReview({ booking_id: modal.booking._id, review: form.review, rating: form.rating || 5 });
      } else {
        r = await addComplaint({ booking_id: modal.booking._id, subject: form.subject, message: form.message });
      }
      if (r.data.success) {
        toast.success(`${modal.type === "review" ? "Review" : "Complaint"} submitted successfully!`);
        setModal(null); setForm({});
      }
    } catch (err) { toast.error(err.response?.data?.message || "Submission failed!"); }
    finally { setSubmitting(false); }
  };

  const counts = {
    All:       bookings.length,
    Booked:    bookings.filter((b) => b.status === "Booked").length,
    Paid:      bookings.filter((b) => b.payment_status === "Success").length,
    Cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  };

  const filtered = filter === "All"
    ? bookings
    : filter === "Paid"
      ? bookings.filter((b) => b.payment_status === "Success")
      : bookings.filter((b) => b.status === filter);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
        padding: "80px 0 40px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 50%, rgba(233,69,96,.08) 0%, transparent 60%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 style={{ color: "#fff", fontWeight: 800, margin: "0 0 4px", fontSize: 28 }}>My Bookings</h2>
              <p style={{ color: "rgba(255,255,255,.4)", margin: 0, fontSize: 14 }}>
                <Link to="/" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Home</Link>
                <i className="fa fa-angle-right mx-2" style={{ fontSize: 11 }} />
                My Bookings
              </p>
            </div>
            <Link to="/tickets" className="main-dark-button" style={{ padding: "10px 22px" }}>
              <i className="fa fa-plus me-2" />Book New Event
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 0", minHeight: "60vh" }}>
        <div className="container">

          {/* Stats + Filter Tabs */}
          {!loading && bookings.length > 0 && (
            <div className="row g-3 mb-5">
              {[
                { key: "All",       label: "All Bookings",   icon: "fa-list",         color: "#e94560", count: counts.All       },
                { key: "Booked",    label: "Active",         icon: "fa-ticket",       color: "#28a745", count: counts.Booked    },
                { key: "Paid",      label: "Paid",           icon: "fa-check-circle", color: "#17a2b8", count: counts.Paid      },
                { key: "Cancelled", label: "Cancelled",      icon: "fa-times-circle", color: "#dc3545", count: counts.Cancelled },
              ].map((s) => (
                <div key={s.key} className="col-6 col-md-3">
                  <div
                    onClick={() => setFilter(s.key)}
                    style={{
                      background: filter === s.key ? `${s.color}15` : "rgba(255,255,255,.03)",
                      border: `2px solid ${filter === s.key ? s.color : "rgba(255,255,255,.07)"}`,
                      borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "all .25s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                    onMouseEnter={(e) => { if (filter !== s.key) e.currentTarget.style.borderColor = `${s.color}50`; }}
                    onMouseLeave={(e) => { if (filter !== s.key) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa ${s.icon}`} style={{ color: s.color, fontSize: 17 }} />
                    </div>
                    <div>
                      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: .8 }}>{s.label}</p>
                      <h4 style={{ color: s.color, fontWeight: 800, margin: 0, fontSize: 22 }}>{s.count}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking List */}
          {loading ? (
            <div className="text-center py-5">
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading your bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(233,69,96,.1)", border: "2px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <i className="fa fa-ticket" style={{ color: "#e94560", fontSize: 36 }} />
              </div>
              <h4 style={{ color: "rgba(255,255,255,.5)", fontWeight: 700, marginBottom: 8 }}>
                {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
              </h4>
              <p style={{ color: "rgba(255,255,255,.25)", fontSize: 14, marginBottom: 24 }}>
                {bookings.length === 0 ? "Book your first event and the memories will live here!" : "Try selecting a different filter above."}
              </p>
              {bookings.length === 0 && (
                <Link to="/tickets" className="main-dark-button" style={{ display: "inline-block" }}>Browse Events</Link>
              )}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map((b) => (
                <div
                  key={b._id}
                  style={{ background: "rgba(255,255,255,.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)", overflow: "hidden", transition: "border-color .25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(233,69,96,.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                >
                  <div className="row g-0">
                    {/* Event Image */}
                    <div className="col-md-2 col-3" style={{ position: "relative", minHeight: 140 }}>
                      <img
                        src={b.event?.event_img ? `${BACKEND}${b.event.event_img}` : "/assets/images/event-01.jpg"}
                        alt={b.event?.event_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 140 }}
                        onError={(e) => { e.target.src = "/assets/images/event-01.jpg"; }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, rgba(20,20,31,.6))" }} />
                    </div>

                    {/* Event Info */}
                    <div className="col-md-10 col-9">
                      <div style={{ padding: "20px 22px" }}>
                        <div className="row g-3 align-items-start">
                          {/* Name + Status */}
                          <div className="col-lg-4">
                            <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 6, fontSize: 16 }}>{b.event?.event_name || "Event"}</h5>
                            <p style={{ color: "#e94560", fontSize: 12, marginBottom: 10 }}>
                              <i className="fa fa-user me-1" />{b.event?.artist_name}
                            </p>
                            <StatusBadge status={b.status} payment={b.payment_status} />
                          </div>

                          {/* Details */}
                          <div className="col-lg-4">
                            <div className="d-flex flex-column gap-2">
                              {[
                                { icon: "fa-ticket",   label: "Seats",  value: `${b.seats} seat${b.seats > 1 ? "s" : ""}` },
                                { icon: "fa-rupee",    label: "Total",  value: `₹${b.total_price?.toLocaleString("en-IN") || 0}` },
                                { icon: "fa-calendar", label: "Booked", value: fmt(b.date) },
                              ].map((info) => (
                                <div key={info.label} className="d-flex align-items-center gap-2">
                                  <i className={`fa ${info.icon}`} style={{ color: "#e94560", fontSize: 12, width: 14 }} />
                                  <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>{info.label}:</span>
                                  <strong style={{ color: "rgba(255,255,255,.8)", fontSize: 13 }}>{info.value}</strong>
                                </div>
                              ))}
                            </div>
                            {b.event?.datetime && (
                              <div style={{ marginTop: 10, background: "rgba(233,69,96,.08)", border: "1px solid rgba(233,69,96,.2)", borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>
                                <span style={{ color: "#e94560", fontSize: 11, fontWeight: 600 }}>
                                  <i className="fa fa-clock-o me-1" />
                                  {new Date(b.event.datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  {" · "}
                                  {new Date(b.event.datetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="col-lg-4">
                            <div className="d-flex flex-column gap-2">
                              {/* Pay */}
                              {b.status === "Booked" && b.payment_status !== "Success" && (
                                <button
                                  onClick={() => handlePay(b)}
                                  style={{ padding: "10px 16px", background: "linear-gradient(135deg,#e94560,#c7253e)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 4px 12px rgba(233,69,96,.3)" }}
                                >
                                  <i className="fa fa-credit-card" /> Pay ₹{b.total_price?.toLocaleString("en-IN")}
                                </button>
                              )}

                              {/* Review + Complaint */}
                              {b.status === "Booked" && b.payment_status === "Success" && (
                                <div className="d-flex gap-2">
                                  <button
                                    onClick={() => { setModal({ type: "review", booking: b }); setForm({ rating: 5, review: "" }); }}
                                    style={{ flex: 1, padding: "9px 12px", background: "rgba(255,165,0,.12)", border: "1px solid rgba(255,165,0,.35)", color: "#ffa500", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                                  >
                                    <i className="fa fa-star me-1" />Review
                                  </button>
                                  <button
                                    onClick={() => { setModal({ type: "complaint", booking: b }); setForm({ subject: "", message: "" }); }}
                                    style={{ flex: 1, padding: "9px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                                  >
                                    <i className="fa fa-flag me-1" />Complaint
                                  </button>
                                </div>
                              )}

                              {/* View Event */}
                              {b.event?._id && (
                                <Link
                                  to={`/event/${b.event._id}`}
                                  style={{ padding: "9px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", borderRadius: 8, fontWeight: 600, fontSize: 12, textDecoration: "none", textAlign: "center" }}
                                >
                                  <i className="fa fa-eye me-1" />View Event
                                </Link>
                              )}

                              {/* Cancel */}
                              {b.status === "Booked" && b.payment_status !== "Success" && (
                                <button
                                  onClick={() => handleCancel(b._id)}
                                  style={{ padding: "9px 16px", background: "rgba(220,53,69,.08)", border: "1px solid rgba(220,53,69,.3)", color: "#dc3545", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                                >
                                  <i className="fa fa-times me-1" />Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div style={{ background: "#1a1a2e", borderRadius: 20, padding: 36, width: "100%", maxWidth: 500, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 style={{ color: "#fff", fontWeight: 800, margin: 0, fontSize: 20 }}>
                {modal.type === "review" ? "⭐ Rate Your Experience" : "📝 File a Complaint"}
              </h4>
              <button onClick={() => setModal(null)} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <p style={{ color: "#e94560", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <i className="fa fa-calendar me-1" />{modal.booking.event?.event_name}
            </p>

            <form onSubmit={handleModalSubmit}>
              {modal.type === "review" ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginBottom: 10, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Your Rating</label>
                    <div className="d-flex gap-3 align-items-center">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <i
                          key={r}
                          className={`fa ${r <= (form.rating || 5) ? "fa-star" : "fa-star-o"}`}
                          onClick={() => setForm({ ...form, rating: r })}
                          style={{ fontSize: 32, color: "#e94560", cursor: "pointer", transition: "transform .15s" }}
                          onMouseEnter={(e) => { e.target.style.transform = "scale(1.3)"; }}
                          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                        />
                      ))}
                      <span style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginLeft: 4 }}>{form.rating || 5}/5</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Your Review *</label>
                    <textarea
                      value={form.review || ""}
                      onChange={(e) => setForm({ ...form, review: e.target.value })}
                      required rows={4} placeholder="Tell others about your experience at this event..."
                      style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", resize: "vertical" }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Subject *</label>
                    <input
                      type="text" value={form.subject || ""}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required placeholder="Brief subject of your complaint"
                      style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Message *</label>
                    <textarea
                      value={form.message || ""}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required rows={4} placeholder="Describe the issue in detail..."
                      style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", resize: "vertical" }}
                    />
                  </div>
                </>
              )}
              <div className="d-flex gap-3">
                <button
                  type="submit" disabled={submitting}
                  style={{ flex: 2, padding: "13px", background: "#e94560", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15, boxShadow: "0 4px 12px rgba(233,69,96,.3)" }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button" onClick={() => setModal(null)}
                  style={{ flex: 1, padding: "13px", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
