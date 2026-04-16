import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, PlusSquare, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar glass-nav">
      <div className="nav-container">
        <NavLink to="/home" className="brand-block" aria-label="ReWear home">
          <span className="brand-dot" />
          <div>
            <p className="brand-name">ReWear</p>
            <span className="brand-sub">Rent • Style • Repeat</span>
          </div>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home className="nav-icon" />
          <span>Home</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageCircle className="nav-icon" />
            <span>Chat</span>
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-item upload-btn ${isActive ? 'active' : ''}`}>
            <PlusSquare className="nav-icon" />
            <span>Upload</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <User className="nav-icon" />
            <span>Profile</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
