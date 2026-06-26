import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEvents, getCategories, getReviews } from "../services/api";

const BACKEND = "http://localhost:8000";
const SPIN = `@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`;

function CountBox({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 72 }}>
      <div style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 8 }}>
        <span style={{ color: "#e94560", fontSize: 32, fontWeight: 900, lineHeight: 1, display: "block" }}>{value}</span>
      </div>
      <span style={{ color: "rgba(255,255,255,.55)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</span>
    </div>
  );
}

function EventCard({ event: ev, navigate }) {
  return (
    <div
      onClick={() => navigate(`/event/${ev._id}`)}
      style={{ background: "#1a1a2e", borderRadius: 14, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,.07)", transition: "all .3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(233,69,96,.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
        <img
          src={ev.event_img ? `${BACKEND}${ev.event_img}` : "/assets/images/show-events-01.jpg"}
          alt={ev.event_name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
          onError={(e) => { e.target.src = "/assets/images/show-events-01.jpg"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 50%, transparent 100%)" }} />
        <span style={{ position: "absolute", top: 12, left: 12, background: "#e94560", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>
          {ev.category?.name || "Event"}
        </span>
        <span style={{ position: "absolute", top: 12, right: 12, background: ev.available_seats > 0 ? "rgba(40,167,69,.9)" : "rgba(220,53,69,.9)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
          {ev.available_seats > 0 ? `${ev.available_seats} left` : "Sold Out"}
        </span>
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 11, margin: "0 0 2px" }}>
            <i className="fa fa-calendar me-1" />
            {new Date(ev.datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <h5 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event_name}</h5>
        <p style={{ color: "#e94560", fontSize: 12, marginBottom: 10 }}><i className="fa fa-user me-1" />{ev.artist_name}</p>
        <div className="d-flex justify-content-between align-items-center">
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, margin: 0 }}>
            <i className="fa fa-map-marker me-1" />{ev.address?.slice(0, 22)}{ev.address?.length > 22 ? "..." : ""}
          </p>
          <span style={{ color: "#e94560", fontWeight: 900, fontSize: 18 }}>₹{ev.price_per_seat}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home({ isAuthenticated }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getEvents(), getCategories(), getReviews()])
      .then(([eR, cR, rR]) => {
        const evs = eR.data.data || [];
        setEvents(evs);
        setCategories(cR.data.data || []);
        setReviews((rR.data.data || []).slice(0, 6));
        const upcoming = evs
          .filter((e) => new Date(e.datetime) > new Date())
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        if (upcoming.length) setNextEvent(upcoming[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!nextEvent) return;
    const tick = () => {
      const diff = new Date(nextEvent.datetime) - new Date();
      if (diff <= 0) return setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextEvent]);

  const filtered = catFilter
    ? events.filter((e) => String(e.category_id) === catFilter || String(e.category?._id) === catFilter)
    : events;

  const upcomingEvents = filtered.filter((e) => new Date(e.datetime) > new Date());

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  return (
    <div style={{ background: "#0d0d1a" }}>
      <style>{SPIN}</style>

      {/* ── HERO BANNER ── */}
      <div className="main-banner" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,.75) 0%, rgba(15,10,30,.6) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 60%, rgba(233,69,96,.15) 0%, transparent 55%)", zIndex: 1 }} />


        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="row">
            <div className="col-lg-8">
              <div className="main-content" style={{ animation: "fadeInUp .8s ease both" }}>
                {nextEvent ? (
                  <>
                    <h6 style={{ color: "#e94560", fontSize: 15, fontWeight: 600, marginBottom: 10, letterSpacing: 1, maxWidth: 520 }}>
                      <i className="fa fa-calendar me-2" />
                      {new Date(nextEvent.datetime).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </h6>
                    <h5 style={{ color: "#fff", fontSize: "clamp(15px,2vw,30px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 16, maxWidth: 520 }}>
                      {nextEvent.event_name}
                    </h5>
                    <p style={{ color: "rgba(255,255,255,.65)", fontSize: 16, marginBottom: 32, maxWidth: 520 }}>
                      <i className="fa fa-user me-2" style={{ color: "#e94560" }} />{nextEvent.artist_name}
                      <span style={{ margin: "0 12px", opacity: .4 }}>|</span>
                      <i className="fa fa-map-marker me-2" style={{ color: "#e94560" }} />{nextEvent.address?.slice(0, 40)}
                    </p>
                    <div className="d-flex gap-3 flex-wrap" style={{marginLeft:"50px"}}>
                      <Link to={`/ticket/${nextEvent._id}`} style={{ background: "#e94560", color: "#fff", padding: "14px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all .3s" }}>
                        <i className="fa fa-ticket" /> Purchase Tickets
                      </Link>
                      <Link to="/tickets" style={{ background: "rgba(255,255,255,.1)", color: "#fff", padding: "14px 32px", borderRadius: 6, fontWeight: 600, fontSize: 15, textDecoration: "none", border: "1px solid rgba(255,255,255,.2)", backdropFilter: "blur(4px)" }}>
                        Browse All Events
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h6 style={{ color: "#e94560", fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Discover Live Experiences</h6>
                    <h2 style={{ color: "#fff", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 32 }}>
                      Events That<br />Move You
                    </h2>
                    <Link to="/events" style={{ background: "#e94560", color: "#fff", padding: "14px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                      Browse Events
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 2, textAlign: "center" }}>
          <div style={{ width: 24, height: 36, border: "2px solid rgba(255,255,255,.3)", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4px", margin: "0 auto 8px" }}>
            <div style={{ width: 4, height: 8, background: "#e94560", borderRadius: 2, animation: "bounce 1.5s infinite" }} />
          </div>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Scroll</span>
          <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}`}</style>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: "#e94560", padding: "28px 0" }}>
        <div className="container">
          <div className="row g-0 text-center">
            {[
              { n: events.length + "+", l: "Total Events" },
              { n: "50K+", l: "Happy Attendees" },
              { n: "100+", l: "Artists" },
              { n: avgRating + "★", l: "Avg Rating" },
            ].map((s) => (
              <div key={s.l} className="col-6 col-md-3">
                <div style={{ borderRight: "1px solid rgba(255,255,255,.2)", padding: "8px 0" }}>
                  <h3 style={{ color: "#fff", fontWeight: 900, fontSize: 28, marginBottom: 2 }}>{s.n}</h3>
                  <p style={{ color: "rgba(255,255,255,.8)", fontSize: 13, margin: 0 }}>{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EVENT CAROUSEL ── */}
      {events.length > 0 && (
        <div className="show-events-carousel" style={{ background: "#14141f" }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {events.slice(0, 10).map((ev) => (
                    <div
                      key={ev._id}
                      onClick={() => navigate(`/event/${ev._id}`)}
                      style={{ minWidth: 160, cursor: "pointer", borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "2px solid transparent", transition: "border-color .25s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <img
                        src={ev.event_img ? `${BACKEND}${ev.event_img}` : "/assets/images/show-events-01.jpg"}
                        alt={ev.event_name}
                        style={{ width: "100%", height: 120, objectFit: "cover" }}
                        onError={(e) => { e.target.src = "/assets/images/show-events-01.jpg"; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AMAZING VENUES INFO ── */}
      <div className="amazing-venues">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="left-content" style={{ color: "white !important" }}>
                <h4>Discover &amp; Book Amazing Live Events</h4>
                <p>ArtXibition is your gateway to live concerts, cultural shows, art exhibitions, and more. Browse upcoming events, select your seats, and book tickets instantly — all in one place.</p>
                <br />
                <p>Experience the magic of live performances with our seamless online booking platform. From music festivals to comedy shows, we bring you the best events across India.</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="right-content">
                <h5><i className="fa fa-map-marker" /> Find Events</h5>
                <span>Ahmedabad, Gujarat<br />&amp; Across India</span>
                <div className="text-button">
                  <Link to="/events">Browse Events <i className="fa fa-arrow-right" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <div style={{ background: "#1a1a2e", padding: "64px 0" }}>
          <div className="container">
            <div className="text-center mb-5">
              <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Explore</p>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, marginBottom: 0 }}>Browse by Category</h2>
            </div>

            {/* Category Pills */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
              <button
                onClick={() => setCatFilter("")}
                style={{ padding: "9px 22px", borderRadius: 25, border: `2px solid ${!catFilter ? "#e94560" : "rgba(255,255,255,.15)"}`, background: !catFilter ? "#e94560" : "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .25s" }}
              >
                All Events
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCatFilter(String(cat._id))}
                  style={{ padding: "9px 22px", borderRadius: 25, border: `2px solid ${catFilter === String(cat._id) ? "#e94560" : "rgba(255,255,255,.15)"}`, background: catFilter === String(cat._id) ? "#e94560" : "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .25s", display: "flex", alignItems: "center", gap: 8 }}
                >
                  {cat.image && (
                    <img src={`${BACKEND}${cat.image}`} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS GRID ── */}
      <div style={{ padding: "64px 0", background: "#0d0d1a" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
            <div>
              <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Don't Miss Out</p>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, margin: 0 }}>Upcoming Events</h2>
            </div>
            <Link to="/events" className="main-dark-button" style={{ padding: "10px 24px" }}>View All Events</Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,.35)" }}>
              <i className="fa fa-calendar-times-o" style={{ fontSize: 56, marginBottom: 16 }} />
              <h4>No upcoming events found</h4>
            </div>
          ) : (
            <div className="row g-4">
              {upcomingEvents.slice(0, 6).map((ev) => (
                <div key={ev._id} className="col-lg-4 col-md-6">
                  <EventCard event={ev} navigate={navigate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: "#1a1a2e", padding: "64px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Simple Process</p>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, margin: 0 }}>How It Works</h2>
          </div>
          <div className="row g-4">
            {[
              { step: "01", icon: "fa-search", title: "Discover Events", desc: "Browse hundreds of live events across India — concerts, exhibitions, comedy shows & more." },
              { step: "02", icon: "fa-ticket", title: "Select Your Seats", desc: "Choose the number of seats, view seat availability, and lock in your spot instantly." },
              { step: "03", icon: "fa-credit-card", title: "Secure Payment", desc: "Pay safely via Razorpay — trusted by millions across India." },
              { step: "04", icon: "fa-check-circle", title: "Enjoy the Show!", desc: "Get your booking confirmation and show up for an unforgettable experience." },
            ].map((item) => (
              <div key={item.step} className="col-lg-3 col-md-6">
                <div style={{ textAlign: "center", padding: 28 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(233,69,96,.12)", border: "2px solid rgba(233,69,96,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className={`fa ${item.icon}`} style={{ color: "#e94560", fontSize: 28 }} />
                  </div>
                  <span style={{ color: "#e94560", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Step {item.step}</span>
                  <h5 style={{ color: "#fff", fontWeight: 700, margin: "10px 0 10px" }}>{item.title}</h5>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      {reviews.length > 0 && (
        <div style={{ background: "#0d0d1a", padding: "64px 0" }}>
          <div className="container">
            <div className="text-center mb-5">
              <p style={{ color: "#e94560", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Reviews</p>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 32, margin: 0 }}>What Our Audience Says</h2>
            </div>
            <div className="row g-4">
              {reviews.slice(0, 3).map((r, i) => (
                <div key={r._id || i} className="col-md-4">
                  <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 16, padding: 28, border: "1px solid rgba(255,255,255,.07)", height: "100%", position: "relative" }}>
                    <i className="fa fa-quote-left" style={{ color: "rgba(233,69,96,.2)", fontSize: 36, position: "absolute", top: 20, right: 24 }} />
                    <div className="d-flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i key={s} className={`fa ${s <= r.rating ? "fa-star" : "fa-star-o"}`} style={{ color: "#e94560", fontSize: 15 }} />
                      ))}
                    </div>
                    <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, fontStyle: "italic", lineHeight: 1.8, marginBottom: 20 }}>"{r.review?.slice(0, 140)}{r.review?.length > 140 ? "..." : ""}"</p>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#e94560,#c7253e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                        {r.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{r.user?.name || "Attendee"}</p>
                        <p style={{ color: "#e94560", fontSize: 12, margin: 0 }}>{r.event?.event_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/reviews" style={{ color: "#e94560", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
                View All Reviews <i className="fa fa-arrow-right ms-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div style={{ background: "linear-gradient(135deg, #e94560 0%, #c7253e 100%)", padding: "72px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('/assets/images/banner-bg.jpg') center/cover no-repeat", opacity: .08 }} />
        <div className="container text-center" style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(24px,4vw,42px)", marginBottom: 12, lineHeight: 1.2 }}>Ready for the Next Show?</h2>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 16, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            Don't miss out on the best live events in India. Book your tickets today and create memories that last a lifetime.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to={isAuthenticated ? "/tickets" : "/register"}
              style={{ background: "#fff", color: "#e94560", padding: "14px 36px", borderRadius: 6, fontWeight: 800, fontSize: 15, textDecoration: "none" }}
            >
              {isAuthenticated ? "🎫 Browse Tickets" : "🚀 Get Started Free"}
            </Link>
            {!isAuthenticated && (
              <Link to="/login" style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "14px 36px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none", border: "2px solid rgba(255,255,255,.5)" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
