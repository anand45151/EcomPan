/**
 * AppNavbar — used inside authenticated pages (customer + admin).
 * Replaces the landing-page Navbar for app routes.
 */
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';
import './AppNavbar.css';

export default function AppNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const itemCount = useCartStore((s) => s.itemCount);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to="/" className="app-navbar-logo">
          <span>🍃</span>
          <div>
            <span className="app-navbar-brand">The Modern Epicurean</span>
            <span className="app-navbar-tagline">Wholesale Portal</span>
          </div>
        </Link>

        <nav className={`app-navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/products" onClick={() => setMobileOpen(false)}>Products</NavLink>
          <NavLink to="/orders" onClick={() => setMobileOpen(false)}>My Orders</NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin</NavLink>
          )}
        </nav>

        <div className="app-navbar-actions">
          {!isAdmin && (
            <Link to="/cart" className="app-navbar-cart" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="app-navbar-badge">{itemCount}</span>}
            </Link>
          )}

          <div className="app-navbar-profile" onClick={() => setProfileOpen((v) => !v)}>
            {user?.photoURL
              ? <img src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />
              : <User size={18} />
            }
            <span className="app-navbar-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={14} />

            {profileOpen && (
              <div className="app-navbar-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="app-navbar-dropdown-header">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-muted">{user?.email}</p>
                  {user?.businessName && <p className="text-accent">{user.businessName}</p>}
                </div>
                <hr />
                <Link to="/profile" onClick={() => setProfileOpen(false)}>
                  <User size={15} /> Profile & Addresses
                </Link>
                <Link to="/orders" onClick={() => setProfileOpen(false)}>
                  <Package size={15} /> My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setProfileOpen(false)}>
                    <LayoutDashboard size={15} /> Admin Dashboard
                  </Link>
                )}
                <hr />
                <button onClick={handleLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>

          <button className="app-navbar-hamburger" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
