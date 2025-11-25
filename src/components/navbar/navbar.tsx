import React, { useState, useEffect, useRef } from 'react';
import './navbar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../../utils/scroll';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navLinksRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Process', href: '#process' },
    { name: 'Skills', href: '#skills' },
    { name: 'Work', href: '#work' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace('#', ''));
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Update pill position when active section changes
  useEffect(() => {
    if (!navLinksRef.current) return;
    
    const activeLink = navLinksRef.current.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
    if (activeLink) {
      const containerRect = navLinksRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      setPillStyle({
        left: linkRect.left - containerRect.left,
        width: linkRect.width,
      });
    }
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.replace('#', '');
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        className={`navbar ${isScrolled ? 'scrolled glass-panel' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="navbar-container">
          <motion.a 
            href="#home" 
            className="nav-logo" 
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, '#home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CR
          </motion.a>

          {/* Desktop Nav */}
          <div className="nav-links desktop-only" ref={navLinksRef}>
            {/* Morphing pill indicator */}
            <motion.div 
              className="nav-pill"
              animate={{
                left: pillStyle.left,
                width: pillStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
            
            {navLinks.map((link) => (
              <motion.a 
                key={link.name} 
                href={link.href}
                data-section={link.href.replace('#', '')}
                className={`nav-link ${activeSection === link.href.replace('#', '') ? 'active' : ''}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, link.href)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {link.name}
              </motion.a>
            ))}
            <motion.a 
              href="mailto:cjrieck123@gmail.com" 
              className="nav-cta"
              whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Talk
            </motion.a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle button-style"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobileMenu}
            />
            
            {/* Menu */}
            <motion.div 
              className="mobile-menu glass-panel"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div className="mobile-nav-links">
                {navLinks.map((link, index) => (
                  <motion.a 
                    key={link.name} 
                    href={link.href} 
                    className={`mobile-nav-link ${activeSection === link.href.replace('#', '') ? 'active' : ''}`}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, link.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.a 
                  href="mailto:cjrieck123@gmail.com" 
                  className="mobile-nav-cta" 
                  onClick={closeMobileMenu}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  Let's Talk
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
