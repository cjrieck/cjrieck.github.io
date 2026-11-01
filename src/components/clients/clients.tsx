import React from 'react';
import soundcloud from '../../img/brand-logos/soundcloud.png';
import nbc from '../../img/brand-logos/nbc.png';
import wework from '../../img/brand-logos/wework.png';
import nickelodeon from '../../img/brand-logos/nickelodeon.png';
import credijusto from '../../img/brand-logos/credijusto.png';
import siriusxm from '../../img/brand-logos/siriusxm.png';
import oneeleven from '../../img/brand-logos/oneeleven.png';
import './clients.css';

const CLIENTS = [
  ['SoundCloud', soundcloud],
  ['NBC', nbc],
  ['WeWork', wework],
  ['Nickelodeon', nickelodeon],
  ['Credijusto', credijusto],
  ['SiriusXM', siriusxm],
  ['OneEleven', oneeleven],
];

export default function Clients() {
  return (
    <section className="clients dots" id="clients">
      <div className="wrap">
        <header className="sh"><span className="label">Laptop lid</span><h2>Trusted By Industry Leaders</h2></header>
        <div className="laptop">
          <div className="lid">
            {CLIENTS.map(([name, src]) => (
              <figure className="sk" key={name}><img src={src} alt={name} draggable="false" /></figure>
            ))}
          </div>
          <div className="deck" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}
