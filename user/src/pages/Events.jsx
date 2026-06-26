import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getEvents, getCategories } from "../services/api";

const BACKEND = "http://localhost:8000";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const catParam = searchParams.get("category_id") || "";
    setCatFilter(catParam);
    Promise.all([getEvents({ category_id: catParam || undefined }), getCategories()]).then(([eR, cR]) => {
      setEvents(eR.data.data || []);
      setCategories(cR.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [searchParams]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = {};
      if (catFilter) params.category_id = catFilter;
      if (minP) params.min_price = minP;
      if (maxP) params.max_price = maxP;
      const res = await getEvents(params);
      setEvents(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const now = new Date();
  let filtered = events.filter((e) =>
    !search || e.event_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.address?.toLowerCase().includes(search.toLowerCase())
  );
  const upcoming = filtered.filter((e) => new Date(e.datetime) > now);
  const past = filtered.filter((e) => new Date(e.datetime) <= now);
  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <div>
      {/* Page Heading */}
      <div className="page-heading-shows-events">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Shows & Events</h2>
              <span>Discover upcoming and past shows & events.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shows-events-tabs">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* Search + filters */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="Search events, artists..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.15)", color: "#000", padding: "10px 16px", borderRadius: 6 }} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                    style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,.15)", color: "#000", padding: "10px 16px", borderRadius: 6 }}>
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control" placeholder="Min ₹" value={minP} onChange={(e) => setMinP(e.target.value)}
                    style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.15)", color: "#000", borderRadius: 6 }} />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control" placeholder="Max ₹" value={maxP} onChange={(e) => setMaxP(e.target.value)}
                    style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.15)", color: "#000", borderRadius: 6 }} />
                </div>
                <div className="col-md-1">
                  <button onClick={handleFilter} className="main-dark-button w-100" style={{ padding: "10px 0" }}>Go</button>
                </div>
              </div>

              {/* Tabs */}
              <div className="heading-tabs" style={{ marginBottom: 24 }}>
                <div className="row">
                  <div className="col-lg-8">
                    <ul style={{ display: "flex", listStyle: "none", padding: 0, gap: 8 }}>
                      <li>
                        <button onClick={() => setActiveTab("upcoming")}
                          style={{ padding: "10px 28px", background: activeTab === "upcoming" ? "#e94560" : "transparent", border: `2px solid ${activeTab === "upcoming" ? "#e94560" : "rgba(255,255,255,.2)"}`, color: "#000", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                          Upcoming ({upcoming.length})
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("past")}
                          style={{ padding: "10px 28px", background: activeTab === "past" ? "#e94560" : "transparent", border: `2px solid ${activeTab === "past" ? "#e94560" : "rgba(255,255,255,.2)"}`, color: "#000", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                          Past ({past.length})
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 text-end">
                    <Link to="/tickets" className="main-dark-button">Browse Tickets</Link>
                  </div>
                </div>
              </div>

              {/* Events List */}
              {loading ? (
                <div className="text-center py-5">
                  <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : displayed.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,1)" }}>
                  <i className="fa fa-calendar-times-o" style={{ fontSize: 64, marginBottom: 16 }} />
                  <h4>No {activeTab} events found</h4>
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {displayed.map((ev) => (
                    <li key={ev._id} style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,.07)", padding: 20, transition: "all .3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e94560"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}>
                      <div className="row align-items-center g-3">
                        <div className="col-lg-2 col-md-3">
                          <img src={ev.event_img ? `${BACKEND}${ev.event_img}` : "/assets/images/event-01.jpg"}
                            alt={ev.event_name} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }}
                            onError={(e) => { e.target.src = "/assets/images/event-01.jpg"; }} />
                        </div>
                        <div className="col-lg-4 col-md-5">
                          <h5 style={{ color: "#000", fontWeight: 700, marginBottom: 4 }}>{ev.event_name}</h5>
                          <p style={{ color: "#e94560", fontSize: 13, marginBottom: 4 }}><i className="fa fa-user me-1" />{ev.artist_name}</p>
                          <p style={{ color: "rgba(0,0,0,1)", fontSize: 12, marginBottom: 0 }}>
                            <span style={{ background: "rgba(233,69,96,.15)", color: "#e94560", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{ev.category?.name}</span>
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-4">
                          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 4 }}>
                            <i className="fa fa-clock-o me-2" style={{ color: "#e94560" }} />
                            {new Date(ev.datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(ev.datetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 0 }}>
                            <i className="fa fa-map-marker me-2" style={{ color: "#e94560" }} />{ev.address}
                          </p>
                        </div>
                        <div className="col-lg-3 text-end">
                          <p style={{ color: "#e94560", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>₹{ev.price_per_seat}</p>
                          <p style={{ color: "rgba(0,0,0,1)", fontSize: 12, marginBottom: 10 }}>{ev.available_seats} seats left</p>
                          <button onClick={() => navigate(`/ticket/${ev._id}`)} className="main-dark-button" style={{ fontSize: 13, padding: "8px 20px" }}>
                            Buy Ticket
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
