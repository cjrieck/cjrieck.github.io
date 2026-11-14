import React, { useEffect } from 'react';
import { mountStickers } from '../../components/stickers/sticker-engine';
import Nav from '../../components/nav/nav';
import Hero from '../../components/hero/hero';
import Clients from '../../components/clients/clients';
import Philosophy from '../../components/philosophy/philosophy';
import Process from '../../components/process/process';
import Skills from '../../components/skills/skills';
import Work from '../../components/work/work';
import Contact from '../../components/contact/contact';
import Footer from '../../components/footer/footer';
import '../../components/stickers/stickers.css';

export default function Home() {
  useEffect(() => mountStickers(), []);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Clients />
        <Philosophy />
        <Process />
        <Skills />
        <Work />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
