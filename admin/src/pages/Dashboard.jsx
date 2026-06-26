import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../common/AdminLayout";
import { getDashboardStats } from "../services/api";

export default function Dashboard({ setIsAuthenticated, adminName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((r) => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label:"Total Users",     value:stats.totalUsers,       sub:"Registered users",              icon:"bx-user",           color:"#696cff", bg:"#eeedfd" },
    { label:"Categories",      value:stats.totalCategories,  sub:"Event categories",              icon:"bx-category",       color:"#e94560", bg:"#fde9ec" },
    { label:"Total Events",    value:stats.totalEvents,       sub:`${stats.activeEvents} active`, icon:"bx-calendar-event", color:"#03c3ec", bg:"#e0f8ff" },
    { label:"Active Events",   value:stats.activeEvents,      sub:"Currently live",               icon:"bx-radio-circle",   color:"#28a745", bg:"#d4edda" },
    { label:"Total Bookings",  value:stats.totalBookings,     sub:`${stats.bookedCount} booked`,  icon:"bx-calendar-event",         color:"#ffab00", bg:"#fff7e0" },
    { label:"Booked",          value:stats.bookedCount,       sub:"Active bookings",              icon:"bx-check-circle",   color:"#28a745", bg:"#d4edda" },
    { label:"Cancelled",       value:stats.cancelledCount,    sub:"Cancelled bookings",           icon:"bx-x-circle",       color:"#dc3545", bg:"#f8d7da" },
    { label:"Revenue",         value:`₹${(stats.totalRevenue||0).toLocaleString("en-IN")}`, sub:"Total earnings", icon:"bx-rupee", color:"#ffab00", bg:"#fff7e0" },
    { label:"Avg. Rating",     value:`${stats.avgRating}/5`, sub:"Customer satisfaction",         icon:"bx-star",           color:"#e94560", bg:"#fde9ec" },
  ] : [];

  const badge = (s) => {
    const m = { Booked:"bg-label-success", Cancelled:"bg-label-danger", Pending:"bg-label-warning", Success:"bg-label-success" };
    return <span className={`badge ${m[s]||"bg-label-secondary"}`}>{s}</span>;
  };

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h4 className="fw-bold mb-1">Dashboard 🎭</h4>
            <p className="text-muted mb-0">Welcome back, {adminName}! Here's the platform overview.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/manage-events" className="btn btn-primary"><i className="bx bx-plus me-1" />Add Event</Link>
            <Link to="/manage-bookings" className="btn btn-outline-primary"><i className="bx bx-ticket me-1" />Bookings</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading...</p></div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {cards.map((c, i) => (
              <div key={i} className="col-xl-3 col-md-6">
                <div className="card h-100" style={{ borderLeft:`3px solid ${c.color}` }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div style={{ width:46,height:46,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <i className={`bx ${c.icon}`} style={{ fontSize:22,color:c.color }} />
                      </div>
                      <h3 className="fw-bold mb-0" style={{ color:c.color }}>{c.value}</h3>
                    </div>
                    <p className="mb-0 fw-semibold" style={{ color:"#697a8d",fontSize:14 }}>{c.label}</p>
                    <small className="text-muted">{c.sub}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <Link to="/manage-bookings" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="card-body p-0"><div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>#</th><th>Customer</th><th>Event</th><th>Seats</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
                    <tbody>
                      {!stats?.recentBookings?.length ? (
                        <tr><td colSpan="7" className="text-center py-4 text-muted">No bookings yet</td></tr>
                      ) : stats.recentBookings.map((b, i) => (
                        <tr key={b._id}>
                          <td>{i+1}</td>
                          <td><p className="mb-0 fw-semibold" style={{fontSize:14}}>{b.user?.name||"—"}</p><small className="text-muted">{b.user?.email}</small></td>
                          <td><p className="mb-0 fw-semibold" style={{fontSize:13}}>{b.event?.event_name||"—"}</p></td>
                          <td><span className="badge bg-label-info">{b.seats}</span></td>
                          <td><strong style={{color:"#e94560"}}>₹{b.total_price}</strong></td>
                          <td>{badge(b.status)}</td>
                          <td>{badge(b.payment_status||"Pending")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div></div>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Payments</h5>
              <Link to="/manage-payments" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0"><div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light"><tr><th>#</th><th>Customer</th><th>Amount</th><th>Razorpay ID</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {!stats?.recentPayments?.length ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No payments yet</td></tr>
                  ) : stats.recentPayments.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i+1}</td>
                      <td><p className="mb-0 fw-semibold" style={{fontSize:14}}>{p.user?.name||"—"}</p><small className="text-muted">{p.user?.email}</small></td>
                      <td><strong style={{color:"#e94560",fontSize:15}}>₹{p.payment}</strong></td>
                      <td><code style={{fontSize:11}}>{p.razorpay_payment_id?.slice(0,16)||"—"}</code></td>
                      <td><span className="text-muted" style={{fontSize:13}}>{p.date?new Date(p.date).toLocaleDateString("en-IN"):"-"}</span></td>
                      <td>{badge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
