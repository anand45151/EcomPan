import React from 'react';
import './Partnerships.css';
import { Truck, Package, RefreshCw } from 'lucide-react';

const Partnerships = () => {
  return (
    <section className="partnerships">
      <div className="container">
        <div className="partnerships-header">
          <h2 className="section-title">Wholesale Partnerships</h2>
          <p className="partnerships-desc">Seamless logistics for the world's most demanding dining rooms.</p>
        </div>
        
        <div className="partnerships-grid">
          <div className="partner-card main-card">
            <div className="main-card-bg"></div>
            <div className="main-card-content">
              <h3>Michelin Integration</h3>
              <p>Custom flavor profiling just to complement your tasting menu's nuances.</p>
              <button className="btn-light">Consultation</button>
            </div>
          </div>
          
          <div className="partner-subgrid">
            <div className="partner-card small-card bg-light">
              <Truck size={32} className="card-icon" color="#b34035" />
              <h4>Cold-Chain Express</h4>
              <p>Guaranteed dew-fresh within 24 hours of harvest.</p>
            </div>
            
            <div className="partner-card small-card bg-accent">
              <Package size={32} className="card-icon" color="#fff" />
              <h4>Inventory API</h4>
              <p>Direct integration with your intent management software.</p>
            </div>
            
            <div className="partner-card wide-card bg-white">
              <div className="wide-card-text">
                <h4>Subscription Management</h4>
                <p>Automated restocking based on your seasonal covers and guest data.</p>
              </div>
              <div className="wide-card-icon-wrap">
                <RefreshCw size={32} color="#aaa" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnerships;
