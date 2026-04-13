import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="#" className="navbar-logo">
          <span className="logo-icon">🍃</span>
          <div className="logo-text">
            <span className="logo-main">The Modern Epicurean</span>
            <span className="logo-sub">EST. 1872</span>
          </div>
        </a>

        <ul className={`navbar-links ${mobileOpen ? 'navbar-links--open' : ''}`}>
          <li><a href="#heritage" onClick={() => setMobileOpen(false)}>Our Heritage</a></li>
          <li><a href="#collections" onClick={() => setMobileOpen(false)}>Collections</a></li>
          <li><a href="#wholesale" onClick={() => setMobileOpen(false)}>Wholesale Portal</a></li>
          <li><a href="#bulk" onClick={() => setMobileOpen(false)}>Bulk Inquiry</a></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/login" className="client-login-btn">Client Login</Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingCart size={19} />
          </Link>
          <Link to="/login" className="icon-btn" aria-label="Account"><User size={19} /></Link>
          <button
            className="icon-btn hamburger"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
