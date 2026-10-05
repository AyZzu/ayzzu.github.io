import React from 'react';
import { LayoutDashboard, FolderKanban, Users, LogOut, FileText, X } from 'lucide-react';
import logoIcon from '../../assets/logo-magenta.webp';
import avatarImg from '../../assets/mqst-avatar.webp';

const AdminSidebar = ({ activeTab, onSelectTab, onLogout, worksCount = 0, currentUser, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: worksCount },
    { id: 'cv', label: 'Curriculum Vitae', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const handleItemClick = (id) => {
    onSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-line flex flex-col justify-between h-screen shrink-0 select-none transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-magenta/10 border border-magenta/20 flex items-center justify-center p-1.5 shadow-sm">
                <img src={logoIcon} alt="MQST" className="w-full h-auto object-contain" />
              </div>
              <div>
                <div className="font-display font-black text-xl tracking-wider text-ink leading-tight">
                  MQST
                </div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  STUDIO CMS
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-muted hover:text-ink hover:bg-page"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-magenta text-white shadow-lg shadow-magenta/25'
                    : 'text-muted hover:text-ink hover:bg-page'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-muted'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-pink50 text-magenta'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-line">
        <div className="bg-page/70 border border-line rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 border border-line shrink-0">
              <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-ink truncate">
                {currentUser?.name || 'Muqsit Faiz'}
              </div>
              <div className="text-[10px] text-muted font-medium truncate">
                {currentUser?.role || 'Administrator'}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-muted hover:text-magenta hover:bg-white border border-transparent hover:border-line transition-all shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  </>
);
};

export default AdminSidebar;
