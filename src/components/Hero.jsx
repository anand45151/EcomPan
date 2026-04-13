import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mx', `${x}px`);
      heroRef.current.style.setProperty('--my', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-overlay"></div>

      {/* Floating decorative particles */}
      <div className="hero-particles">
        <span className="particle p1"></span>
        <span className="particle p2"></span>
        <span className="particle p3"></span>
        <span className="particle p4"></span>
        <span className="particle p5"></span>
      </div>

      <div className="hero-content container">
        <div className="hero-text-block">
          <span className="hero-eyebrow">✦ Since 1872</span>
          <h1 className="hero-title">
            <span className="title-line title-line-1">The Digital</span>
            <span className="title-line title-line-2">
              <span className="hero-accent">Sommelier</span> of Pan
            </span>
          </h1>
          <p className="hero-subtitle">
            Elevating ancient tradition for the modern palate.<br />
            Bespoke wholesale procurement for Michelin-<br />
            starred experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              <span>Explore Collections</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button className="btn-secondary">Request Sample Kit</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-hint">
          <div className="scroll-line"></div>
          <span>Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
