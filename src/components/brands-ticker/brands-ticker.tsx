import React from 'react';
import './brands-ticker.css';
import { motion } from 'framer-motion';
import weworkLogo from '../../img/brand-logos/wework.png';
import soundcloudLogo from '../../img/brand-logos/soundcloud.png';
import nbcLogo from '../../img/brand-logos/nbc.png';
import nickelodeonLogo from '../../img/brand-logos/nickelodeon.png';
import credijustoLogo from '../../img/brand-logos/credijusto.png';
import siriusxmLogo from '../../img/brand-logos/siriusxm.png';
import oneelevenLogo from '../../img/brand-logos/oneeleven.png';

const brands = [
  { name: 'SoundCloud', logo: soundcloudLogo },
  { name: 'NBC', logo: nbcLogo },
  { name: 'WeWork', logo: weworkLogo },
  { name: 'Nickelodeon', logo: nickelodeonLogo },
  { name: 'Credijusto', logo: credijustoLogo },
  { name: 'SiriusXM', logo: siriusxmLogo },
  { name: 'OneEleven', logo: oneelevenLogo },
];

// Duplicate brands for seamless loop
const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

export default function BrandsTicker() {
  return (
    <section className="brands-ticker-section">
      <motion.div 
        className="brands-ticker-container container-content"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="brands-ticker-title">Trusted By Industry Leaders</h3>
        
        <div className="brands-ticker-wrapper">
          <div className="brands-ticker-track">
            {duplicatedBrands.map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="brand-logo-item">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo-img"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
