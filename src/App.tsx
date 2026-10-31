import React, { useEffect } from 'react';
import Home from './pages/home/home';
import { scrollToCurrentHash } from './utils/legacy-hash';

function App() {
  useEffect(() => {
    scrollToCurrentHash();
    // Fonts shift the layout, so land on the section again once they load.
    document.fonts?.ready.then(scrollToCurrentHash);
    // Lets :active fire on iOS.
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => document.removeEventListener('touchstart', noop);
  }, []);

  return <Home />;
}

export default App;
