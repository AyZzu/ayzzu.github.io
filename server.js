import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'cv' ? 'cv-' : 'project-';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, prefix + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portomqst_db',
  port: Number(process.env.DB_PORT) || 3306
};

let dbPool = null;
let isConnecting = false;

const worksCachePath = path.join(uploadDir, 'works-cache.json');

function readWorksCache() {
  if (fs.existsSync(worksCachePath)) {
    try {
      return JSON.parse(fs.readFileSync(worksCachePath, 'utf8'));
    } catch (e) {
      console.warn('Error reading works-cache.json:', e.message);
    }
  }
  return [];
}

function writeWorksCache(data) {
  try {
    fs.writeFileSync(worksCachePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('Error writing works-cache.json:', e.message);
  }
}

async function initDB() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    const conn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await conn.end();

    dbPool = mysql.createPool(dbConfig);

    // Create works table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`works\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`client\` VARCHAR(150) DEFAULT '',
        \`year\` VARCHAR(10) DEFAULT '2025',
        \`status\` VARCHAR(50) DEFAULT 'Published',
        \`views\` INT DEFAULT 0,
        \`tags\` TEXT,
        \`desc\` TEXT,
        \`image_url\` VARCHAR(500) DEFAULT '',
        \`images\` LONGTEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure images column exists for backward compatibility
    try {
      await dbPool.query('ALTER TABLE `works` ADD COLUMN `images` LONGTEXT;');
    } catch {
      // Column already exists, ignore
    }

    // Create users table for User Management & Authentication
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(100) DEFAULT 'Administrator',
        \`status\` VARCHAR(50) DEFAULT 'Active',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create site_settings table for dynamic configurations like CV
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`site_settings\` (
        \`key_name\` VARCHAR(100) PRIMARY KEY,
        \`value\` LONGTEXT,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default admin if users table is empty
    const [existingUsers] = await dbPool.query('SELECT COUNT(*) as count FROM `users`');
    if (existingUsers[0].count === 0) {
      const defaultHash = await bcrypt.hash('mqst2025', 10);
      await dbPool.query(
        'INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES (?, ?, ?, ?, ?)',
        ['Muqsit Faiz', 'muqsit@mqst.design', defaultHash, 'Lead Art Director', 'Active']
      );
      console.log('Seeded default admin user: muqsit@mqst.design / mqst2025');
    }

    // Sync works cache into MySQL if MySQL works table is empty
    const [existingWorks] = await dbPool.query('SELECT COUNT(*) as count FROM `works`');
    if (existingWorks[0].count === 0) {
      const cached = readWorksCache();
      if (cached.length > 0) {
        for (const item of cached) {
          const parsedTags = Array.isArray(item.tags) ? item.tags : [];
          await dbPool.query(
            `INSERT INTO \`works\` (\`title\`, \`slug\`, \`category\`, \`client\`, \`year\`, \`status\`, \`views\`, \`tags\`, \`desc\`, \`image_url\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.title,
              item.slug || '',
              item.category || 'SOCIAL MEDIA POSTER',
              item.client || '',
              item.year || '2025',
              item.status || 'Published',
              item.views || 0,
              JSON.stringify(parsedTags),
              item.desc || '',
              item.image_url || ''
            ]
          );
        }
        console.log(`Synced ${cached.length} cached works into MySQL!`);
      }
    } else {
      // Sync fresh MySQL works to cache
      const [rows] = await dbPool.query('SELECT * FROM `works` ORDER BY id DESC');
      const formatted = rows.map(r => ({
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags
      }));
      writeWorksCache(formatted);
    }

    console.log('✅ Connected to MySQL database successfully! Tables `works` and `users` are ready.');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    dbPool = null;
  } finally {
    isConnecting = false;
  }
}

initDB();

// Auto-reconnect to MySQL every 5 seconds if disconnected
setInterval(async () => {
  if (!dbPool) {
    await initDB();
  }
}, 5000);

// API Health / Status check (shows in CMS Sign In)
app.get('/api/status', async (req, res) => {
  let isMySQLOnline = false;
  if (dbPool) {
    try {
      await dbPool.query('SELECT 1');
      isMySQLOnline = true;
    } catch {
      isMySQLOnline = false;
    }
  }
  res.json({
    status: isMySQLOnline ? 'online' : 'offline',
    mysql: isMySQLOnline ? 'ONLINE' : 'OFFLINE',
    cluster: 'localhost:3306',
    cms_version: 'v3.4'
  });
});

// Admin Auth Login endpoint directly validating against MySQL `users` table
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi!' });
  }

  if (!dbPool) {
    // If DB is offline, allow emergency login
    if (
      (email === 'muqsit@mqst.design' || email === 'admin@mqst.design' || email === 'admin') &&
      (password === 'mqst2025' || password === 'admin')
    ) {
      return res.json({
        success: true,
        token: 'session-' + Date.now(),
        user: { name: 'Muqsit Faiz', email, role: 'Lead Art Director' }
      });
    }
    return res.status(503).json({ success: false, message: 'MySQL offline' });
  }

  try {
    const [rows] = await dbPool.query('SELECT * FROM `users` WHERE `email` = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Akun dengan email tersebut tidak ditemukan!' });
    }

    const user = rows[0];
    const statusNorm = (user.status || '').toLowerCase();
    if (statusNorm !== 'active') {
      return res.status(403).json({ success: false, message: 'Akun kamu sedang dinonaktifkan oleh administrator.' });
    }

    // Compare with bcrypt hash or plaintext fallback
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password yang kamu masukkan salah!' });
    }

    return res.json({
      success: true,
      token: 'session-mqst-token-' + Date.now() + '-' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: '/src/assets/mqst-avatar.webp'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== USER MANAGEMENT API ====================

// GET all users
app.get('/api/users', async (req, res) => {
  if (!dbPool) {
    return res.json([]);
  }
  try {
    const [rows] = await dbPool.query('SELECT `id`, `name`, `email`, `role`, `status`, `created_at` FROM `users` ORDER BY id DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST create user
app.post('/api/users', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database MySQL offline' });
  }
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi!' });
    }

    // Check email uniqueness
    const [existing] = await dbPool.query('SELECT id FROM `users` WHERE `email` = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email tersebut sudah terdaftar untuk pengguna lain!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbPool.query(
      'INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'Designer', status || 'Active']
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: role || 'Designer',
      status: status || 'Active',
      created_at: new Date()
    };
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT update user (can optionally update password)
app.put('/api/users/:id', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database MySQL offline' });
  }
  const id = Number(req.params.id);
  try {
    const { name, email, password, role, status } = req.body;

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await dbPool.query(
        'UPDATE `users` SET `name` = ?, `email` = ?, `password` = ?, `role` = ?, `status` = ? WHERE `id` = ?',
        [name, email, hashedPassword, role, status, id]
      );
    } else {
      await dbPool.query(
        'UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `status` = ? WHERE `id` = ?',
        [name, email, role, status, id]
      );
    }

    const [rows] = await dbPool.query('SELECT `id`, `name`, `email`, `role`, `status`, `created_at` FROM `users` WHERE id = ?', [id]);
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database MySQL offline' });
  }
  const id = Number(req.params.id);
  try {
    // Prevent deleting all users
    const [countRow] = await dbPool.query('SELECT COUNT(*) as count FROM `users`');
    if (countRow[0].count <= 1) {
      return res.status(400).json({ error: 'Tidak bisa menghapus user terakhir dalam sistem!' });
    }

    await dbPool.query('DELETE FROM `users` WHERE `id` = ?', [id]);
    return res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET all works directly from MySQL (with seamless cache fallback & carousel support)
app.get('/api/works', async (req, res) => {
  if (!dbPool) {
    return res.json(readWorksCache());
  }

  try {
    const [rows] = await dbPool.query('SELECT * FROM `works` ORDER BY id DESC');
    const formatted = rows.map(r => {
      let parsedImages = [];
      if (r.images) {
        try {
          parsedImages = typeof r.images === 'string' ? JSON.parse(r.images) : r.images;
        } catch {}
      }
      if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
        parsedImages = r.image_url ? [r.image_url] : [];
      }
      return {
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
        images: parsedImages,
        image_url: r.image_url || parsedImages[0] || ''
      };
    });
    writeWorksCache(formatted);
    return res.json(formatted);
  } catch (err) {
    console.error('MySQL query error:', err.message);
    return res.json(readWorksCache());
  }
});

// POST new work (supports multiple carousel images) directly into MySQL
app.post('/api/works', upload.any(), async (req, res) => {
  try {
    const { title, slug, category, client, year, desc, tags, status, existing_images } = req.body;
    
    // Extract new uploaded files
    const newImageUrls = (req.files || []).map(f => `http://localhost:${PORT}/uploads/${f.filename}`);
    
    // Parse any existing images passed
    let existingList = [];
    if (existing_images) {
      try {
        existingList = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      } catch {}
    }

    const allImages = [...existingList, ...newImageUrls];
    const primaryImageUrl = allImages[0] || '';

    const parsedTags = typeof tags === 'string' 
      ? tags.split(',').map(t => t.trim()).filter(Boolean) 
      : (tags || []);
    const projectSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProject = {
      title,
      slug: projectSlug,
      category: category || 'SOCIAL MEDIA POSTER',
      client: client || 'Personal Project',
      year: year || new Date().getFullYear().toString(),
      status: status || 'Published',
      views: 0,
      tags: parsedTags,
      desc: desc || '',
      image_url: primaryImageUrl,
      images: allImages
    };

    if (dbPool) {
      const [result] = await dbPool.query(
        `INSERT INTO \`works\` (\`title\`, \`slug\`, \`category\`, \`client\`, \`year\`, \`status\`, \`views\`, \`tags\`, \`desc\`, \`image_url\`, \`images\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProject.title,
          newProject.slug,
          newProject.category,
          newProject.client,
          newProject.year,
          newProject.status,
          0,
          JSON.stringify(newProject.tags),
          newProject.desc,
          newProject.image_url,
          JSON.stringify(newProject.images)
        ]
      );
      newProject.id = result.insertId;

      // Update cache
      const [allRows] = await dbPool.query('SELECT * FROM `works` ORDER BY id DESC');
      writeWorksCache(allRows.map(r => {
        let pImgs = [];
        try { pImgs = typeof r.images === 'string' ? JSON.parse(r.images) : r.images; } catch {}
        if (!Array.isArray(pImgs) || pImgs.length === 0) pImgs = r.image_url ? [r.image_url] : [];
        return {
          ...r,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
          images: pImgs,
          image_url: r.image_url || pImgs[0] || ''
        };
      }));
    } else {
      newProject.id = Date.now();
      const cached = readWorksCache();
      cached.unshift(newProject);
      writeWorksCache(cached);
    }

    return res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    console.error('MySQL insert error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update work (supports adding/updating carousel images)
app.put('/api/works/:id', upload.any(), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { title, slug, category, client, year, desc, tags, status, existing_images } = req.body;
    const parsedTags = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : (tags || []);
    const projectSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newImageUrls = (req.files || []).map(f => `http://localhost:${PORT}/uploads/${f.filename}`);
    let existingList = [];
    if (existing_images) {
      try {
        existingList = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      } catch {}
    }

    const allImages = [...existingList, ...newImageUrls];
    const primaryImageUrl = allImages[0] || '';

    if (dbPool) {
      // If user supplied new images or edited existing_images, update both image_url and images
      let imageQueryPart = '';
      const params = [title, projectSlug, category, client, year, status, JSON.stringify(parsedTags), desc];

      if (allImages.length > 0) {
        imageQueryPart = ', `image_url` = ?, `images` = ?';
        params.push(primaryImageUrl, JSON.stringify(allImages));
      }
      params.push(id);

      await dbPool.query(
        `UPDATE \`works\` 
         SET \`title\` = ?, \`slug\` = ?, \`category\` = ?, \`client\` = ?, \`year\` = ?, \`status\` = ?, \`tags\` = ?, \`desc\` = ?${imageQueryPart}
         WHERE \`id\` = ?`,
        params
      );

      const [rows] = await dbPool.query('SELECT * FROM `works` WHERE `id` = ?', [id]);
      const updated = rows[0];
      if (updated) {
        let pImgs = [];
        try { pImgs = typeof updated.images === 'string' ? JSON.parse(updated.images) : updated.images; } catch {}
        if (!Array.isArray(pImgs) || pImgs.length === 0) pImgs = updated.image_url ? [updated.image_url] : [];
        updated.tags = typeof updated.tags === 'string' ? JSON.parse(updated.tags || '[]') : (updated.tags || []);
        updated.images = pImgs;
        updated.image_url = updated.image_url || pImgs[0] || '';
      }

      // Update cache
      const [allRows] = await dbPool.query('SELECT * FROM `works` ORDER BY id DESC');
      writeWorksCache(allRows.map(r => {
        let pImgs = [];
        try { pImgs = typeof r.images === 'string' ? JSON.parse(r.images) : r.images; } catch {}
        if (!Array.isArray(pImgs) || pImgs.length === 0) pImgs = r.image_url ? [r.image_url] : [];
        return {
          ...r,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
          images: pImgs,
          image_url: r.image_url || pImgs[0] || ''
        };
      }));

      return res.json({ success: true, project: updated });
    } else {
      const cached = readWorksCache();
      const idx = cached.findIndex(p => p.id === id);
      if (idx !== -1) {
        cached[idx] = {
          ...cached[idx],
          title,
          slug: projectSlug,
          category,
          client,
          year,
          status,
          tags: parsedTags,
          desc,
          ...(allImages.length > 0 ? { image_url: primaryImageUrl, images: allImages } : {})
        };
        writeWorksCache(cached);
        return res.json({ success: true, project: cached[idx] });
      }
      return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });
    }
  } catch (err) {
    console.error('MySQL update error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE work directly from MySQL
app.delete('/api/works/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (dbPool) {
      await dbPool.query('DELETE FROM `works` WHERE id = ?', [id]);
      const [allRows] = await dbPool.query('SELECT * FROM `works` ORDER BY id DESC');
      writeWorksCache(allRows.map(r => ({
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags
      })));
    } else {
      const cached = readWorksCache().filter(p => p.id !== id);
      writeWorksCache(cached);
    }
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('MySQL delete error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== CV / RESUME ENDPOINTS ====================

// GET active CV info
app.get('/api/cv', async (req, res) => {
  const jsonPath = path.join(uploadDir, 'cv-info.json');

  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM `site_settings` WHERE `key_name` = ?', ['cv_info']);
      if (rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('MySQL cv read fallback to file:', err.message);
    }
  }

  // Fallback to local cv-info.json
  if (fs.existsSync(jsonPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json(fileData);
    } catch (e) {
      console.warn('Error reading cv-info.json:', e);
    }
  }

  return res.json({ success: false, cv_url: null });
});

// POST upload new CV
app.post('/api/cv', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file CV yang diunggah!' });
  }

  const cvUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  const cvInfo = {
    success: true,
    cv_url: cvUrl,
    filename: req.file.filename,
    original_name: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    updated_at: new Date().toISOString()
  };

  // Save to local file uploads/cv-info.json
  const jsonPath = path.join(uploadDir, 'cv-info.json');
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(cvInfo, null, 2));
  } catch (err) {
    console.warn('Failed to write cv-info.json:', err.message);
  }

  // Save to MySQL if available
  if (dbPool) {
    try {
      await dbPool.query(
        'INSERT INTO `site_settings` (`key_name`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        ['cv_info', JSON.stringify(cvInfo)]
      );
    } catch (err) {
      console.warn('MySQL error saving cv_info:', err.message);
    }
  }

  return res.status(200).json(cvInfo);
});

// DELETE CV
app.delete('/api/cv', async (req, res) => {
  const jsonPath = path.join(uploadDir, 'cv-info.json');
  let currentFile = null;

  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      currentFile = data.filename;
      fs.unlinkSync(jsonPath);
    } catch {}
  }

  if (currentFile) {
    const filePath = path.join(uploadDir, currentFile);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  if (dbPool) {
    try {
      await dbPool.query('DELETE FROM `site_settings` WHERE `key_name` = ?', ['cv_info']);
    } catch {}
  }

  return res.json({ success: true, message: 'CV berhasil dihapus' });
});

app.listen(PORT, () => {
  console.log(`🚀 MQST CMS Backend Server listening on http://localhost:${PORT}`);
});
