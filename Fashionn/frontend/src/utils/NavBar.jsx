import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/NavBar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link>
            <img src={logo} alt="Logo" className="logo-img" />
          </Link>
        </div>

        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        <ul className="nav-links desktop-only">
          <li><Link to="/home">Find Clothes</Link></li>
          <li><Link to="/outfit-suggestions">User's Outfits</Link></li>
        </ul>

        <div className="nav-icons desktop-only">
          <Link to="/favorites" className="nav-icon">Favorites</Link>
          <Link to="/profile" className="nav-icon">Profile</Link>
          <Link to="/" className="nav-icon" onClick={handleLogout}>Log Out</Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul className="nav-links">
            <li><Link to="/home">Find Clothes</Link></li>
            <li><Link to="/outfit-suggestions">User's Outfits</Link></li>
          </ul>
          <div className="nav-icons">
            <Link to="/favorites" className="nav-icon">Favorites</Link>
            <Link to="/profile" className="nav-icon">Profile</Link>
            <Link to="/" className="nav-icon" onClick={handleLogout}>Log Out</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
