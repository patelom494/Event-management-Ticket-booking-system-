import React, { useEffect, useState } from "react";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getReviews } from "../services/api";
import { toast } from "react-toastify";

export default function ManageReviews({ setIsAuthenticated, adminName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getReviews().then(r=>setReviews(r.data.data||[])).catch(()=>toast.error("Failed")).finally(()=>setLoading(false)); }, []);
  const avg = reviews.length?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):0;
  const Stars = ({rating}) => <div className="d-flex gap-1">{[1,2,3,4,5].map(s=><i key={s} className={`bx ${s<=Math.round(rating)?"bxs-star":"bx-star"}`} style={{color:"#ffc107",fontSize:14}}/>)}</div>;
  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12"><h4 className="fw-bold mb-1">Customer Reviews</h4><p className="text-muted">Monitor all event reviews and ratings.</p></div></div>
      {!loading&&(<div className="row g-3 mb-4">
        {[{l:"Total Reviews",v:reviews.length,c:"#696cff"},{l:"Avg Rating",v:`${avg}/5`,c:"#ffc107"},{l:"5-Star",v:reviews.filter(r=>r.rating===5).length,c:"#28a745"}].map(s=>(
          <div key={s.l} className="col-md-4"><div className="card" style={{borderLeft:`4px solid ${s.c}`}}><div className="card-body py-3"><p className="text-muted mb-1" style={{fontSize:12}}>{s.l}</p><h4 className="fw-bold mb-0" style={{color:s.c}}>{s.v}</h4></div></div></div>
        ))}
      </div>)}
      <DataTable title="All Reviews" columns={["Customer","Event","Rating","Review","Date"]}
        data={reviews} loading={loading} searchKeys={["user.name","event.event_name","review"]} emptyMessage="No reviews yet."
        renderRow={(r,idx) => (
          <tr key={r._id}>
            <td>{idx}</td>
            <td><p className="mb-0 fw-semibold" style={{fontSize:13}}>{r.user?.name||"—"}</p><small className="text-muted">{r.user?.email}</small></td>
            <td><span style={{fontSize:12}}>{r.event?.event_name||"—"}</span></td>
            <td><Stars rating={r.rating}/><small className="text-muted">{r.rating}/5</small></td>
            <td><span style={{fontSize:13,color:"#697a8d"}}>"{r.review?.slice(0,80)}{r.review?.length>80?"...":""}"</span></td>
            <td><span className="text-muted" style={{fontSize:12}}>{r.created_at?new Date(r.created_at).toLocaleDateString("en-IN"):"-"}</span></td>
          </tr>
        )}
      />
    </AdminLayout>
  );
}
