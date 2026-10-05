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
    return window.location.hash === '#admin' || window.location.pathname.endsWith('/admin');
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(window.location.hash === '#admin' || window.location.pathname.endsWith('/admin'));
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const openAdmin = () => {
    window.location.hash = 'admin';
    setIsAdminView(true);
  };

  const closeAdmin = () => {
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
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
