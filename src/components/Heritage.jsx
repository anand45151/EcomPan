import React from 'react';
import './Heritage.css';

const Heritage = () => {
  return (
    <section id="heritage" className="heritage">
      <div className="heritage-bg-overlay"></div>
      <div className="container heritage-content">
        <span className="section-label heritage-label">OUR HERITAGE</span>
        <h2 className="heritage-title">
          Rooted in <span className="heritage-accent">Tradition</span>,<br />
          Crafted for Tomorrow
        </h2>
        <p className="heritage-desc">
          For generations, the art of paan has been a sacred ritual — a confluence of
          flavor, hospitality, and heritage. We honor this legacy by sourcing the
          finest betel leaves and crafting blends that transcend time.
        </p>

        <div className="heritage-stats">
          <div className="heritage-stat">
            <span className="stat-number">150+</span>
            <span className="stat-label">Years of Legacy</span>
          </div>
          <div className="stat-divider"></div>
          <div className="heritage-stat">
            <span className="stat-number">24</span>
            <span className="stat-label">Rare Botanicals</span>
          </div>
          <div className="stat-divider"></div>
          <div className="heritage-stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Partner Venues</span>
          </div>
          <div className="stat-divider"></div>
          <div className="heritage-stat">
            <span className="stat-number">12</span>
            <span className="stat-label">Countries Served</span>
          </div>
        </div>

        <div className="heritage-images">
          <div className="heritage-img-card heritage-img-card-1">
            <img src="/hands_leaf.png" alt="Artisan crafting betel leaf" />
            <div className="heritage-img-caption">
              <span>Hand-selected at dawn</span>
            </div>
          </div>
          <div className="heritage-img-card heritage-img-card-2">
            <img src="/spices_plate.png" alt="Premium spice arrangement" />
            <div className="heritage-img-caption">
              <span>Estate-aged fillings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heritage;
