import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Mail, Key, Trash2, Edit3, 
  CheckCircle2, XCircle, Search, RefreshCw, X, AlertCircle 
} from 'lucide-react';

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Editor',
    status: 'active'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setErrorMsg('Gagal memuat daftar user dari database.');
      }
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Editor',
      status: 'active'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank means keep current password
      role: user.role || 'Editor',
      status: user.status || 'active'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Nama dan Email wajib diisi!');
      return;
    }

    if (modalMode === 'add' && !formData.password.trim()) {
      setErrorMsg('Password wajib diisi untuk user baru!');
      return;
    }

    try {
      const url = modalMode === 'add' 
        ? 'http://localhost:5000/api/users' 
        : `http://localhost:5000/api/users/${selectedUser.id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || 'Terjadi kesalahan saat menyimpan user.');
        return;
      }

      setShowModal(false);
      setSuccessMsg(
        modalMode === 'add' 
          ? `User "${formData.name}" berhasil ditambahkan & dapat langsung login!` 
          : `User "${formData.name}" berhasil diperbarui!`
      );
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch {
      setErrorMsg('Gagal mengirim data ke server.');
    }
  };

  const handleDelete = async (user) => {
    if (users.length <= 1) {
      alert('Tidak dapat menghapus user terakhir dalam sistem.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus user "${user.name}" (${user.email})? Akun ini tidak akan bisa login lagi.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'DELETE'
      });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Gagal menghapus user');
        return;
      }

      setSuccessMsg(`User "${user.name}" berhasil dihapus dari database.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch {
      alert('Gagal menghubungi server.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-page p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-magenta/10 text-magenta flex items-center justify-center font-bold">
                <Users size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black font-display text-ink tracking-tight">
                  User Management
                </h1>
                <p className="text-xs text-muted font-medium mt-0.5">
                  Kelola akun kredensial MySQL untuk akses login dashboard CMS studio
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-2xl bg-white border border-line text-muted hover:text-ink hover:bg-page transition-all shadow-sm"
              title="Refresh User Data"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin text-magenta' : ''} />
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-magenta hover:bg-opacity-95 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-magenta/25 hover:shadow-xl transition-all"
            >
              <UserPlus size={16} />
              <span>Tambah User Baru</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-success/10 border border-success/30 text-ink px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 size={18} className="text-success shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Error Alert Banner */}
        {errorMsg && !showModal && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama / email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-page border border-line rounded-xl text-xs font-medium text-ink placeholder:text-muted focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-muted flex items-center gap-2">
            <span>Total Pengguna:</span>
            <span className="bg-page px-2.5 py-1 rounded-lg text-ink border border-line">
              {users.length} User
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-page/50 text-[11px] font-black uppercase tracking-wider text-muted">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Terdaftar Sejak</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs font-medium text-ink">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-muted">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-magenta" />
                        <span>Memuat data user dari MySQL...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-muted">
                      Tidak ada user yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = currentUser?.email === user.email;
                    return (
                      <tr key={user.id} className="hover:bg-page/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-magenta/20 to-pink50 border border-magenta/20 flex items-center justify-center font-black text-magenta text-sm">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-extrabold text-ink flex items-center gap-2">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="bg-magenta/10 text-magenta text-[10px] font-black px-2 py-0.5 rounded-full border border-magenta/20">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
                                <Mail size={12} className="text-muted" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-page border border-line text-ink">
                            <Shield size={12} className={user.role === 'Admin' ? 'text-magenta' : 'text-muted'} />
                            <span>{user.role || 'Editor'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-success/10 text-success border border-success/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-muted/10 text-muted border border-muted/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-muted text-[11px]">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-xl text-muted hover:text-ink hover:bg-page border border-transparent hover:border-line transition-all"
                              title="Edit User & Password"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={isSelf}
                              className={`p-2 rounded-xl border border-transparent transition-all ${
                                isSelf 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-muted hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                              }`}
                              title={isSelf ? 'Tidak bisa menghapus akun yang sedang dipakai' : 'Hapus User'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-magenta/10 text-magenta flex items-center justify-center font-bold">
                  {modalMode === 'add' ? <UserPlus size={18} /> : <Edit3 size={18} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-ink">
                    {modalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Data Pengguna'}
                  </h3>
                  <p className="text-[11px] text-muted font-medium">
                    {modalMode === 'add' ? 'Akun langsung disimpan di MySQL dan bisa login' : 'Perbarui nama, email, role, atau ubah password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-page transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error inside modal */}
            {errorMsg && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-600 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-muted mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-page border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-muted mb-1.5">
                  Email (Kredensial Login)
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@mqst.design"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-page border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-muted mb-1.5">
                  {modalMode === 'add' ? 'Password' : 'Password Baru (Opsional)'}
                </label>
                <input
                  type="password"
                  placeholder={modalMode === 'add' ? 'Masukkan password akun' : 'Kosongkan jika tidak ingin mengubah password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-page border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
                />
                {modalMode === 'edit' && (
                  <p className="text-[10px] text-muted mt-1 font-medium">
                    *Biarkan kolom password kosong jika tidak ingin mengubah password saat ini.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Role / Peran
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-page border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Lead Art Director">Lead Art Director</option>
                    <option value="Designer">Designer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-page border border-line rounded-xl text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/15 transition-all"
                  >
                    <option value="active">Active (Bisa Login)</option>
                    <option value="inactive">Inactive (Blokir)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-xs font-bold text-muted hover:text-ink hover:bg-page transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-magenta hover:bg-opacity-95 text-xs font-bold text-white shadow-lg shadow-magenta/25 hover:shadow-xl transition-all"
                >
                  {modalMode === 'add' ? 'Simpan & Berikan Akses' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
