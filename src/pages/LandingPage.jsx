import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Craftsmanship from '../components/Craftsmanship';
import Collections from '../components/Collections';
import Partnerships from '../components/Partnerships';
import Heritage from '../components/Heritage';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Craftsmanship />
        <Collections />
        <Partnerships />
        <Heritage />
      </main>
      <Footer />
    </div>
  );
}
