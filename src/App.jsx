import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Works from './components/sections/Works';
import ThankYou from './components/sections/ThankYou';
import Footer from './components/layout/Footer';
import Background from './components/layout/Background';
import AdminApp from './components/admin/AdminApp';

function App() {
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname.startsWith('/admin') || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  const closeAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  if (isAdminView) {
    return <AdminApp onBackToPortfolio={closeAdmin} />;
  }

  return (
    <div className="relative min-h-screen font-sans text-ink bg-page overflow-x-hidden selection:bg-magenta selection:text-white">
      <Background />
      <Navbar onGoToAdmin={openAdmin} />
      <main className="relative z-10 pt-20 sm:pt-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 sm:space-y-24 lg:space-y-32 pb-16 sm:pb-20">
        <Hero />
        <About />
        <Works />
        <ThankYou />
      </main>
      <Footer />
    </div>
  );
}

export default App;
