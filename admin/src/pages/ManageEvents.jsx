import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getAdminEvents, getAdminCategories, addEvent, updateEvent, deleteEvent } from "../services/api";

const BACKEND = "http://localhost:8000";
const empty = { category_id:"", event_name:"", artist_name:"", price_per_seat:"", total_seats:"", address:"", lattitute:"", longitude:"", datetime:"", status:"Active" };

export default function ManageEvents({ setIsAuthenticated, adminName }) {
  const [events,     setEvents]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(empty);
  const [eventImg,   setEventImg]   = useState(null);
  const [artistImg,  setArtistImg]  = useState(null);
  const [prevEvent,  setPrevEvent]  = useState(null);
  const [prevArtist, setPrevArtist] = useState(null);
  const [saving,     setSaving]     = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eR, cR] = await Promise.all([getAdminEvents(), getAdminCategories()]);
      setEvents(eR.data.data || []);
      setCategories(cR.data.data || []);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(empty); setEventImg(null); setArtistImg(null); setPrevEvent(null); setPrevArtist(null); setModal(true);
  };
  const openEdit = (ev) => {
    setEditing(ev);
    const dt = ev.datetime ? new Date(ev.datetime).toISOString().slice(0,16) : "";
    setForm({ category_id:String(ev.category_id||ev.category?._id||""), event_name:ev.event_name, artist_name:ev.artist_name, price_per_seat:ev.price_per_seat, total_seats:ev.total_seats, address:ev.address, lattitute:ev.lattitute, longitude:ev.longitude, datetime:dt, status:ev.status||"Active" });
    setEventImg(null); setArtistImg(null);
    setPrevEvent(ev.event_img ? `${BACKEND}${ev.event_img}` : null);
    setPrevArtist(ev.artist_image ? `${BACKEND}${ev.artist_image}` : null);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (editing) fd.append("id", editing._id);
      if (eventImg)  fd.append("event_img",     eventImg);
      if (artistImg) fd.append("artist_image",  artistImg);
      const res = editing ? await updateEvent(fd) : await addEvent(fd);
      if (res.data.success) { toast.success(editing?"Event updated!":"Event added!"); setModal(false); fetchAll(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed!"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try { const r = await deleteEvent(id); if (r.data.success) { toast.success("Deleted!"); fetchAll(); } }
    catch (err) { toast.error(err.response?.data?.message || "Delete failed!"); }
  };

  const f = form; const sf = (k, v) => setForm({...form,[k]:v});

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12">
        <h4 className="fw-bold mb-1">Manage Events</h4>
        <p className="text-muted">Create and manage all events with details, pricing, and seating.</p>
      </div></div>

      <DataTable title="All Events" columns={["Image","Event","Artist","Category","Date","Price","Seats","Status","Actions"]}
        data={events} loading={loading} searchKeys={["event_name","artist_name","address","status"]}
        emptyMessage="No events found. Add your first event!"
        headerAction={<button className="btn btn-primary" onClick={openAdd}><i className="bx bx-plus me-1" />Add Event</button>}
        renderRow={(ev, idx) => (
          <tr key={ev._id}>
            <td>{idx}</td>
            <td>
              <img src={ev.event_img?`${BACKEND}${ev.event_img}`:"../assets/images/event-01.jpg"} alt={ev.event_name}
                style={{ width:44,height:44,borderRadius:8,objectFit:"cover" }}
                onError={(e)=>{e.target.src="../assets/images/event-01.jpg";}} />
            </td>
            <td>
              <strong style={{ fontSize:13 }}>{ev.event_name}</strong>
              <p className="text-muted mb-0" style={{ fontSize:11 }}>{ev.address?.slice(0,25)}...</p>
            </td>
            <td>
              <div className="d-flex align-items-center gap-2">
                {ev.artist_image && <img src={`${BACKEND}${ev.artist_image}`} alt={ev.artist_name} style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover" }} onError={(e)=>{e.target.style.display="none";}} />}
                <span style={{ fontSize:13 }}>{ev.artist_name}</span>
              </div>
            </td>
            <td><span className="badge bg-label-primary">{ev.category?.name||"—"}</span></td>
            <td><span style={{ fontSize:12 }}>{ev.datetime?new Date(ev.datetime).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"-"}</span></td>
            <td><strong style={{ color:"#e94560" }}>₹{ev.price_per_seat}</strong></td>
            <td><span className="badge bg-label-info">{ev.available_seats}/{ev.total_seats}</span></td>
            <td><span className={`badge ${ev.status==="Active"?"bg-label-success":"bg-label-danger"}`}>{ev.status}</span></td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(ev)}><i className="bx bx-edit" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ev._id)}><i className="bx bx-trash" /></button>
              </div>
            </td>
          </tr>
        )}
      />

      {modal && (
        <div className="modal fade show d-block" style={{ background:"rgba(0,0,0,.5)",overflowY:"auto" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing?"Edit Event":"Add New Event"}</h5>
                <button type="button" className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Dual image upload */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6 text-center">
                      <label style={{ fontSize:13,fontWeight:600,marginBottom:8,display:"block" }}>Event Image</label>
                      <div style={{ position:"relative",display:"inline-block" }}>
                        <img src={prevEvent||"../assets/images/event-01.jpg"} alt="Event"
                          style={{ width:120,height:80,borderRadius:10,objectFit:"cover",border:"2px dashed #e94560" }}
                          onError={(e)=>{e.target.src="../assets/images/event-01.jpg";}} />
                        <label htmlFor="ev-img" style={{ position:"absolute",bottom:-8,right:-8,background:"#e94560",color:"#fff",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>
                          <i className="bx bx-camera" />
                          <input id="ev-img" type="file" accept="image/*" style={{ display:"none" }} onChange={(e)=>{const f=e.target.files[0];if(f){setEventImg(f);setPrevEvent(URL.createObjectURL(f));}}} />
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 text-center">
                      <label style={{ fontSize:13,fontWeight:600,marginBottom:8,display:"block" }}>Artist Image</label>
                      <div style={{ position:"relative",display:"inline-block" }}>
                        {prevArtist ? (
                          <img src={prevArtist} alt="Artist" style={{ width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"2px dashed #696cff" }} onError={(e)=>{e.target.style.display="none";}} />
                        ) : (
                          <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#696cff,#9155fd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#fff" }}>🎤</div>
                        )}
                        <label htmlFor="ar-img" style={{ position:"absolute",bottom:-4,right:-4,background:"#696cff",color:"#fff",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>
                          <i className="bx bx-camera" />
                          <input id="ar-img" type="file" accept="image/*" style={{ display:"none" }} onChange={(e)=>{const f=e.target.files[0];if(f){setArtistImg(f);setPrevArtist(URL.createObjectURL(f));}}} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Event Name *</label><input type="text" className="form-control" value={f.event_name} onChange={(e)=>sf("event_name",e.target.value)} placeholder="e.g. Sunny Hill Festival" required /></div>
                    <div className="col-md-6"><label className="form-label">Artist Name *</label><input type="text" className="form-control" value={f.artist_name} onChange={(e)=>sf("artist_name",e.target.value)} placeholder="e.g. Arijit Singh" required /></div>
                    <div className="col-md-6"><label className="form-label">Category *</label>
                      <select className="form-select" value={f.category_id} onChange={(e)=>sf("category_id",e.target.value)} required>
                        <option value="">Select category</option>
                        {categories.map((c)=><option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6"><label className="form-label">Date & Time *</label><input type="datetime-local" className="form-control" value={f.datetime} onChange={(e)=>sf("datetime",e.target.value)} required /></div>
                    <div className="col-md-6"><label className="form-label">Price Per Seat (₹) *</label><input type="number" className="form-control" value={f.price_per_seat} onChange={(e)=>sf("price_per_seat",e.target.value)} placeholder="500" min="1" required /></div>
                    <div className="col-md-6"><label className="form-label">Total Seats *</label><input type="number" className="form-control" value={f.total_seats} onChange={(e)=>sf("total_seats",e.target.value)} placeholder="200" min="1" required /></div>
                    <div className="col-12"><label className="form-label">Venue Address *</label><input type="text" className="form-control" value={f.address} onChange={(e)=>sf("address",e.target.value)} placeholder="Full venue address" required /></div>
                    <div className="col-md-6"><label className="form-label">Latitude *</label><input type="text" className="form-control" value={f.lattitute} onChange={(e)=>sf("lattitute",e.target.value)} placeholder="23.0395" required /></div>
                    <div className="col-md-6"><label className="form-label">Longitude *</label><input type="text" className="form-control" value={f.longitude} onChange={(e)=>sf("longitude",e.target.value)} placeholder="72.5643" required /></div>
                    {editing && (
                      <div className="col-md-6"><label className="form-label">Status</label>
                        <select className="form-select" value={f.status} onChange={(e)=>sf("status",e.target.value)}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1" />{editing?"Updating...":"Adding..."}</> : (editing?"Update Event":"Add Event")}
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
