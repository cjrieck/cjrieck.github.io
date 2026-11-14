import React, { useEffect } from 'react';
import Home from './pages/home/home';
import { holdHashTarget } from './utils/legacy-hash';

function App() {
  useEffect(() => {
    // Fonts and the teardown shift the layout after the first jump, so keep landing on the
    // section until the page settles or the visitor scrolls.
    const stopHolding = holdHashTarget();
    // Lets :active fire on iOS.
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => {
      stopHolding();
      document.removeEventListener('touchstart', noop);
    };
  }, []);

  return <Home />;
}

export default App;
