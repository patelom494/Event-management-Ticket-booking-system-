import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../common/AdminLayout";
import DataTable from "../common/DataTable";
import { getAdminCategories, addCategory, updateCategory, deleteCategory } from "../services/api";

const BACKEND = "http://localhost:8000";
const empty = { name:"", status:"Active" };

export default function ManageCategories({ setIsAuthenticated, adminName }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(empty);
  const [imageFile,  setImageFile]  = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getAdminCategories(); setCategories(r.data.data || []); }
    catch { toast.error("Failed to load categories"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setImageFile(null); setPreview(null); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name:c.name, status:c.status||"Active" }); setImageFile(null); setPreview(c.image ? `${BACKEND}${c.image}` : null); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (editing) { fd.append("id", editing._id); fd.append("status", form.status); }
      if (imageFile) fd.append("image", imageFile);
      const res = editing ? await updateCategory(fd) : await addCategory(fd);
      if (res.data.success) { toast.success(editing ? "Category updated!" : "Category added!"); setModal(false); fetch(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed!"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { const r = await deleteCategory(id); if (r.data.success) { toast.success("Deleted!"); fetch(); } }
    catch (err) { toast.error(err.response?.data?.message || "Delete failed!"); }
  };

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated} adminName={adminName}>
      <div className="row mb-4"><div className="col-12">
        <h4 className="fw-bold mb-1">Manage Categories</h4>
        <p className="text-muted">Add and manage event categories with icons.</p>
      </div></div>

      <DataTable title="All Categories" columns={["Image","Name","Events","Status","Actions"]}
        data={categories} loading={loading} searchKeys={["name","status"]}
        emptyMessage="No categories yet."
        headerAction={<button className="btn btn-primary" onClick={openAdd}><i className="bx bx-plus me-1" />Add Category</button>}
        renderRow={(c, idx) => (
          <tr key={c._id}>
            <td>{idx}</td>
            <td>
              {c.image ? <img src={`${BACKEND}${c.image}`} alt={c.name} style={{ width:40,height:40,borderRadius:8,objectFit:"cover" }} onError={(e)=>{e.target.style.display="none";}} />
              : <div style={{ width:40,height:40,borderRadius:8,background:"linear-gradient(135deg,#e94560,#c7253e)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700 }}>{c.name?.charAt(0)}</div>}
            </td>
            <td><strong>{c.name}</strong></td>
            <td><span className="badge bg-label-info">{c.event_count || 0}</span></td>
            <td><span className={`badge ${c.status==="Active"?"bg-label-success":"bg-label-danger"}`}>{c.status||"Active"}</span></td>
            <td>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(c)}><i className="bx bx-edit" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}><i className="bx bx-trash" /></button>
              </div>
            </td>
          </tr>
        )}
      />

      {modal && (
        <div className="modal fade show d-block" style={{ background:"rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Edit Category" : "Add Category"}</h5>
                <button type="button" className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Image preview */}
                  <div className="text-center mb-4">
                    <div style={{ position:"relative",display:"inline-block" }}>
                      {preview ? (
                        <img src={preview} alt="Preview" style={{ width:80,height:80,borderRadius:10,objectFit:"cover",border:"2px dashed #e94560" }} onError={(e)=>{e.target.style.display="none";}} />
                      ) : (
                        <div style={{ width:80,height:80,borderRadius:10,background:"linear-gradient(135deg,#e94560,#c7253e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:"#fff" }}>🎭</div>
                      )}
                      <label htmlFor="cat-img" style={{ position:"absolute",bottom:-8,right:-8,background:"#696cff",color:"#fff",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>
                        <i className="bx bx-camera" />
                        <input id="cat-img" type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => { const f=e.target.files[0]; if(f){setImageFile(f);setPreview(URL.createObjectURL(f));} }} />
                      </label>
                    </div>
                    <p className="text-muted mt-2" style={{ fontSize:12 }}>Category image (optional)</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category Name *</label>
                    <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="e.g. Concerts, Comedy" required />
                  </div>
                  {editing && (
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setForm({...form,status:e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1" />{editing?"Updating...":"Adding..."}</> : (editing?"Update":"Add Category")}
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
