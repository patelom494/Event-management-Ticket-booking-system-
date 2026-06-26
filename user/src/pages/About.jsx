import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ background: "#0d0d1a" }}>

      {/* Page Header */}
      <div className="page-heading-shows-events">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>About ArtXibition</h2>
              <span>India's premier live event and ticket booking platform.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Who We Are ── */}
      <div style={{ padding: "64px 0" }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div style={{ borderRadius: 18, overflow: "hidden", position: "relative" }}>
                <img
                  src="/assets/images/about-image.jpg" alt="About ArtXibition"
                  style={{ width: "100%", borderRadius: 18 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(255,255,255,.1)" }}>
                  <p style={{ color: "#e94560", fontWeight: 800, fontSize: 22, margin: 0 }}>Since 2024</p>
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, margin: 0 }}>Connecting India to Live Events</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Who We Are</p>
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(24px,3.5vw,40px)", marginBottom: 16, lineHeight: 1.2 }}>
                Bringing Live Events<br />to Your Fingertips
              </h2>
              <p style={{ color: "rgba(255,255,255,.6)", lineHeight: 1.9, marginBottom: 16, fontSize: 15 }}>
                ArtXibition is a comprehensive digital platform connecting event lovers with live concerts, cultural shows, art exhibitions, and more across India. Our mission is to make event discovery and ticket booking seamless, secure, and enjoyable.
              </p>
              <p style={{ color: "rgba(255,255,255,.6)", lineHeight: 1.9, marginBottom: 36, fontSize: 15 }}>
                From music festivals in Mumbai to art exhibitions in Ahmedabad — we bring you closer to experiences that matter. Book instantly, pay securely, and enjoy unforgettable shows.
              </p>

              {/* Stats */}
              <div className="row g-3 mb-5">
                {[
                  { n: "500+",  l: "Events Hosted"     },
                  { n: "50K+",  l: "Happy Attendees"   },
                  { n: "100+",  l: "Artists"            },
                  { n: "4.8★",  l: "Average Rating"    },
                ].map((s) => (
                  <div key={s.l} className="col-6">
                    <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "20px", textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
                      <h3 style={{ color: "#e94560", fontWeight: 900, marginBottom: 4, fontSize: 28 }}>{s.n}</h3>
                      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: 0 }}>{s.l}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/events" className="main-dark-button" style={{ display: "inline-block" }}>
                <i className="fa fa-calendar me-2" />Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission / Values ── */}
      <div style={{ background: "#1a1a2e", padding: "64px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Our Values</p>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, margin: 0 }}>Why Choose ArtXibition?</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: "fa-shield",       title: "Secure Payments",       desc: "Every transaction is protected by Razorpay's bank-grade security. Your financial data is always safe." },
              { icon: "fa-bolt",         title: "Instant Booking",       desc: "Book your seats in seconds. No waiting, no queues — just seamless digital ticketing." },
              { icon: "fa-times-circle", title: "Easy Cancellation",     desc: "Plans changed? Cancel your booking hassle-free and get your seats released immediately." },
              { icon: "fa-star",         title: "Curated Events",        desc: "We handpick the best concerts, shows, and exhibitions from across India for our users." },
              { icon: "fa-mobile",       title: "Mobile Friendly",       desc: "A fully responsive platform that works beautifully on every screen, every device." },
              { icon: "fa-headphones",   title: "24/7 Support",          desc: "Our support team is always here to help you with bookings, payments, and queries." },
            ].map((item) => (
              <div key={item.title} className="col-lg-4 col-md-6">
                <div
                  style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, padding: 28, border: "1px solid rgba(255,255,255,.07)", height: "100%", transition: "all .25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(233,69,96,.12)", border: "1px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 24 }} />
                  </div>
                  <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 10, fontSize: 17 }}>{item.title}</h5>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div style={{ padding: "64px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Simple Steps</p>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, margin: 0 }}>How It Works</h2>
          </div>
          <div className="row g-0">
            {[
              { n: "01", icon: "fa-search",       title: "Discover Events",    desc: "Browse events by category, date, or location." },
              { n: "02", icon: "fa-ticket",       title: "Select Your Seats",  desc: "Choose the number of seats and confirm." },
              { n: "03", icon: "fa-credit-card",  title: "Secure Payment",     desc: "Pay safely through Razorpay." },
              { n: "04", icon: "fa-check-circle", title: "Enjoy the Show!",    desc: "Show up and create amazing memories." },
            ].map((item, i) => (
              <div key={item.n} className="col-md-3" style={{ position: "relative" }}>
                {i < 3 && (
                  <div className="d-none d-md-block" style={{ position: "absolute", top: 28, right: 0, width: "50%", height: 2, background: "rgba(233,69,96,.2)", zIndex: 0 }} />
                )}
                <div style={{ textAlign: "center", padding: "0 20px 20px", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(233,69,96,.1)", border: "2px solid rgba(233,69,96,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 24 }} />
                  </div>
                  <span style={{ color: "#e94560", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Step {item.n}</span>
                  <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>{item.title}</h5>
                  <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: "linear-gradient(135deg, #e94560, #c7253e)", padding: "60px 0" }}>
        <div className="container text-center">
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 32, marginBottom: 12 }}>Ready to Experience Live Events?</h2>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 16, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Join thousands of event lovers and book your next unforgettable experience today.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/events" style={{ background: "#fff", color: "#e94560", padding: "14px 32px", borderRadius: 6, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
              Browse Events
            </Link>
            <Link to="/register" style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "14px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none", border: "2px solid rgba(255,255,255,.5)" }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
