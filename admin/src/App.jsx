import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import checkSession from "./auth/authService";

import Login              from "./pages/Login";
import Dashboard          from "./pages/Dashboard";
import ManageCategories   from "./pages/ManageCategories";
import ManageEvents       from "./pages/ManageEvents";
import ManageBookings     from "./pages/ManageBookings";
import ManageUsers        from "./pages/ManageUsers";
import ManagePayments     from "./pages/ManagePayments";
import ManageReviews      from "./pages/ManageReviews";
import ManageComplaints   from "./pages/ManageComplaints";
import AdminProfile       from "./pages/AdminProfile";

function Loader() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f9", flexDirection:"column", gap:16 }}>
      <div className="spinner-border text-primary" style={{ width:48, height:48 }} />
      <p style={{ color:"#697a8d", fontSize:16 }}>Loading Admin Panel...</p>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName]             = useState("");
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    checkSession()
      .then((r) => {
        if (r.isAuth) { setIsAuthenticated(true); setAdminName(r.session?.name || "Admin"); }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const sharedProps = { setIsAuthenticated, adminName };

  const Protected = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  const GuestOnly = ({ children }) =>
    !isAuthenticated ? children : <Navigate to="/" replace />;

  return (
    <>
      <ToastContainer stacked autoClose={2500} position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login"               element={<GuestOnly><Login setIsAuthenticated={setIsAuthenticated} setAdminName={setAdminName} /></GuestOnly>} />
          <Route path="/"                    element={<Protected><Dashboard       {...sharedProps} /></Protected>} />
          <Route path="/manage-categories"   element={<Protected><ManageCategories {...sharedProps} /></Protected>} />
          <Route path="/manage-events"       element={<Protected><ManageEvents     {...sharedProps} /></Protected>} />
          <Route path="/manage-bookings"     element={<Protected><ManageBookings   {...sharedProps} /></Protected>} />
          <Route path="/manage-users"        element={<Protected><ManageUsers      {...sharedProps} /></Protected>} />
          <Route path="/manage-payments"     element={<Protected><ManagePayments   {...sharedProps} /></Protected>} />
          <Route path="/manage-reviews"      element={<Protected><ManageReviews    {...sharedProps} /></Protected>} />
          <Route path="/manage-complaints"   element={<Protected><ManageComplaints {...sharedProps} /></Protected>} />
          <Route path="/profile"             element={<Protected><AdminProfile     {...sharedProps} /></Protected>} />
          <Route path="*"                    element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
