import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Contact() {
  const [form,    setForm]    = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you within 24 hours.");
    }, 1200);
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10, color: "#fff", fontSize: 14,
    outline: "none", transition: "border-color .2s",
  };

  return (
    <div style={{ background: "#0d0d1a" }}>

      {/* Page Header */}
      <div className="page-heading-rent-venue">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Contact Us</h2>
              <span>We'd love to hear from you. Get in touch with the ArtXibition team.</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "64px 0" }}>
        <div className="container">
          <div className="row g-5">

            {/* ── Left: Contact Info ── */}
            <div className="col-lg-5">
              <div style={{ marginBottom: 36 }}>
                <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Get In Touch</p>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, marginBottom: 14, lineHeight: 1.2 }}>We're Here to Help</h2>
                <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.8 }}>
                  Have a question about an event, a booking issue, or want to partner with us? Send us a message and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="d-flex flex-column gap-3 mb-5">
                {[
                  { icon: "fa-map-marker", title: "Our Office",      info: "Navrangpura, Ahmedabad, Gujarat – 380009" },
                  { icon: "fa-phone",      title: "Call Us",         info: "+91-12345-67890" },
                  { icon: "fa-envelope",   title: "Email Us",        info: "support@artxibition.in" },
                  { icon: "fa-clock-o",    title: "Working Hours",   info: "Mon–Sat: 9:00 AM – 6:00 PM IST" },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "rgba(255,255,255,.03)", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(255,255,255,.07)", transition: "border-color .25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(233,69,96,.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(233,69,96,.12)", border: "1px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 18 }} />
                    </div>
                    <div>
                      <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{item.title}</h6>
                      <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, margin: 0 }}>{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, marginBottom: 12 }}>Follow us on</p>
                <div className="d-flex gap-3">
                  {[
                    { icon: "fa-facebook",  href: "#" },
                    { icon: "fa-twitter",   href: "#" },
                    { icon: "fa-instagram", href: "#" },
                    { icon: "fa-youtube",   href: "#" },
                  ].map((s) => (
                    <a
                      key={s.icon} href={s.href}
                      style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)", textDecoration: "none", transition: "all .25s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.color = "#e94560"; e.currentTarget.style.background = "rgba(233,69,96,.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <i className={`fa ${s.icon}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Contact Form ── */}
            <div className="col-lg-7">
              <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 18, padding: "36px", border: "1px solid rgba(255,255,255,.07)" }}>
                <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Send Us a Message</h4>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14, marginBottom: 28 }}>We typically reply within 24 hours.</p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Full Name *</label>
                      <div style={{ position: "relative" }}>
                        <i className="fa fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.2)", fontSize: 14 }} />
                        <input
                          type="text" placeholder="John Doe" required
                          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                          style={{ ...inputStyle, paddingLeft: 40 }}
                          onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Email Address *</label>
                      <div style={{ position: "relative" }}>
                        <i className="fa fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.2)", fontSize: 13 }} />
                        <input
                          type="email" placeholder="you@example.com" required
                          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          style={{ ...inputStyle, paddingLeft: 40 }}
                          onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Phone Number</label>
                      <div style={{ position: "relative" }}>
                        <i className="fa fa-phone" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.2)", fontSize: 14 }} />
                        <input
                          type="tel" placeholder="+91 9876543210"
                          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          style={{ ...inputStyle, paddingLeft: 40 }}
                          onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Subject *</label>
                      <select
                        required
                        value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        style={{ ...inputStyle, background: "rgba(0,0,0,1)" }}
                        onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                      >
                        <option value="" disabled>Select a topic</option>
                        <option value="booking">Booking Issue</option>
                        <option value="payment">Payment Problem</option>
                        <option value="cancellation">Cancellation Request</option>
                        <option value="event">Event Enquiry</option>
                        <option value="partnership">Partnership / Events</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Message *</label>
                      <textarea
                        rows={5} placeholder="Describe your query in detail..." required
                        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        style={{ ...inputStyle, resize: "vertical" }}
                        onFocus={(e) => { e.target.style.borderColor = "#e94560"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={sending}
                    style={{ marginTop: 20, padding: "14px 32px", background: sending ? "rgba(233,69,96,.5)" : "#e94560", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: sending ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(233,69,96,.3)", display: "inline-flex", alignItems: "center", gap: 8, transition: "all .25s" }}
                  >
                    {sending ? (
                      <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                        Sending...
                      </>
                    ) : (
                      <><i className="fa fa-paper-plane me-1" />Send Message</>
                    )}
                  </button>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Quick Help ── */}
      <div style={{ background: "#1a1a2e", padding: "48px 0" }}>
        <div className="container">
          <div className="text-center mb-4">
            <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Need Quick Help?</h4>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Check out these commonly asked questions</p>
          </div>
          <div className="row g-3 justify-content-center">
            {[
              { icon: "fa-ticket",       label: "My Bookings",    to: "/my-bookings"   },
              { icon: "fa-user",         label: "My Profile",     to: "/profile"       },
              { icon: "fa-calendar",     label: "Browse Events",  to: "/events"        },
              { icon: "fa-star",         label: "Reviews",        to: "/reviews"       },
            ].map((item) => (
              <div key={item.label} className="col-6 col-md-3">
                <Link to={item.to} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(255,255,255,.07)", transition: "all .25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.background = "rgba(233,69,96,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                  >
                    <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 24, marginBottom: 10, display: "block" }} />
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{item.label}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
