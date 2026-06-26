import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getComplaints, resolveComplaint } from "../services/api";

export default function ManageComplaints({ setIsAuthenticated, adminName }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getComplaints(); setComplaints(r.data.data||[]); }
    catch { toast.error("Failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleResolve = async (id) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    setResolving(id);
    try { const r = await resolveComplaint(id); if(r.data.success){toast.success("Complaint resolved!"); fetch();} }
    catch (err) { toast.error(err.response?.data?.message||"Failed!"); }
    finally { setResolving(null); }
  };

  const pending = complaints.filter(c=>c.status==="Pending").length;
  const resolved = complaints.filter(c=>c.status==="Resolved").length;

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12"><h4 className="fw-bold mb-1">Manage Complaints</h4><p className="text-muted">Review and resolve customer complaints.</p></div></div>
      {!loading&&(<div className="row g-3 mb-4">
        {[{l:"Total",v:complaints.length,c:"#696cff"},{l:"Pending",v:pending,c:"#ffab00"},{l:"Resolved",v:resolved,c:"#28a745"}].map(s=>(
          <div key={s.l} className="col-md-4"><div className="card" style={{borderLeft:`4px solid ${s.c}`}}><div className="card-body py-3"><p className="text-muted mb-1" style={{fontSize:12}}>{s.l}</p><h4 className="fw-bold mb-0" style={{color:s.c}}>{s.v}</h4></div></div></div>
        ))}
      </div>)}
      <DataTable title="All Complaints" columns={["Customer","Event","Subject","Message","Status","Date","Action"]}
        data={complaints} loading={loading} searchKeys={["user.name","event.event_name","subject","status"]} emptyMessage="No complaints yet."
        renderRow={(c,idx) => (
          <tr key={c._id}>
            <td>{idx}</td>
            <td><p className="mb-0 fw-semibold" style={{fontSize:13}}>{c.user?.name||"—"}</p><small className="text-muted">{c.user?.email}</small></td>
            <td><span style={{fontSize:12}}>{c.event?.event_name||"—"}</span></td>
            <td><strong style={{fontSize:13}}>{c.subject}</strong></td>
            <td><span style={{fontSize:12,color:"#697a8d"}}>"{c.message?.slice(0,60)}{c.message?.length>60?"...":""}"</span></td>
            <td><span className={`badge ${c.status==="Pending"?"bg-label-warning":"bg-label-success"}`}>{c.status}</span></td>
            <td><span className="text-muted" style={{fontSize:12}}>{c.timestamp?new Date(c.timestamp).toLocaleDateString("en-IN"):"-"}</span></td>
            <td>{c.status==="Pending"&&<button className="btn btn-sm btn-outline-success" onClick={()=>handleResolve(c._id)} disabled={resolving===c._id}>
              {resolving===c._id?<span className="spinner-border spinner-border-sm"/>:"Resolve"}
            </button>}</td>
          </tr>
        )}
      />
    </AdminLayout>
  );
}
