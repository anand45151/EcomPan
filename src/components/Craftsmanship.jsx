import React from 'react';
import './Craftsmanship.css';
import { Leaf, Award, Gem } from 'lucide-react';

const Craftsmanship = () => {
  return (
    <section className="craftsmanship">
      <div className="craft-container container">
        <div className="craft-left">
          <div className="craft-img-wrapper">
            <img src="/spices_plate.png" alt="Rare spices and botanicals" className="craft-img" />
            <div className="craft-img-shine"></div>
            <div className="craft-floating-box">
              <Gem size={20} color="var(--color-accent)" className="craft-box-icon" />
              <h3 className="craft-floating-text">
                "A symphony of<br />
                <span className="italic">24 rare</span><br />
                botanicals"
              </h3>
            </div>
          </div>

          {/* Decorative accent line */}
          <div className="craft-deco-line"></div>
        </div>

        <div className="craft-right">
          <span className="section-label">CRAFTSMANSHIP</span>
          <h2 className="section-title">The Art of the Blend</h2>
          <p className="section-desc">
            Each selection is a curated masterpiece. We source betel leaves from private estates in Varanasi
            and pair them with proprietary infusions that take months to mature.
          </p>

          <div className="craft-features">
            <div className="feature">
              <div className="feature-icon-wrap">
                <Leaf size={22} className="feature-icon" color="var(--color-accent)" />
              </div>
              <div>
                <h4 className="feature-title">Single Estate</h4>
                <p className="feature-desc">Tezpur leaves, known for their robust matrices and rare terroir.</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon-wrap">
                <Award size={22} className="feature-icon" color="var(--color-accent)" />
              </div>
              <div>
                <h4 className="feature-title">Aged Fillings</h4>
                <p className="feature-desc">Paan auram macerated for three full moons under controlled humidity.</p>
              </div>
            </div>
          </div>

          <div className="craft-cta">
            <button className="btn-craft">
              <span>Discover Our Process</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;
