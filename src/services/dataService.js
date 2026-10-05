import bcrypt from 'bcryptjs';
import { getSupabaseClient, isSupabaseConfigured, resolveAssetUrl } from '../utils/supabaseClient';
import initialWorks from '../assets/initialWorks.json';

const WORKS_LOCAL_STORAGE = 'mqst_works_data';
const CV_LOCAL_STORAGE = 'mqst_cv_data';
const USERS_LOCAL_STORAGE = 'mqst_users_data';

// Helper to convert a File/Blob to a Base64 Data URL (fallback for storage)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file to Supabase Storage bucket 'portfolio'.
 * If the bucket is unavailable, falls back to converting the file into a Base64 data URL
 * so that saves never fail.
 */
export async function uploadFileToSupabase(file, folder = 'works') {
  if (!file) return null;

  const client = getSupabaseClient();
  const fileExt = file.name ? file.name.split('.').pop() : 'webp';
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;

  if (client) {
    try {
      const { data, error } = await client.storage
        .from('portfolio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = client.storage
          .from('portfolio')
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to data URL:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, falling back:', err);
    }
  }

  // Fallback: Return Base64 data URL
  try {
    return await fileToDataUrl(file);
  } catch (err) {
    console.error('Failed to encode file to base64:', err);
    return null;
  }
}

// ==========================================
// WORKS (PORTFOLIO PROJECTS) CRUD
// ==========================================

export async function fetchWorks() {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('works')
        .select('*')
        .order('id', { ascending: false });

      if (!error && Array.isArray(data)) {
        const formatted = data.map(item => {
          let imgs = [];
          if (item.images) {
            try {
              imgs = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
            } catch {
              imgs = [item.image_url].filter(Boolean);
            }
          }
          if (!Array.isArray(imgs) || imgs.length === 0) {
            imgs = item.image_url ? [item.image_url] : [];
          }

          let tags = [];
          if (item.tags) {
            try {
              tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
            } catch {
              tags = Array.isArray(item.tags) ? item.tags : [];
            }
          }

          return {
            ...item,
            tags: Array.isArray(tags) ? tags : [],
            images: imgs.map(resolveAssetUrl),
            image_url: resolveAssetUrl(item.image_url || imgs[0] || '')
          };
        });

        // Cache latest fetched works locally
        localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify(formatted));
        return formatted;
      } else {
        console.warn('Supabase works fetch error, checking local fallback:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase fetchWorks exception:', err);
    }
  }

  // Fallback: localStorage or bundled initialWorks
  const localSaved = localStorage.getItem(WORKS_LOCAL_STORAGE);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({
          ...p,
          image_url: resolveAssetUrl(p.image_url),
          images: Array.isArray(p.images) ? p.images.map(resolveAssetUrl) : [resolveAssetUrl(p.image_url)]
        }));
      }
    } catch (e) {
      console.warn('Error reading local works cache:', e);
    }
  }

  // Default fallback from bundled initialWorks
  return (initialWorks || []).map(p => ({
    ...p,
    image_url: resolveAssetUrl(p.image_url),
    images: Array.isArray(p.images) ? p.images.map(resolveAssetUrl) : [resolveAssetUrl(p.image_url)]
  }));
}

export async function createWork(workData, newFiles = []) {
  const client = getSupabaseClient();

  // 1. Upload all new images to Supabase Storage
  const uploadedUrls = [];
  for (const file of newFiles) {
    if (file) {
      const url = await uploadFileToSupabase(file, 'works');
      if (url) uploadedUrls.push(url);
    }
  }

  // Combine with any existing images
  let existingList = [];
  if (workData.existing_images) {
    try {
      existingList = typeof workData.existing_images === 'string'
        ? JSON.parse(workData.existing_images)
        : workData.existing_images;
    } catch {}
  }

  const allImages = [...existingList, ...uploadedUrls];
  const primaryImageUrl = allImages[0] || '';

  const parsedTags = typeof workData.tags === 'string'
    ? workData.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (workData.tags || []);

  const projectSlug = workData.slug || workData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const payload = {
    title: workData.title,
    slug: projectSlug,
    category: workData.category || 'SOCIAL MEDIA POSTER',
    client: workData.client || 'Personal Project',
    year: workData.year || new Date().getFullYear().toString(),
    status: workData.status || 'Published',
    views: 0,
    tags: parsedTags,
    desc: workData.desc || '',
    image_url: primaryImageUrl,
    images: allImages,
    created_at: new Date().toISOString()
  };

  if (client) {
    const { data, error } = await client
      .from('works')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal menyimpan ke Supabase: ${error.message}`);
    }

    const saved = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : parsedTags,
      images: Array.isArray(data.images) ? data.images : allImages,
      image_url: data.image_url || primaryImageUrl
    };

    // Update local cache
    const currentList = await fetchWorks();
    localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify([saved, ...currentList.filter(p => p.id !== saved.id)]));

    return saved;
  }

  // Offline / LocalStorage fallback
  const fallbackProject = {
    id: Date.now(),
    ...payload
  };

  const currentList = await fetchWorks();
  localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify([fallbackProject, ...currentList]));
  return fallbackProject;
}

export async function updateWork(id, workData, newFiles = [], existingImages = []) {
  const client = getSupabaseClient();

  // Upload new files
  const newlyUploadedUrls = [];
  for (const file of newFiles) {
    if (file) {
      const url = await uploadFileToSupabase(file, 'works');
      if (url) newlyUploadedUrls.push(url);
    }
  }

  const allImages = [...existingImages, ...newlyUploadedUrls];
  const primaryImageUrl = allImages[0] || '';

  const parsedTags = typeof workData.tags === 'string'
    ? workData.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (workData.tags || []);

  const projectSlug = workData.slug || workData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const payload = {
    title: workData.title,
    slug: projectSlug,
    category: workData.category,
    client: workData.client,
    year: workData.year,
    status: workData.status,
    tags: parsedTags,
    desc: workData.desc
  };

  if (allImages.length > 0) {
    payload.image_url = primaryImageUrl;
    payload.images = allImages;
  }

  if (client) {
    const { data, error } = await client
      .from('works')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal memperbarui data di Supabase: ${error.message}`);
    }

    const updated = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : parsedTags,
      images: Array.isArray(data.images) ? data.images : allImages,
      image_url: data.image_url || primaryImageUrl
    };

    const currentList = await fetchWorks();
    const updatedList = currentList.map(p => p.id === id ? updated : p);
    localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify(updatedList));

    return updated;
  }

  // Local fallback
  const currentList = await fetchWorks();
  const updatedList = currentList.map(p => {
    if (p.id === id) {
      return {
        ...p,
        ...payload,
        ...(allImages.length > 0 ? { image_url: primaryImageUrl, images: allImages } : {})
      };
    }
    return p;
  });

  localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify(updatedList));
  return updatedList.find(p => p.id === id);
}

export async function deleteWork(id) {
  const client = getSupabaseClient();

  if (client) {
    const { error } = await client
      .from('works')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal menghapus project di Supabase: ${error.message}`);
    }
  }

  const currentList = await fetchWorks();
  const filtered = currentList.filter(p => p.id !== id);
  localStorage.setItem(WORKS_LOCAL_STORAGE, JSON.stringify(filtered));
  return true;
}

// ==========================================
// USER & AUTHENTICATION CRUD
// ==========================================

export async function authLogin(email, password) {
  const client = getSupabaseClient();

  // Emergency / default hardcoded admin check
  const isEmergencyAdmin = 
    (email === 'muqsit@mqst.design' || email === 'admin@mqst.design' || email === 'admin') &&
    (password === 'mqst2025' || password === 'admin' || password === '123456');

  if (client) {
    try {
      const { data: rows, error } = await client
        .from('users')
        .select('*')
        .eq('email', email);

      if (!error && rows && rows.length > 0) {
        const user = rows[0];

        if ((user.status || '').toLowerCase() !== 'active') {
          return { success: false, message: 'Akun kamu sedang dinonaktifkan oleh administrator.' };
        }

        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
          try {
            isMatch = await bcrypt.compare(password, user.password);
          } catch {
            isMatch = (user.password === password);
          }
        } else {
          isMatch = (user.password === password);
        }

        if (isMatch) {
          const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'Lead Art Director',
            avatar: '/src/assets/mqst-avatar.webp'
          };
          const token = `supabase-session-${Date.now()}-${user.id}`;
          return { success: true, token, user: authUser };
        } else {
          return { success: false, message: 'Password yang kamu masukkan salah!' };
        }
      }
    } catch (err) {
      console.warn('Supabase login check error:', err);
    }
  }

  // Fallback check
  if (isEmergencyAdmin) {
    const mockUser = {
      name: 'Muqsit Faiz',
      email: email.includes('@') ? email : 'muqsit@mqst.design',
      role: 'Lead Art Director',
      avatar: '/src/assets/mqst-avatar.webp'
    };
    return {
      success: true,
      token: `local-session-${Date.now()}`,
      user: mockUser
    };
  }

  return { success: false, message: 'Akun tidak ditemukan atau kredensial salah.' };
}

export async function fetchUsers() {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('users')
        .select('id, name, email, role, status, created_at')
        .order('id', { ascending: false });

      if (!error && Array.isArray(data)) {
        localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Fetch users from Supabase failed:', err);
    }
  }

  // Fallback users list
  const local = localStorage.getItem(USERS_LOCAL_STORAGE);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }

  return [
    {
      id: 1,
      name: 'Muqsit Faiz',
      email: 'muqsit@mqst.design',
      role: 'Lead Art Director',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];
}

export async function createUser(userData) {
  const client = getSupabaseClient();
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const payload = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'Designer',
    status: userData.status || 'Active',
    created_at: new Date().toISOString()
  };

  if (client) {
    // Check email uniqueness
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('email', userData.email);

    if (existing && existing.length > 0) {
      throw new Error('Email tersebut sudah terdaftar untuk pengguna lain!');
    }

    const { data, error } = await client
      .from('users')
      .insert([payload])
      .select('id, name, email, role, status, created_at')
      .single();

    if (error) {
      throw new Error(`Gagal menambahkan user di Supabase: ${error.message}`);
    }

    const users = await fetchUsers();
    localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify([data, ...users]));
    return data;
  }

  // Local fallback
  const localUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    role: userData.role || 'Designer',
    status: userData.status || 'Active',
    created_at: new Date().toISOString()
  };
  const users = await fetchUsers();
  localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify([localUser, ...users]));
  return localUser;
}

export async function updateUser(id, userData) {
  const client = getSupabaseClient();

  const payload = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status
  };

  if (userData.password && userData.password.trim()) {
    payload.password = await bcrypt.hash(userData.password, 10);
  }

  if (client) {
    const { data, error } = await client
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('id, name, email, role, status, created_at')
      .single();

    if (error) {
      throw new Error(`Gagal memperbarui user di Supabase: ${error.message}`);
    }

    const users = await fetchUsers();
    const updated = users.map(u => u.id === id ? data : u);
    localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify(updated));
    return data;
  }

  // Local fallback
  const users = await fetchUsers();
  const updated = users.map(u => u.id === id ? { ...u, ...payload } : u);
  localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify(updated));
  return updated.find(u => u.id === id);
}

export async function deleteUser(id) {
  const client = getSupabaseClient();

  if (client) {
    const { error } = await client
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal menghapus user di Supabase: ${error.message}`);
    }
  }

  const users = await fetchUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem(USERS_LOCAL_STORAGE, JSON.stringify(filtered));
  return true;
}

// ==========================================
// CV / RESUME MANAGEMENT
// ==========================================

export async function fetchCv() {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('site_settings')
        .select('*')
        .eq('key_name', 'cv_info')
        .single();

      if (!error && data?.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        if (parsed?.cv_url) {
          parsed.cv_url = resolveAssetUrl(parsed.cv_url);
        }
        localStorage.setItem(CV_LOCAL_STORAGE, JSON.stringify(parsed));
        return parsed;
      }
    } catch (err) {
      console.warn('Fetch CV from Supabase failed:', err);
    }
  }

  // LocalStorage fallback
  const local = localStorage.getItem(CV_LOCAL_STORAGE);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed?.cv_url) {
        parsed.cv_url = resolveAssetUrl(parsed.cv_url);
      }
      return parsed;
    } catch {}
  }

  return { success: false, cv_url: null };
}

export async function uploadCv(file) {
  if (!file) throw new Error('Tidak ada file CV yang dipilih');

  // 1. Upload to Supabase Storage bucket 'portfolio' (or fallback to Data URL)
  const cvUrl = await uploadFileToSupabase(file, 'cv');

  const cvInfo = {
    success: true,
    cv_url: cvUrl,
    filename: file.name,
    original_name: file.name,
    size: file.size,
    mimetype: file.type,
    updated_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('site_settings')
        .upsert(
          { key_name: 'cv_info', value: cvInfo, updated_at: new Date().toISOString() },
          { onConflict: 'key_name' }
        );

      if (error) {
        console.warn('Failed to upsert cv_info in site_settings:', error.message);
      }
    } catch (err) {
      console.warn('Exception updating site_settings for CV:', err);
    }
  }

  localStorage.setItem(CV_LOCAL_STORAGE, JSON.stringify(cvInfo));
  return cvInfo;
}

export async function deleteCv() {
  const client = getSupabaseClient();

  if (client) {
    try {
      await client
        .from('site_settings')
        .delete()
        .eq('key_name', 'cv_info');
    } catch (err) {
      console.warn('Error deleting CV from Supabase site_settings:', err);
    }
  }

  localStorage.removeItem(CV_LOCAL_STORAGE);
  return { success: true };
}

// ==========================================
// SYSTEM STATUS / HEALTH CHECK
// ==========================================

export async function checkSystemStatus() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      status: 'offline',
      database: 'SUPABASE DISCONNECTED',
      message: 'Kredensial Supabase belum diisi. Menggunakan Local Cache.',
      configured: false
    };
  }

  try {
    const start = performance.now();
    const { error } = await client
      .from('works')
      .select('id')
      .limit(1);

    const latency = Math.round(performance.now() - start);

    if (error) {
      return {
        status: 'warning',
        database: 'SUPABASE CONNECTED (TABEL BELUM DIBUAT)',
        message: `Terkoneksi ke Supabase, tapi tabel 'works' belum ada (${error.message}). Jalankan supabase_schema.sql.`,
        configured: true,
        latency: `${latency}ms`
      };
    }

    return {
      status: 'online',
      database: 'SUPABASE ONLINE',
      message: `Terhubung langsung ke Supabase Cloud (${latency}ms). Siap untuk GitHub Pages!`,
      configured: true,
      latency: `${latency}ms`
    };
  } catch (err) {
    return {
      status: 'offline',
      database: 'SUPABASE ERROR',
      message: err.message,
      configured: true
    };
  }
}
