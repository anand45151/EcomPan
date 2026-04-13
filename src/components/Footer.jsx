import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">The Modern Epicurean</h3>
            <p className="footer-tagline">
              Elevating the ancient art of paan for<br />
              the world's most discerning palates.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4 className="footer-col-title">Collections</h4>
              <ul className="footer-list">
                <li><a href="#heritage">Heritage Blends</a></li>
                <li><a href="#collections">Signature Series</a></li>
                <li><a href="#collections">Seasonal Limited</a></li>
                <li><a href="#collections">Custom Curation</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Partnership</h4>
              <ul className="footer-list">
                <li><a href="#wholesale">Wholesale Portal</a></li>
                <li><a href="#bulk">Bulk Inquiry</a></li>
                <li><a href="#wholesale">Franchise</a></li>
                <li><a href="#wholesale">API Access</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-list">
                <li><a href="#heritage">Our Story</a></li>
                <li><a href="#">Sustainability</a></li>
                <li><a href="#">Press & Media</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} The Modern Epicurean. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
