import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import mqsAvatar from '../../assets/mqst-avatar.webp';
import logoIcon from '../../assets/logo-magenta.webp';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#hero', label: 'HOME' },
    { href: '#about', label: 'ABOUT' },
    { href: '#works', label: 'PROJECTS' },
    { href: '#contact', label: 'CONTACT' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 inset-x-0 z-50 py-3 sm:py-4 px-4 sm:px-6 md:px-12 flex items-center justify-between bg-page/90 backdrop-blur-md border-b border-line"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#hero" className="flex items-center gap-2 group">
            <img 
              src={logoIcon} 
              alt="MQST Logo" 
              className="h-8 sm:h-10 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_2px_8px_rgba(200,0,200,0.2)]" 
            />
          </a>
          <div className="text-sm sm:text-base md:text-lg font-display font-extrabold tracking-wider hidden xs:block border-l-2 border-line pl-2.5 sm:pl-3 text-ink">
            MMFM
          </div>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="hover:text-magenta transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a 
            href="#contact" 
            className="bg-magenta text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide hover:bg-pink transition-colors shadow-md shadow-magenta/20"
          >
            HIRE ME
          </a>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ink hover:text-magenta hover:bg-white border border-line transition-all shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown / Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[57px] sm:top-[69px] z-40 bg-white/95 backdrop-blur-xl border-b border-line shadow-2xl p-6 md:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="font-display font-bold text-lg text-ink hover:text-magenta transition-colors py-2 border-b border-line/60 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight size={16} className="text-muted" />
                </a>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="#contact"
                onClick={handleLinkClick}
                className="w-full py-3 bg-magenta text-white text-center rounded-2xl font-bold text-sm uppercase tracking-wide shadow-md shadow-magenta/20 flex items-center justify-center gap-2"
              >
                Hire Me Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
