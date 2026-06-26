import React from "react";
export default function Footer() {
  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl">
        <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
          <div className="text-body mb-2 mb-md-0">© {new Date().getFullYear()} <strong>ArtXibition</strong> Admin</div>
          <div className="d-none d-lg-inline-block text-muted" style={{fontSize:13}}>Event & Ticket Reservation System 🎭</div>
        </div>
      </div>
    </footer>
  );
}
