import React from 'react';
import { 
  FolderKanban, Eye, Sparkles, TrendingUp, Users, ArrowUpRight, 
  Clock, Plus, CheckCircle, ExternalLink, FileText 
} from 'lucide-react';

const AdminDashboard = ({ projects, onAddNew, onGoToProjects, onGoToCv, onGoToPortfolio }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-page min-h-screen">
      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-line px-8 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
            STUDIO CMS OVERVIEW
          </div>
          <div className="font-display font-black text-xl text-ink">
            DASHBOARD CONSOLE
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onGoToPortfolio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-page text-xs font-bold text-ink hover:text-magenta hover:border-magenta/50 transition-all"
          >
            <ExternalLink size={14} />
            <span>Live Portfolio</span>
          </button>

          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-xl bg-magenta text-white text-xs font-extrabold tracking-wider uppercase hover:bg-pink shadow-md shadow-magenta/25 transition-all flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Upload Project</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-magenta via-pink to-brandOrange rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-magenta/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest mb-4 backdrop-blur-sm">
              ✦ STUDIO METRICS &amp; HEALTH
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-none mb-3">
              HELLO, MUQSIT!
            </h1>
            <p className="text-white/90 text-sm font-medium leading-relaxed">
              Semua sistem MySQL &amp; portfolio CMS online. Kamu memiliki total{' '}
              <strong className="underline underline-offset-4 font-bold">{projects.length} curated projects</strong> yang sedang aktif tampil di portofolio publik.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3">
            <button
              onClick={onGoToProjects}
              className="px-6 py-3.5 rounded-2xl bg-white text-ink text-xs font-extrabold uppercase tracking-wider hover:bg-page transition-all shadow-md"
            >
              Kelola Projects
            </button>
            <button
              onClick={onGoToCv}
              className="px-6 py-3.5 rounded-2xl bg-white/20 border border-white/40 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-white/30 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <FileText size={15} />
              <span>Kelola CV</span>
            </button>
            <button
              onClick={onAddNew}
              className="px-6 py-3.5 rounded-2xl bg-white/20 border border-white/40 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              + Upload Baru
            </button>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox 
            title="TOTAL PROJECTS" 
            value={projects.length} 
            subtitle="Live in Portfolio" 
            icon={<FolderKanban size={20} className="text-magenta" />} 
          />
          <StatBox 
            title="TOTAL VIEWS" 
            value="142.8K" 
            subtitle="+26.4% this month" 
            icon={<Eye size={20} className="text-blue-500" />} 
          />
          <StatBox 
            title="CLIENT INQUIRIES" 
            value="19" 
            subtitle="4 Pending brief review" 
            icon={<Users size={20} className="text-brandOrange" />} 
          />
          <StatBox 
            title="DATABASE STATUS" 
            value="MYSQL ONLINE" 
            subtitle="Localhost:3306 (Auto Seed)" 
            icon={<CheckCircle size={20} className="text-success" />} 
          />
        </div>

        {/* Recent Projects Table Preview */}
        <div className="bg-white rounded-3xl border border-line shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-xl text-ink">
                RECENTLY ADDED WORKS
              </h2>
              <p className="text-xs text-muted font-medium mt-1">
                Karya-karya terakhir yang baru diunggah ke database MySQL.
              </p>
            </div>
            <button
              onClick={onGoToProjects}
              className="text-xs font-bold text-magenta hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Project</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="bg-page/60 border border-line rounded-2xl p-4 hover:border-magenta/40 hover:bg-white transition-all group"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-line mb-4 relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink50 text-magenta font-black text-xs uppercase">
                      MQST WORK
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-extrabold uppercase text-magenta bg-pink50 px-2 py-0.5 rounded inline-block mb-2">
                  {item.category}
                </div>
                <h3 className="font-display font-bold text-base text-ink line-clamp-1 group-hover:text-magenta transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2 mt-1">
                  {item.desc || 'No description provided'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ title, value, subtitle, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-line shadow-sm flex items-start justify-between">
    <div>
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1">
        {title}
      </div>
      <div className="font-display font-black text-2xl text-ink">
        {value}
      </div>
      <div className="text-[11px] text-muted font-medium mt-1">
        {subtitle}
      </div>
    </div>
    <div className="w-10 h-10 rounded-xl bg-page border border-line flex items-center justify-center shrink-0">
      {icon}
    </div>
  </div>
);

export default AdminDashboard;
