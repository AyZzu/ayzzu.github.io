import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Menu } from 'lucide-react';
import Login from './Login';
import AdminSidebar from './AdminSidebar';
import ProjectsList from './ProjectsList';
import UploadProject from './UploadProject';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CvManagement from './CvManagement';
import { fetchWorks, deleteWork } from '../../services/dataService';
import { isSupabaseConfigured, testSupabaseConnection } from '../../utils/supabaseClient';

const AdminApp = ({ onBackToPortfolio }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mqst_cms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('projects'); // 'dashboard', 'projects', 'upload'
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dbStatus, setDbStatus] = useState({ mysql: 'ONLINE' });
  const [toastMessage, setToastMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch status and projects
  const fetchProjects = async () => {
    try {
      const data = await fetchWorks();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Projects fetch error:', err);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (isSupabaseConfigured()) {
        try {
          const test = await testSupabaseConnection();
          setDbStatus({ 
            mysql: test.success ? 'ONLINE' : 'OFFLINE',
            supabase: test.success ? 'ONLINE' : 'ERROR',
            message: test.message 
          });
        } catch {
          setDbStatus({ mysql: 'OFFLINE', supabase: 'ERROR' });
        }
      } else {
        setDbStatus({ mysql: 'OFFLINE', supabase: 'NOT_CONFIGURED' });
      }
    };

    checkStatus();
    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mqst_cms_token');
    localStorage.removeItem('mqst_cms_user');
    setCurrentUser(null);
  };

  const handleStartAddNew = () => {
    setEditingProject(null);
    setActiveTab('upload');
  };

  const handleStartEdit = (proj) => {
    setEditingProject(proj);
    setActiveTab('upload');
  };

  const handleUploadSuccess = (savedProj, isEdit = false) => {
    if (isEdit) {
      setProjects(prev => prev.map(p => p.id === savedProj.id ? savedProj : p));
      setToastMessage(`Perubahan pada project "${savedProj.title}" berhasil disimpan!`);
    } else {
      setProjects(prev => [savedProj, ...prev]);
      setToastMessage(`Project "${savedProj.title}" berhasil diunggah ke database MySQL!`);
    }
    setEditingProject(null);
    setActiveTab('projects');
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Yakin ingin menghapus project ini dari portfolio?')) return;
    try {
      await deleteWork(id);
    } catch (err) {
      console.error('Delete work error:', err);
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    setToastMessage('Project berhasil dihapus dari database.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // If not logged in, show Image 1 Login page
  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={(user) => setCurrentUser(user)} 
        onBackToPortfolio={onBackToPortfolio}
        dbStatus={dbStatus}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-page text-ink font-sans selection:bg-magenta selection:text-white relative">
      {/* Toast Notification Pop-up */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-4 sm:right-8 z-50 bg-white border border-success/30 rounded-2xl p-4 shadow-2xl shadow-success/10 flex items-center gap-3 text-ink max-w-md m-2"
          >
            <div className="w-9 h-9 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-ink">BERHASIL DIPUBLIKASIKAN!</div>
              <div className="text-muted font-medium mt-0.5">{toastMessage}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-line sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-page border border-line text-ink hover:text-magenta transition-colors"
          aria-label="Buka Menu Admin"
        >
          <Menu size={20} />
        </button>
        <span className="font-display font-black text-sm tracking-wider text-ink">MQST STUDIO CMS</span>
        <button
          onClick={onBackToPortfolio}
          className="text-xs font-bold text-magenta hover:underline"
        >
          Lihat Web
        </button>
      </div>

      {/* Persistent Left Sidebar (Drawer on mobile) */}
      <AdminSidebar
        activeTab={activeTab === 'upload' ? 'projects' : activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
        worksCount={projects.length}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area based on Tab */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          projects={projects}
          onAddNew={handleStartAddNew}
          onGoToProjects={() => setActiveTab('projects')}
          onGoToCv={() => setActiveTab('cv')}
          onGoToPortfolio={onBackToPortfolio}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsList
          projects={projects}
          onAddNew={handleStartAddNew}
          onEditProject={handleStartEdit}
          onDeleteProject={handleDeleteProject}
          onGoToPortfolio={onBackToPortfolio}
        />
      )}

      {activeTab === 'users' && (
        <UserManagement currentUser={currentUser} />
      )}

      {activeTab === 'cv' && (
        <CvManagement />
      )}

      {activeTab === 'upload' && (
        <UploadProject
          onBack={() => {
            setEditingProject(null);
            setActiveTab('projects');
          }}
          onSuccess={handleUploadSuccess}
          editingProject={editingProject}
        />
      )}
      </div>
    </div>
  );
};

export default AdminApp;
