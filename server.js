/*
  EDUCIENCIA – Servidor Node.js
  - Sirve archivos estáticos del proyecto
  - Expone APIs compatibles con server.py y api/data.php
    Endpoints:
      GET  /api/data, /api/data.php        → devuelve data/data.json
      POST /api/data, /api/data.php       → guarda data/data.json (panel admin)
      GET  /api/registros                 → devuelve data/registros.json
      POST /api/registros                 → guarda lista completa (marcar leído)
      GET  /api/mensajes                  → devuelve data/mensajes.json
      POST /api/mensajes                  → guarda lista completa (marcar leído)
      POST /api/registro                  → agrega un registro de estudiante
      POST /api/mensaje                   → agrega un mensaje del formulario
      DELETE /api/registro?id=...         → elimina un registro por id
      DELETE /api/mensaje?id=...          → elimina un mensaje por id
*/

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const crypto = require('crypto');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const REGISTROS_FILE = path.join(DATA_DIR, 'registros.json');
const MENSAJES_FILE = path.join(DATA_DIR, 'mensajes.json');

// Credenciales del panel de administración
const ADMIN_USER = process.env.ADMIN_USER || 'jonnathan.dominguezunaeCGAGOM';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Unae.2026#CGAGOM_Educiencia';

// Sesiones activas en memoria (se borran al reiniciar el servidor)
const activeSessions = new Set();

function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión en el panel de administración.' });
  }
  next();
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Helpers
async function ensureFile(filePath, defaultValue) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function readJson(filePath, defaultValue) {
  await ensureFile(filePath, defaultValue);
  try {
    const txt = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(txt);
  } catch {
    return defaultValue;
  }
}

async function writeJson(filePath, obj) {
  const json = JSON.stringify(obj, null, 2);
  await fsp.writeFile(filePath, json, 'utf-8');
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

// Middleware
app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('*', (req, res) => res.sendStatus(200));

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body || {};
  if (usuario === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.add(token);
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
});

app.post('/api/logout', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  activeSessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/auth-check', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  res.json({ authenticated: activeSessions.has(token) });
});

// API routes
app.get(['/api/data', '/api/data.php'], async (req, res) => {
  try {
    const buf = await fsp.readFile(DATA_FILE);
    res.type('application/json; charset=utf-8').send(buf);
  } catch (e) {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

app.post(['/api/data', '/api/data.php'], requireAuth, async (req, res) => {
  try {
    const body = req.body;
    if (typeof body !== 'object' || body === null) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
    await writeJson(DATA_FILE, body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo guardar el archivo' });
  }
});

// Registros
app.get('/api/registros', requireAuth, async (req, res) => {
  const data = await readJson(REGISTROS_FILE, []);
  res.json(data);
});

app.post('/api/registros', requireAuth, async (req, res) => {
  const lista = req.body;
  if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba una lista JSON' });
  await writeJson(REGISTROS_FILE, lista);
  res.json({ ok: true });
});

app.post('/api/registro', async (req, res) => {
  try {
    const item = req.body || {};
    const lista = await readJson(REGISTROS_FILE, []);
    item.id = `reg-${Date.now()}`;
    item.fecha = nowStamp();
    item.leido = false;
    lista.unshift(item);
    await writeJson(REGISTROS_FILE, lista);
    res.status(201).json({ ok: true, id: item.id });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

app.delete('/api/registro', requireAuth, async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Falta el parámetro id' });
  try {
    const lista = await readJson(REGISTROS_FILE, []);
    const nueva = lista.filter((x) => x.id !== id);
    await writeJson(REGISTROS_FILE, nueva);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// Mensajes
app.get('/api/mensajes', requireAuth, async (req, res) => {
  const data = await readJson(MENSAJES_FILE, []);
  res.json(data);
});

app.post('/api/mensajes', requireAuth, async (req, res) => {
  const lista = req.body;
  if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba una lista JSON' });
  await writeJson(MENSAJES_FILE, lista);
  res.json({ ok: true });
});

app.post('/api/mensaje', async (req, res) => {
  try {
    const item = req.body || {};
    const lista = await readJson(MENSAJES_FILE, []);
    item.id = `msg-${Date.now()}`;
    item.fecha = nowStamp();
    item.leido = false;
    lista.unshift(item);
    await writeJson(MENSAJES_FILE, lista);
    res.status(201).json({ ok: true, id: item.id });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

app.delete('/api/mensaje', requireAuth, async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Falta el parámetro id' });
  try {
    const lista = await readJson(MENSAJES_FILE, []);
    const nueva = lista.filter((x) => x.id !== id);
    await writeJson(MENSAJES_FILE, nueva);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// Redirects
app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/admin/index.html');
});

// Static files with minimal no-cache for html/css/js
app.use(express.static(BASE_DIR, {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (/[\\/](?:.+\.)?(html|css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.listen(PORT, async () => {
  // Pre-create files
  await ensureFile(DATA_FILE, {});
  await ensureFile(REGISTROS_FILE, []);
  await ensureFile(MENSAJES_FILE, []);
  console.log(`\n  EDUCIENCIA corriendo en: http://localhost:${PORT}`);
  console.log(`  Panel de administracion: http://localhost:${PORT}/admin/`);
  console.log('  Presiona Ctrl+C para detener.');
});
