import React from 'react';
import Navbar from '../../components/navbar/navbar';
import Hero from '../../components/hero/hero';
import BrandsTicker from '../../components/brands-ticker/brands-ticker';
import Philosophy from '../../components/philosophy/philosophy';
import Process from '../../components/process/process';
import TechStack from '../../components/tech-stack/tech-stack';
import Portfolio from '../../components/portfolio/portfolio';
import Footer from '../../components/footer/footer';
import CustomCursor from '../../components/custom-cursor/custom-cursor';

export default function Home() {
  return (
    <div className="single-page-layout">
      <CustomCursor />
      <Navbar />
      <Hero />
      <BrandsTicker />
      <Philosophy />
      <Process />
      <TechStack />
      <Portfolio />
      <Footer />
    </div>
  );
}
