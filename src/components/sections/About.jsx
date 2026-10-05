import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import mqs from '../../assets/mqst-opt.webp';
const About = () => {
  return (
    <section id="about" className="py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column - Image Card & Work Experience */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="lg:col-span-5 space-y-6 sm:space-y-8"
      >
        <div className="relative">
          <div className="bg-white p-3.5 sm:p-4 rounded-[2rem] shadow-sm border border-line relative z-10">
            <div className="aspect-[4/5] bg-gray-200 rounded-3xl overflow-hidden mb-4 sm:mb-6">
              <img className='w-full h-full object-cover' src={mqs} alt="mqst foto" loading="lazy" decoding="async" width="800" height="1000" />
            </div>
            <div className="flex items-center justify-between px-1.5 sm:px-2 pb-1.5 sm:pb-2 gap-2">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl leading-tight">Muhammad Muqsit Faiz<br />Maulana</h3>
                <p className="text-magenta font-semibold text-xs mt-0.5">Graphic Designer</p>
                <div className="flex items-center gap-1 text-muted text-xs sm:text-sm mt-1">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">Sorong, Southwest Papua</span>
                </div>
              </div>
              <div className="bg-pink100 text-magenta rounded-full px-2.5 sm:px-3 py-1 font-bold text-[10px] sm:text-xs uppercase tracking-wider text-center leading-tight shrink-0">
                EST.<br />2017
              </div>
            </div>
          </div>

          {/* Pink decoration behind card */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-magenta rounded-full blur-2xl opacity-40 z-0 pointer-events-none"></div>
        </div>

        {/* Work Experience (Moved under photo card) */}
        <div>
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-magenta">◆</span> WORK EXPERIENCE
          </h3>
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-line shadow-sm space-y-5 sm:space-y-6 relative">
            {/* Connecting line */}
            <div className="absolute left-[33px] sm:left-[39px] top-7 bottom-7 w-0.5 bg-line"></div>

            {/* Experience 1 - Lab Assistant */}
            <div className="relative flex gap-3 sm:gap-5 z-10">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-magenta mt-1 shrink-0 border-2 sm:border-4 border-white shadow-sm"></div>
              <div className="flex-1 space-y-1 sm:space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-sm sm:text-base text-ink">Laboratory Assistant</h4>
                  <div className="text-magenta font-bold text-[10px] sm:text-[11px] bg-pink50 px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">Apr 2025 – Present</div>
                </div>
                <ul className="text-muted text-xs font-medium space-y-1 list-disc list-inside">
                  <li>Laboratory Assistant at Universitas Muhammadiyah Sorong.</li>
                  <li>Guided laboratory practicum sessions &amp; provided student technical support.</li>
                </ul>
              </div>
            </div>

            {/* Experience 2 */}
            <div className="relative flex gap-3 sm:gap-5 z-10">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-magenta mt-1 shrink-0 border-2 sm:border-4 border-white shadow-sm"></div>
              <div className="flex-1 space-y-1 sm:space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-sm sm:text-base text-ink">Rancom A.K.A Laeta</h4>
                  <div className="text-magenta font-bold text-[10px] sm:text-[11px] bg-pink50 px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">Nov 2023 – Present</div>
                </div>
                <ul className="text-muted text-xs font-medium space-y-1 list-disc list-inside">
                  <li>Videos Editor and Graphic Designer</li>
                  <li>Design Merch for Comifuro 22 & 23 at ICE BSD</li>
                </ul>
              </div>
            </div>

            {/* Experience 3 */}
            <div className="relative flex gap-3 sm:gap-5 z-10">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-magenta mt-1 shrink-0 border-2 sm:border-4 border-white shadow-sm"></div>
              <div className="flex-1 space-y-1 sm:space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-sm sm:text-base text-ink">Graphic Design Intern</h4>
                  <div className="text-magenta font-bold text-[10px] sm:text-[11px] bg-pink50 px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">Jul 2024 – Nov 2024</div>
                </div>
                <ul className="text-muted text-xs font-medium space-y-1 list-disc list-inside">
                  <li>Visual designs for printing & promotional materials.</li>
                  <li>Ensured quality, color accuracy & layout consistency.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Text & Timelines */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="lg:col-span-7 space-y-8 sm:space-y-12"
      >
        <div>
          <div className="text-magenta font-bold tracking-widest text-xs uppercase mb-2">01 / STORY & IDENTITY</div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mb-4 sm:mb-6">
            ABOUT <span className="text-magenta">ME</span>
          </h2>
          <p className="text-muted text-sm sm:text-lg leading-relaxed font-medium">
            Passionate, results-driven graphic designer turning intricate concepts into crisp, memorable visual systems.
            Based in Sorong, I collaborate remotely with international VTubers, high-tempo hip-hop/urban dance collectives,
            and emerging commercial brands that demand punchy, unmistakable presence.
          </p>
        </div>

        {/* Education Roadmap */}
        <div>
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-4 sm:mb-6">
            <span className="text-magenta">◆</span> EDUCATION
          </h3>
          <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-line shadow-sm space-y-6 sm:space-y-8 relative">
            {/* Connecting line */}
            <div className="absolute left-[33px] sm:left-[41px] md:left-[49px] top-8 sm:top-10 bottom-8 sm:bottom-10 w-0.5 bg-line"></div>

            <div className="relative flex gap-4 sm:gap-6 z-10">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-magenta mt-1 shrink-0 border-2 sm:border-4 border-white shadow-sm"></div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-ink">SMKN 1 Kabupaten Sorong</h4>
                  <p className="text-muted text-xs sm:text-sm font-medium">High School</p>
                </div>
                <div className="text-magenta font-bold text-xs bg-pink50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap self-start sm:self-auto">2023–2025</div>
              </div>
            </div>

            <div className="relative flex gap-4 sm:gap-6 z-10">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-magenta mt-1 shrink-0 border-2 sm:border-4 border-white shadow-sm"></div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-ink">Muhammadiyah Sorong University</h4>
                  <p className="text-muted text-xs sm:text-sm font-medium">University</p>
                </div>
                <div className="text-magenta font-bold text-xs bg-pink50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap self-start sm:self-auto">2025 – Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Skills */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted mb-4">CORE SKILLS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <SkillCard icon="Ps" name="Photoshop" percent="97%" color="bg-[#31A8FF]" />
            <SkillCard icon="Ai" name="Illustrator" percent="88%" color="bg-[#FF9A00]" />
            <SkillCard icon="Fg" name="Figma" percent="67%" color="bg-[#0ACF83]" />
            <SkillCard icon="Cd" name="CorelDraw" percent="55%" color="bg-[#10B981]" />
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted mb-4">LANGUAGES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <LanguageCard name="English" percent="68%" />
            <LanguageCard name="Indonesian" percent="96%" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const LanguageCard = ({ name, percent }) => (
  <div className="bg-white p-5 rounded-2xl border border-line shadow-sm flex flex-col hover:border-magenta/30 hover:shadow-md transition-all">
    <div className="flex justify-between items-center mb-3">
      <span className="font-bold text-base text-ink">{name}</span>
      <span className="text-magenta font-bold text-sm tracking-tight">{percent}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-line/50">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: percent }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className="h-full rounded-full bg-magenta"
      />
    </div>
  </div>
);

const SkillCard = ({ icon, name, percent, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-line shadow-sm flex flex-col hover:border-magenta/30 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
        {icon}
      </div>
      <span className="text-magenta font-bold text-sm tracking-tight">{percent}</span>
    </div>
    <div className="font-bold text-sm text-ink">{name}</div>
    <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-3">Proficient</div>
    
    {/* Percentage Progress Bar */}
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-line/50 mt-auto">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: percent }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

export default About;
