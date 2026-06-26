import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../services/api";
import { setToken } from "../auth/authService";

export default function Login({ setIsAuthenticated, setAdminName }) {
  const [data, setData] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await login(data);
      if (res.data.success) {
        if (res.data.userData?.session?.role !== "Admin") { toast.error("Admin accounts only."); return; }
        setToken(res.data.token);
        setIsAuthenticated(true);
        setAdminName(res.data.userData?.session?.name || "Admin");
        toast.success("Welcome back, Admin! 🎭");
        navigate("/");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Login failed!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner py-6">
          <div className="card">
            <div className="card-body p-6">
              <div className="app-brand justify-content-center mb-6">
                <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#e94560,#c7253e)",color:"#fff",fontSize:22,fontWeight:800}}>🎭</span>
                <span className="fw-bold ms-2" style={{fontSize:22}}>ArtXibition Admin</span>
              </div>
              <h4 className="mb-1">Welcome, Admin! 🎭</h4>
              <p className="mb-5 text-muted">Sign in to manage events and tickets</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 form-floating form-floating-outline">
                  <input type="email" className="form-control" id="email" placeholder="admin@artxibition.com" value={data.email} onChange={(e) => setData({...data,email:e.target.value})} required />
                  <label htmlFor="email">Email Address</label>
                </div>
                <div className="mb-4 form-floating form-floating-outline" style={{position:"relative"}}>
                  <input type={showPass?"text":"password"} className="form-control" id="password" placeholder="············" value={data.password} onChange={(e) => setData({...data,password:e.target.value})} required />
                  <label htmlFor="password">Password</label>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#888",fontSize:18,zIndex:5}}>
                    <i className={`bx ${showPass?"bx-show":"bx-hide"}`} />
                  </button>
                </div>
                <button type="submit" className="btn btn-primary d-grid w-100 mb-4" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : "Sign in"}
                </button>
              </form>
              <div className="p-3 rounded" style={{background:"#fff3e0",border:"1px solid #ffcc80",fontSize:13,color:"#e65100"}}>
                <i className="bx bx-info-circle me-1" /><strong>Admin only.</strong> Default: admin@events.com / Admin@123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
