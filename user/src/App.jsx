import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import checkSession, { removeToken } from "./auth/authService";
import Header from "./common/Header";
import Footer from "./common/Footer";

import Home          from "./pages/Home";
import Events        from "./pages/Events";
import EventDetail   from "./pages/EventDetail";
import Tickets       from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import About         from "./pages/About";
import Contact       from "./pages/Contact";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MyBookings    from "./pages/MyBookings";
import MyComplaints  from "./pages/MyComplaints";
import Profile       from "./pages/Profile";
import Reviews       from "./pages/Reviews";

function Loader() {
  return (
    <div style={{ minHeight:"100vh", background:"#14141f", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:50, height:50, border:"3px solid rgba(255,255,255,.1)", borderTopColor:"#e94560", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
      <p style={{ color:"rgba(255,255,255,.5)", fontSize:15 }}>Loading ArtXibition...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData]               = useState(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    checkSession()
      .then((r) => { setIsAuthenticated(r.isAuth); setUserData(r.session); })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const sharedProps = { isAuthenticated, setIsAuthenticated, userData, setUserData };

  const Protected = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  const GuestOnly = ({ children }) =>
    !isAuthenticated ? children : <Navigate to="/" replace />;

  return (
    <>
      <ToastContainer stacked autoClose={2500} position="top-right" theme="dark" />
      <BrowserRouter>
        <Header {...sharedProps} />
        <Routes>
          {/* Public */}
          <Route path="/"             element={<Home {...sharedProps} />} />
          <Route path="/events"       element={<Events />} />
          <Route path="/event/:id"    element={<EventDetail {...sharedProps} />} />
          <Route path="/tickets"      element={<Tickets />} />
          <Route path="/ticket/:id"   element={<TicketDetails {...sharedProps} />} />
          <Route path="/about"        element={<About />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/reviews"      element={<Reviews />} />

          {/* Guest only */}
          <Route path="/login"           element={<GuestOnly><Login setIsAuthenticated={setIsAuthenticated} setUserData={setUserData} /></GuestOnly>} />
          <Route path="/register"        element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />

          {/* Protected */}
          <Route path="/my-bookings"   element={<Protected><MyBookings {...sharedProps} /></Protected>} />
          <Route path="/my-complaints" element={<Protected><MyComplaints /></Protected>} />
          <Route path="/profile"       element={<Protected><Profile {...sharedProps} /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer {...sharedProps} />
      </BrowserRouter>
    </>
  );
}
