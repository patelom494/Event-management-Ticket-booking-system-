import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getBookings, updateBooking } from "../services/api";

const BACKEND = "http://localhost:8000";

export default function ManageBookings({ setIsAuthenticated, adminName }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getBookings(); setBookings(r.data.data || []); }
    catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openUpdate = (b) => { setSelected(b); setStatus(b.status); setModal(true); };

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await updateBooking({ id: selected._id, status });
      if (r.data.success) { toast.success("Booking updated!"); setModal(false); fetch(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed!"); }
    finally { setSaving(false); }
  };

  const badge = (s) => {
    const m = { Booked:"bg-label-success", Cancelled:"bg-label-danger", Pending:"bg-label-warning", Success:"bg-label-success", Failed:"bg-label-danger" };
    return <span className={`badge ${m[s]||"bg-label-secondary"}`}>{s}</span>;
  };

  const counts = ["Booked","Cancelled"].reduce((a,s) => { a[s]=bookings.filter(b=>b.status===s).length; return a; }, {});

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12">
        <h4 className="fw-bold mb-1">Manage Bookings</h4>
        <p className="text-muted">View and update all event ticket bookings.</p>
      </div></div>

      {!loading && bookings.length > 0 && (
        <div className="row g-3 mb-4">
          {[{l:"Total",v:bookings.length,c:"#696cff"},{l:"Booked",v:counts.Booked,c:"#28a745"},{l:"Cancelled",v:counts.Cancelled,c:"#dc3545"}].map((s) => (
            <div key={s.l} className="col-md-4"><div className="card" style={{ borderLeft:`4px solid ${s.c}` }}>
              <div className="card-body py-3"><p className="text-muted mb-1" style={{ fontSize:12 }}>{s.l}</p><h4 className="fw-bold mb-0" style={{ color:s.c }}>{s.v}</h4></div>
            </div></div>
          ))}
        </div>
      )}

      <DataTable title="All Bookings" columns={["Customer","Event","Seats","Amount","Status","Payment","Date","Action"]}
        data={bookings} loading={loading} searchKeys={["user.name","event.event_name","status","payment_status"]}
        emptyMessage="No bookings yet."
        renderRow={(b, idx) => (
          <tr key={b._id}>
            <td>{idx}</td>
            <td><p className="mb-0 fw-semibold" style={{fontSize:13}}>{b.user?.name||"—"}</p><small className="text-muted">{b.user?.email}</small></td>
            <td>
              <div className="d-flex align-items-center gap-2">
                {b.event?.event_img&&<img src={`${BACKEND}${b.event.event_img}`} alt="" style={{width:30,height:30,borderRadius:6,objectFit:"cover"}} onError={(e)=>{e.target.style.display="none";}}/>}
                <span style={{fontSize:13}}>{b.event?.event_name||"—"}</span>
              </div>
            </td>
            <td><span className="badge bg-label-info">{b.seats}</span></td>
            <td><strong style={{color:"#e94560"}}>₹{b.total_price}</strong></td>
            <td>{badge(b.status)}</td>
            <td>{badge(b.payment_status||"Pending")}</td>
            <td><span style={{fontSize:12}}>{b.date?new Date(b.date).toLocaleDateString("en-IN"):"-"}</span></td>
            <td><button className="btn btn-sm btn-outline-primary" onClick={() => openUpdate(b)}><i className="bx bx-edit"/></button></td>
          </tr>
        )}
      />

      {modal && selected && (
        <div className="modal fade show d-block" style={{ background:"rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Update Booking</h5><button type="button" className="btn-close" onClick={()=>setModal(false)}/></div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="alert alert-light mb-3" style={{fontSize:13}}>
                    <p className="mb-1"><strong>Customer:</strong> {selected.user?.name}</p>
                    <p className="mb-1"><strong>Event:</strong> {selected.event?.event_name}</p>
                    <p className="mb-0"><strong>Seats:</strong> {selected.seats} × ₹{selected.total_price}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Booking Status</label>
                    <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)} required>
                      <option value="Booked">Booked</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving?<><span className="spinner-border spinner-border-sm me-1"/>Updating...</>:"Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
