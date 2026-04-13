import React, { useState } from 'react';
import './Collections.css';
import { Star, ShoppingCart, Eye, Flame, Sparkles, Cherry, Candy } from 'lucide-react';

const paans = [
  {
    id: 1,
    name: 'Royal Meetha Paan',
    tagline: 'The Crown Jewel',
    price: 299,
    originalPrice: 399,
    description: 'Gulkand, rose petals, silver varq & aged coconut. A symphony of sweetness wrapped in a Magahi leaf.',
    rating: 4.9,
    reviews: 128,
    badge: 'Bestseller',
    badgeColor: '#a0813c',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #0f2922 100%)',
    accentColor: '#c9a0e8',
    icon: '🌹',
    tags: ['Sweet', 'Premium'],
  },
  {
    id: 2,
    name: 'Fire & Ice Paan',
    tagline: 'Boldly Balanced',
    price: 349,
    originalPrice: 449,
    description: 'Mint frost, katha kick, and a hint of saffron heat. For those who dare to taste both worlds.',
    rating: 4.8,
    reviews: 96,
    badge: 'Signature',
    badgeColor: '#b34035',
    gradient: 'linear-gradient(135deg, #2a0d0d 0%, #3d1515 50%, #1a0a0a 100%)',
    accentColor: '#ff7b6b',
    icon: '🔥',
    tags: ['Spicy', 'Cooling'],
  },
  {
    id: 3,
    name: 'Chocolate Truffle Paan',
    tagline: 'Decadent Fusion',
    price: 399,
    originalPrice: 499,
    description: 'Belgian cocoa, hazelnut cream & cardamom essence folded in a Banarasi leaf. Dessert reimagined.',
    rating: 4.9,
    reviews: 204,
    badge: 'New',
    badgeColor: '#2e7d32',
    gradient: 'linear-gradient(135deg, #1b0e05 0%, #2d1a0c 50%, #0d0805 100%)',
    accentColor: '#d4a76a',
    icon: '🍫',
    tags: ['Sweet', 'Fusion'],
  },
  {
    id: 5,
    name: 'Kesar Rajwadi Paan',
    tagline: "The Emperor's Blend",
    price: 549,
    originalPrice: 699,
    description: 'Kashmir saffron threads, edible gold, dry fruits & royal mishri. A paan fit for kings.',
    rating: 5.0,
    reviews: 88,
    badge: 'Ultra Premium',
    badgeColor: '#a0813c',
    gradient: 'linear-gradient(135deg, #2a1f00 0%, #3d2e00 50%, #1a1400 100%)',
    accentColor: '#ffd54f',
    icon: '👑',
    tags: ['Luxury', 'Gold'],
  },
  {
    id: 6,
    name: 'Paan Shots (6-Pack)',
    tagline: 'Party Starter',
    price: 599,
    originalPrice: 799,
    description: 'Bite-sized paan-infused shots with fruit coulis. The perfect conversation starter for your events.',
    rating: 4.8,
    reviews: 156,
    badge: 'Popular',
    badgeColor: '#6b5a26',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #0a1520 100%)',
    accentColor: '#64b5f6',
    icon: '🥂',
    tags: ['Party', 'Gift Box'],
  },
];

const Collections = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Sweet', 'Traditional', 'Fusion', 'Luxury', 'Party'];

  const filtered = activeFilter === 'All'
    ? paans
    : paans.filter(p => p.tags.includes(activeFilter));

  return (
    <section id="collections" className="collections">
      <div className="container">
        <div className="collections-header">
          <span className="section-label">CURATED COLLECTIONS</span>
          <h2 className="section-title">Our Signature Paans</h2>
          <p className="collections-subtitle">
            Each creation is hand-crafted, estate-sourced, and packaged in premium keepsake boxes.
          </p>
        </div>

        <div className="collections-filters">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? 'filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="collections-grid">
          {filtered.map(paan => (
            <div className="paan-card" key={paan.id} style={{ background: paan.gradient }}>
              {/* Badge */}
              <span className="paan-badge" style={{ background: paan.badgeColor }}>{paan.badge}</span>

              {/* Top - Icon & Visual */}
              <div className="paan-visual">
                <span className="paan-emoji">{paan.icon}</span>
                <div className="paan-glow" style={{ background: paan.accentColor }}></div>
              </div>

              {/* Info */}
              <div className="paan-info">
                <span className="paan-tagline" style={{ color: paan.accentColor }}>{paan.tagline}</span>
                <h3 className="paan-name">{paan.name}</h3>
                <p className="paan-desc">{paan.description}</p>

                {/* Tags */}
                <div className="paan-tags">
                  {paan.tags.map(tag => (
                    <span key={tag} className="paan-tag">{tag}</span>
                  ))}
                </div>

                {/* Rating */}
                <div className="paan-rating">
                  <Star size={14} fill={paan.accentColor} color={paan.accentColor} />
                  <span className="rating-value">{paan.rating}</span>
                  <span className="rating-count">({paan.reviews})</span>
                </div>

                {/* Price & Actions */}
                <div className="paan-bottom">
                  <div className="paan-price">
                    <span className="price-current">₹{paan.price}</span>
                    <span className="price-original">₹{paan.originalPrice}</span>
                  </div>
                  <div className="paan-actions">
                    <button className="paan-btn-quick" aria-label="Quick view">
                      <Eye size={16} />
                    </button>
                    <button className="paan-btn-cart" style={{ background: paan.accentColor }}>
                      <ShoppingCart size={15} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;

// https://hack.dev3pack.xyz/register?ref=7CMSWTS3
