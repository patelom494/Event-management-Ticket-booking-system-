import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getUsers, updateUserStatus } from "../services/api";

const BACKEND = "http://localhost:8000";

export default function ManageUsers({ setIsAuthenticated, adminName }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getUsers(); setUsers(r.data.data||[]); }
    catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleToggle = async (user) => {
    const newStatus = user.status==="Active"?"Inactive":"Active";
    if (!window.confirm(`${newStatus==="Active"?"Activate":"Deactivate"} ${user.name}?`)) return;
    setToggling(user._id);
    try {
      const r = await updateUserStatus({ user_id:user._id, status:newStatus });
      if (r.data.success) { toast.success(`User ${newStatus==="Active"?"activated":"deactivated"}!`); fetch(); }
    } catch (err) { toast.error(err.response?.data?.message||"Failed!"); }
    finally { setToggling(null); }
  };

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12"><h4 className="fw-bold mb-1">Manage Users</h4><p className="text-muted">View and manage registered customers.</p></div></div>
      <DataTable title="All Users" columns={["Avatar","Name","Email","Phone","Address","Status","Joined","Action"]}
        data={users} loading={loading} searchKeys={["name","email","phone_no","status"]} emptyMessage="No users yet."
        renderRow={(u, idx) => (
          <tr key={u._id}>
            <td>{idx}</td>
            <td>{u.profile_pic?<img src={`${BACKEND}${u.profile_pic}`} alt={u.name} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}} onError={(e)=>{e.target.style.display="none";}}/>:<div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#e94560,#c7253e)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>{u.name?.charAt(0)}</div>}</td>
            <td><strong style={{fontSize:13}}>{u.name}</strong></td>
            <td><span style={{fontSize:13}}>{u.email}</span></td>
            <td><span style={{fontSize:13}}>{u.phone_no}</span></td>
            <td><span className="text-muted" style={{fontSize:12}}>{u.address?.slice(0,20)}...</span></td>
            <td><span className={`badge ${u.status==="Active"?"bg-label-success":"bg-label-danger"}`}>{u.status}</span></td>
            <td><span className="text-muted" style={{fontSize:12}}>{u.created_at?new Date(u.created_at).toLocaleDateString("en-IN"):"—"}</span></td>
            <td><button className={`btn btn-sm ${u.status==="Active"?"btn-outline-danger":"btn-outline-success"}`} onClick={()=>handleToggle(u)} disabled={toggling===u._id}>
              {toggling===u._id?<span className="spinner-border spinner-border-sm"/>:u.status==="Active"?"Deactivate":"Activate"}
            </button></td>
          </tr>
        )}
      />
    </AdminLayout>
  );
}
