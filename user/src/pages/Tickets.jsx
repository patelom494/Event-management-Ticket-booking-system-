import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getEvents, getCategories } from "../services/api";

const BACKEND = "http://localhost:8000";
const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

export default function Tickets() {
  const [events,     setEvents]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [catFilter,  setCatFilter]  = useState("");
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState("date");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get("category_id") || "";
    setCatFilter(cat);
    Promise.all([getEvents({ category_id: cat || undefined }), getCategories()])
      .then(([eR, cR]) => { setEvents(eR.data.data || []); setCategories(cR.data.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = catFilter ? { category_id: catFilter } : {};
      const res = await getEvents(params);
      setEvents(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  let filtered = events
    .filter((e) => new Date(e.datetime) > new Date())
    .filter((e) =>
      !search ||
      e.event_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.artist_name?.toLowerCase().includes(search.toLowerCase())
    );

  if (sortBy === "date")       filtered = [...filtered].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  if (sortBy === "price-asc")  filtered = [...filtered].sort((a, b) => a.price_per_seat - b.price_per_seat);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price_per_seat - a.price_per_seat);
  if (sortBy === "seats")      filtered = [...filtered].sort((a, b) => b.available_seats - a.available_seats);

  return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh" }}>
      <style>{SPIN}</style>

      {/* Page Header */}
      <div className="page-heading-shows-events">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Tickets On Sale Now!</h2>
              <span>Grab your seat for the hottest upcoming events in India.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tickets-page" style={{ padding: "40px 0" }}>
        <div className="container">

          {/* Filter Bar */}
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, padding: 24, marginBottom: 32, border: "1px solid rgba(255,255,255,.07)" }}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <h5 style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Find Your Next Event</h5>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>
                  {filtered.length} upcoming {filtered.length === 1 ? "event" : "events"} available
                </p>
              </div>
              <div className="col-lg-8">
                <div className="row g-2 align-items-end">
                  <div className="col-md-3">
                    <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Category</label>
                    <select
                      value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,.1)", color: "#fff", borderRadius: 8 }}
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Sort By</label>
                    <select
                      value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,.1)", color: "#fff", borderRadius: 8 }}
                    >
                      <option value="date">Date (Earliest)</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="seats">Most Seats Available</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: .8 }}>Search</label>
                    <div style={{ position: "relative" }}>
                      <i className="fa fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.25)", fontSize: 13 }} />
                      <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Event or artist name..."
                        style={{ width: "100%", padding: "10px 12px 10px 34px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", borderRadius: 8 }}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <button onClick={handleFilter} className="main-dark-button" style={{ width: "100%", padding: "10px 0" }}>
                      <i className="fa fa-filter me-1" />Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Quick Filters */}
          {categories.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setCatFilter("")}
                style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${!catFilter ? "#e94560" : "rgba(255,255,255,.12)"}`, background: !catFilter ? "rgba(233,69,96,.15)" : "transparent", color: !catFilter ? "#e94560" : "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .2s" }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setCatFilter(String(cat._id)); handleFilter(); }}
                  style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${catFilter === String(cat._id) ? "#e94560" : "rgba(255,255,255,.12)"}`, background: catFilter === String(cat._id) ? "rgba(233,69,96,.15)" : "transparent", color: catFilter === String(cat._id) ? "#e94560" : "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .2s" }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,.08)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Loading tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(233,69,96,.1)", border: "2px solid rgba(233,69,96,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <i className="fa fa-ticket" style={{ color: "#e94560", fontSize: 32 }} />
              </div>
              <h4 style={{ color: "rgba(255,255,255,.5)", fontWeight: 700, marginBottom: 8 }}>No tickets available</h4>
              <p style={{ color: "rgba(255,255,255,.25)", fontSize: 14 }}>Try changing your filters or check back later.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((ev) => (
                <div key={ev._id} className="col-lg-4 col-md-6">
                  <div
                    style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", transition: "all .3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(233,69,96,.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                      <img
                        src={ev.event_img ? `${BACKEND}${ev.event_img}` : "/assets/images/ticket-01.jpg"}
                        alt={ev.event_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.src = "/assets/images/ticket-01.jpg"; }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
                      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ background: "#e94560", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                          {ev.category?.name || "Event"}
                        </span>
                        <span style={{ background: ev.available_seats > 0 ? "rgba(40,167,69,.9)" : "rgba(220,53,69,.9)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                          {ev.available_seats > 0 ? `${ev.available_seats} left` : "Sold Out"}
                        </span>
                      </div>
                      <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                        <span style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,.8)", padding: "3px 10px", borderRadius: 20, fontSize: 10 }}>
                          <i className="fa fa-calendar me-1" />
                          {new Date(ev.datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "16px 18px" }}>
                      <h5 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.event_name}</h5>
                      <p style={{ color: "#e94560", fontSize: 12, marginBottom: 10 }}><i className="fa fa-user me-1" />{ev.artist_name}</p>
                      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginBottom: 14 }}>
                        <i className="fa fa-map-marker me-1" />{ev.address?.slice(0, 30)}{ev.address?.length > 30 ? "..." : ""}
                      </p>

                      {/* Dashed divider (ticket tear style) */}
                      <div style={{ borderTop: "2px dashed rgba(255,255,255,.1)", marginBottom: 14, position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: -8, width: 14, height: 14, borderRadius: "50%", background: "#0d0d1a" }} />
                        <div style={{ position: "absolute", right: -18, top: -8, width: 14, height: 14, borderRadius: "50%", background: "#0d0d1a" }} />
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 10, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .8 }}>Price / seat</p>
                          <span style={{ color: "#e94560", fontWeight: 900, fontSize: 22 }}>₹{ev.price_per_seat}</span>
                        </div>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/event/${ev._id}`}
                            style={{ padding: "8px 14px", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.6)", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => navigate(`/ticket/${ev._id}`)}
                            disabled={ev.available_seats === 0}
                            style={{ padding: "8px 16px", background: ev.available_seats > 0 ? "#e94560" : "rgba(255,255,255,.08)", color: ev.available_seats > 0 ? "#fff" : "rgba(255,255,255,.3)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: ev.available_seats > 0 ? "pointer" : "default" }}
                          >
                            {ev.available_seats > 0 ? "🎫 Buy" : "Sold Out"}
                          </button>
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
    </div>
  );
}
