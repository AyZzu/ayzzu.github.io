import React from 'react';
import { MessageCircle, MapPin, Phone } from 'lucide-react';

const ThankYou = () => {
  return (
    <section id="contact" className="py-12 sm:py-20 relative">
      <div className="text-center mb-10 sm:mb-20 relative z-10 px-2">
        <div className="inline-block bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-line mb-6 sm:mb-8 shadow-sm max-w-full">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-muted truncate">✦ LET'S BUILD SOMETHING EXTRAORDINARY</span>
        </div>
        <h2 className="font-display text-5xl sm:text-7xl md:text-[110px] lg:text-[140px] font-extrabold leading-[0.85] sm:leading-[0.8] tracking-tighter uppercase select-none">
          THANK<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandOrange via-magenta to-lilac">YOU</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-6 sm:mt-12 text-muted font-medium text-sm sm:text-lg px-2">
          Have an exciting project, event poster campaign, or brand overhaul in mind? 
          Reach out directly via WhatsApp or email. I usually respond within 24 hours.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 px-2 sm:px-0">
        {/* Direct Reach */}
        <div className="bg-white rounded-[2rem] p-5 sm:p-8 md:p-10 border border-line shadow-sm flex flex-col">
          <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">CONTACT ME</h3>
          <p className="text-muted text-xs sm:text-sm font-medium mb-6 sm:mb-10">
            Reach out directly for urgent turnarounds, upcoming events, or custom collaterals.
          </p>
          
          <a href="https://wa.me/6282238205938" target="_blank" rel="noreferrer" className="w-full bg-wa text-white rounded-2xl py-3.5 sm:py-4 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs sm:text-sm hover:opacity-90 transition-opacity mb-6 sm:mb-8 shadow-lg shadow-wa/20">
            <MessageCircle size={18} /> WHATSAPP DIRECT CHAT
          </a>
          
          <div className="space-y-3 sm:space-y-4 flex-1">
            <ContactInfo 
              icon={<Phone size={18} className="text-magenta" />}
              label="PHONE / WHATSAPP"
              value="+6282238205938"
            />
            <ContactInfo 
              icon={
                <svg className="w-4 h-4 text-magenta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              }
              label="INSTAGRAM"
              value="@whois_mqst"
            />
            <ContactInfo 
              icon={<svg className="w-4 h-4 text-magenta" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>}
              label="DISCORD"
              value="_ayzu"
            />
            <ContactInfo 
              icon={<MapPin size={18} className="text-magenta" />}
              label="LOCATION"
              value="Sorong, Southwest Papua (UTC+9)"
            />
          </div>
          
          <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">FOLLOW MQST</span>
            <div className="flex gap-2">
              <a href="https://instagram.com/whois_mqst" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-ink bg-page px-3 py-1.5 rounded border border-line hover:border-magenta hover:text-magenta transition-colors uppercase">
                INSTAGRAM
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-ink bg-page px-3 py-1.5 rounded border border-line hover:border-magenta hover:text-magenta transition-colors uppercase">
                DISCORD
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactInfo = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 bg-page/50 p-4 rounded-2xl border border-line">
    <div className="w-10 h-10 rounded-full bg-pink100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</div>
      <div className="font-medium text-sm text-ink">{value}</div>
    </div>
  </div>
);

export default ThankYou;
