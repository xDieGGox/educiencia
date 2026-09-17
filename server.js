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

      Vive EDUCIENCIA (galería pública + administración):
      GET  /api/vive                      → fotos y videos PUBLICADOS
      GET  /api/vive/admin                → estado completo (requiere sesión)
      POST /api/vive/upload               → sube una imagen a uploads/vive/
      POST /api/vive/fotos                → alta/edición de una fotografía
      DELETE /api/vive/fotos?id=...       → elimina una fotografía
      POST /api/vive/videos               → alta/edición de un video
      DELETE /api/vive/videos?id=...      → elimina un video
      POST /api/vive/destacado            → marca el video destacado
      POST /api/vive/orden                → reordena fotos o videos
      POST /api/vive/validar-video        → valida una URL / código de inserción
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
const VIVE_FILE = path.join(DATA_DIR, 'vive.json');
// Archivos subidos desde el panel (persisten junto al proyecto, no en /tmp)
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads', 'vive');

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

// Ensure data + uploads directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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
// La subida de imágenes necesita un cuerpo mayor que el resto de las APIs.
const jsonNormal = express.json({ limit: '4mb' });
const jsonSubida = express.json({ limit: '16mb' });
app.use((req, res, next) =>
  req.path === '/api/vive/upload' ? jsonSubida(req, res, next) : jsonNormal(req, res, next)
);
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

/* ═══════════════════════════════════════════════════════════════════════
   VIVE EDUCIENCIA — Galería de fotografías y videos
   Persistencia: data/vive.json (metadatos) + uploads/vive/ (archivos).
   Toda escritura exige la sesión del panel de administración.
═══════════════════════════════════════════════════════════════════════ */

const VIVE_DEFAULT = { fotos: [], videos: [] };

// Formatos admitidos. El tipo real se comprueba por la firma de bytes,
// no por la extensión ni por el encabezado declarado por el cliente.
const IMG_TYPES = [
  { ext: 'jpg',  test: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
  { ext: 'png',  test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 },
  { ext: 'webp', test: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { ext: 'gif',  test: (b) => b.toString('ascii', 0, 3) === 'GIF' }
];

const MAX_IMG_BYTES = 6 * 1024 * 1024; // 6 MB por archivo ya optimizado

function sniffImage(buf) {
  return IMG_TYPES.find((t) => t.test(buf)) || null;
}

// Dimensiones reales leídas del archivo (PNG y JPEG, que es lo que genera el
// optimizador del panel). Devuelve null si el formato no se puede interpretar.
function imageSize(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { ancho: buf.readUInt32BE(16), alto: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xFF) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      const isSOF = marker >= 0xC0 && marker <= 0xCF &&
                    marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
      if (isSOF) return { alto: buf.readUInt16BE(i + 5), ancho: buf.readUInt16BE(i + 7) };
      if (len < 2) break;
      i += 2 + len;
    }
  }
  return null;
}

// Nombre de archivo seguro y único: nunca sobrescribe uno existente.
function safeFileName(original, ext) {
  const base = String(original || 'foto')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'foto';
  let name;
  do {
    name = `${base}-${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}.${ext}`;
  } while (fs.existsSync(path.join(UPLOADS_DIR, name)));
  return name;
}

// Decodifica, valida y escribe una imagen recibida como data URL.
async function guardarImagenBase64(dataUrl, nombreOriginal) {
  if (typeof dataUrl !== 'string') throw new Error('Imagen ausente.');
  const m = dataUrl.match(/^data:[a-z0-9/+.-]+;base64,([\s\S]+)$/i);
  if (!m) throw new Error('Formato de imagen no reconocido.');
  const buf = Buffer.from(m[1], 'base64');
  if (!buf.length) throw new Error('La imagen está vacía o no se pudo decodificar.');
  if (buf.length > MAX_IMG_BYTES) {
    throw new Error(`La imagen supera el límite de ${Math.round(MAX_IMG_BYTES / 1048576)} MB.`);
  }
  const tipo = sniffImage(buf);
  if (!tipo) throw new Error('Solo se admiten imágenes JPG, PNG, WebP o GIF.');
  const name = safeFileName(nombreOriginal, tipo.ext);
  await fsp.writeFile(path.join(UPLOADS_DIR, name), buf, { flag: 'wx' });
  return { archivo: name, bytes: buf.length, dim: imageSize(buf) };
}

/* ─── Proveedores de video admitidos (lista explícita) ─────────────────── */
const YT_HOSTS = ['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'youtu.be'];
const VIMEO_HOSTS = ['vimeo.com', 'player.vimeo.com'];

// Acepta una URL o un código <iframe>. Del código solo se extrae el src:
// nunca se almacena ni se ejecuta HTML arbitrario. El iframe público se
// construye después con atributos controlados por la aplicación.
function parseVideo(entrada) {
  let raw = String(entrada || '').trim();
  if (!raw) return { error: 'Pega la URL del video o su código de inserción.' };

  if (/<\s*iframe/i.test(raw)) {
    const src = raw.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!src) return { error: 'El código de inserción no contiene un atributo src válido.' };
    raw = src[1].trim();
  }
  if (raw.startsWith('//')) raw = 'https:' + raw;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

  let u;
  try { u = new URL(raw); } catch { return { error: 'La dirección del video no es válida.' }; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { error: 'Solo se admiten direcciones http(s).' };
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const parts = u.pathname.split('/').filter(Boolean);

  if (YT_HOSTS.includes(host)) {
    let id = '';
    if (host === 'youtu.be') id = parts[0] || '';
    else if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'v') id = parts[1] || '';
    else id = u.searchParams.get('v') || '';
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { error: 'No se pudo identificar el video de YouTube en esa dirección.' };
    }
    return {
      proveedor: 'youtube',
      video_id: id,
      embed_url: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
      url_original: `https://www.youtube.com/watch?v=${id}`,
      portada_auto: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }

  if (VIMEO_HOSTS.includes(host)) {
    let id = '';
    if (host === 'player.vimeo.com') { if (parts[0] === 'video') id = parts[1] || ''; }
    else id = parts.filter((p) => /^\d+$/.test(p)).pop() || '';
    if (!/^\d{6,12}$/.test(id)) {
      return { error: 'No se pudo identificar el video de Vimeo en esa dirección.' };
    }
    return {
      proveedor: 'vimeo',
      video_id: id,
      embed_url: `https://player.vimeo.com/video/${id}`,
      url_original: `https://vimeo.com/${id}`,
      portada_auto: ''
    };
  }

  return { error: 'Proveedor no admitido. Por ahora se aceptan YouTube y Vimeo.' };
}

// Portada automática de Vimeo mediante su oEmbed público (sin clave).
// Si no hay salida a internet o el video es privado devuelve '' y la página
// usa la portada alternativa del diseño.
async function vimeoPortada(id) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return '';
    const j = await r.json();
    const url = String(j.thumbnail_url || '');
    return /^https:\/\/[a-z0-9.-]*vimeocdn\.com\//i.test(url) ? url : '';
  } catch {
    return '';
  }
}

/* ─── Helpers de estado ────────────────────────────────────────────────── */
async function readVive() {
  const v = await readJson(VIVE_FILE, VIVE_DEFAULT);
  return {
    fotos: Array.isArray(v.fotos) ? v.fotos : [],
    videos: Array.isArray(v.videos) ? v.videos : []
  };
}

const txt = (s, max = 400) => String(s == null ? '' : s).trim().slice(0, max);

// Cuántos registros siguen usando un archivo subido.
function refCount(vive, archivo) {
  if (!archivo) return 0;
  let n = 0;
  vive.fotos.forEach((f) => { if (f.archivo === archivo) n++; if (f.thumb === archivo) n++; });
  vive.videos.forEach((v) => { if (v.miniatura === archivo) n++; });
  return n;
}

// Borra un archivo solo si ningún registro lo referencia ya.
async function borrarArchivoSiHuerfano(vive, archivo) {
  if (!archivo || refCount(vive, archivo) > 0) return false;
  try {
    await fsp.unlink(path.join(UPLOADS_DIR, archivo));
    return true;
  } catch {
    return false;
  }
}

const urlDe = (archivo) => (archivo ? `/uploads/vive/${archivo}` : '');

function fotoPublica(f) {
  return {
    id: f.id,
    titulo: f.titulo || '',
    descripcion: f.descripcion || '',
    alt: f.alt || f.titulo || '',
    fecha: f.fecha || '',
    url: urlDe(f.archivo),
    thumb_url: urlDe(f.thumb || f.archivo),
    ancho: f.ancho || 0,
    alto: f.alto || 0,
    encuadre: f.encuadre || 'center center'
  };
}

function videoPublico(v) {
  return {
    id: v.id,
    titulo: v.titulo || '',
    descripcion: v.descripcion || '',
    fecha: v.fecha || '',
    proveedor: v.proveedor,
    embed_url: v.embed_url,
    url_original: v.url_original,
    portada: urlDe(v.miniatura) || v.portada_auto || '',
    orientacion: v.orientacion === 'vertical' ? 'vertical' : 'horizontal'
  };
}

/* ─── Lectura pública: únicamente contenido publicado ──────────────────── */
app.get('/api/vive', async (req, res) => {
  try {
    const vive = await readVive();
    const fotos = vive.fotos.filter((f) => f.publicada !== false && f.archivo).map(fotoPublica);
    const publicados = vive.videos.filter((v) => v.publicado !== false && v.embed_url);
    const destacado = publicados.find((v) => v.destacado) || null;
    res.json({
      fotos,
      destacado: destacado ? videoPublico(destacado) : null,
      videos: publicados.filter((v) => !v.destacado).map(videoPublico)
    });
  } catch {
    res.status(500).json({ error: 'No se pudo leer la galería.' });
  }
});

/* ─── Lectura de administración: incluye los elementos ocultos ─────────── */
app.get('/api/vive/admin', requireAuth, async (req, res) => {
  const vive = await readVive();
  res.json({
    fotos: vive.fotos.map((f) => ({ ...f, url: urlDe(f.archivo), thumb_url: urlDe(f.thumb || f.archivo) })),
    videos: vive.videos.map((v) => ({ ...v, miniatura_url: urlDe(v.miniatura) })),
    limite_mb: Math.round(MAX_IMG_BYTES / 1048576)
  });
});

/* ─── Subida de imágenes (fotografías y miniaturas de video) ───────────── */
app.post('/api/vive/upload', requireAuth, async (req, res) => {
  const { full, thumb, nombre } = req.body || {};
  let guardadaFull = null;
  try {
    guardadaFull = await guardarImagenBase64(full, nombre);
    let guardadaThumb = null;
    if (thumb) {
      try {
        guardadaThumb = await guardarImagenBase64(thumb, (nombre || 'foto') + '-mini');
      } catch {
        guardadaThumb = null; // la vista previa es opcional: se usa la imagen completa
      }
    }
    const dim = guardadaFull.dim || {};
    res.json({
      ok: true,
      archivo: guardadaFull.archivo,
      thumb: guardadaThumb ? guardadaThumb.archivo : guardadaFull.archivo,
      url: urlDe(guardadaFull.archivo),
      thumb_url: urlDe(guardadaThumb ? guardadaThumb.archivo : guardadaFull.archivo),
      ancho: dim.ancho || 0,
      alto: dim.alto || 0,
      bytes: guardadaFull.bytes
    });
  } catch (e) {
    if (guardadaFull) {
      try { await fsp.unlink(path.join(UPLOADS_DIR, guardadaFull.archivo)); } catch { /* ignorar */ }
    }
    res.status(400).json({ error: e.message || 'No se pudo procesar la imagen.' });
  }
});

/* ─── Alta y edición de fotografías ────────────────────────────────────── */
app.post('/api/vive/fotos', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const vive = await readVive();
    const idx = b.id ? vive.fotos.findIndex((f) => f.id === b.id) : -1;
    const previa = idx >= 0 ? vive.fotos[idx] : null;

    const archivo = txt(b.archivo, 200) || (previa && previa.archivo) || '';
    if (!archivo) return res.status(400).json({ error: 'Falta la imagen de la fotografía.' });
    if (!fs.existsSync(path.join(UPLOADS_DIR, path.basename(archivo)))) {
      return res.status(400).json({ error: 'El archivo indicado no existe en el servidor.' });
    }

    const foto = {
      id: previa ? previa.id : `foto-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`,
      titulo: txt(b.titulo, 140),
      descripcion: txt(b.descripcion, 600),
      alt: txt(b.alt, 200),
      fecha: txt(b.fecha, 40),
      archivo: path.basename(archivo),
      thumb: path.basename(txt(b.thumb, 200) || (previa && previa.thumb) || archivo),
      ancho: Number(b.ancho) > 0 ? Math.round(Number(b.ancho)) : (previa && previa.ancho) || 0,
      alto: Number(b.alto) > 0 ? Math.round(Number(b.alto)) : (previa && previa.alto) || 0,
      encuadre: /^(left|center|right) (top|center|bottom)$/.test(String(b.encuadre || ''))
        ? b.encuadre
        : (previa && previa.encuadre) || 'center center',
      publicada: b.publicada !== false,
      creado: previa ? previa.creado : nowStamp()
    };

    const huerfanos = [];
    if (previa) {
      if (previa.archivo !== foto.archivo) huerfanos.push(previa.archivo);
      if (previa.thumb && previa.thumb !== foto.thumb && previa.thumb !== previa.archivo) huerfanos.push(previa.thumb);
      vive.fotos[idx] = foto;
    } else {
      vive.fotos.push(foto);
    }
    await writeJson(VIVE_FILE, vive);
    // Al reemplazar la imagen, los archivos anteriores se borran solo si
    // ningún otro registro los sigue usando.
    for (const a of huerfanos) await borrarArchivoSiHuerfano(vive, a);
    res.json({ ok: true, foto });
  } catch {
    res.status(500).json({ error: 'No se pudo guardar la fotografía.' });
  }
});

app.delete('/api/vive/fotos', requireAuth, async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Falta el parámetro id' });
  const vive = await readVive();
  const foto = vive.fotos.find((f) => f.id === id);
  if (!foto) return res.status(404).json({ error: 'La fotografía ya no existe.' });
  vive.fotos = vive.fotos.filter((f) => f.id !== id);
  await writeJson(VIVE_FILE, vive);
  await borrarArchivoSiHuerfano(vive, foto.archivo);
  if (foto.thumb && foto.thumb !== foto.archivo) await borrarArchivoSiHuerfano(vive, foto.thumb);
  res.json({ ok: true });
});

/* ─── Alta y edición de videos ─────────────────────────────────────────── */
app.post('/api/vive/videos', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const vive = await readVive();
    const idx = b.id ? vive.videos.findIndex((v) => v.id === b.id) : -1;
    const previa = idx >= 0 ? vive.videos[idx] : null;

    let fuente;
    const entrada = txt(b.fuente, 4000);
    if (entrada) {
      fuente = parseVideo(entrada);
      if (fuente.error) return res.status(400).json({ error: fuente.error });
    } else if (previa) {
      fuente = {
        proveedor: previa.proveedor, video_id: previa.video_id,
        embed_url: previa.embed_url, url_original: previa.url_original,
        portada_auto: previa.portada_auto || ''
      };
    } else {
      return res.status(400).json({ error: 'Pega la URL del video o su código de inserción.' });
    }

    if (fuente.proveedor === 'vimeo' && !fuente.portada_auto) {
      fuente.portada_auto = await vimeoPortada(fuente.video_id);
    }

    const miniatura = path.basename(txt(b.miniatura, 200) || '');
    if (miniatura && !fs.existsSync(path.join(UPLOADS_DIR, miniatura))) {
      return res.status(400).json({ error: 'La miniatura indicada no existe en el servidor.' });
    }

    const video = {
      id: previa ? previa.id : `video-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`,
      titulo: txt(b.titulo, 140),
      descripcion: txt(b.descripcion, 600),
      fecha: txt(b.fecha, 40),
      proveedor: fuente.proveedor,
      video_id: fuente.video_id,
      embed_url: fuente.embed_url,
      url_original: fuente.url_original,
      portada_auto: fuente.portada_auto || '',
      miniatura,
      orientacion: b.orientacion === 'vertical' ? 'vertical' : 'horizontal',
      publicado: b.publicado !== false,
      // Un video oculto no puede seguir siendo el destacado público
      destacado: previa ? !!previa.destacado && b.publicado !== false : false,
      creado: previa ? previa.creado : nowStamp()
    };

    const huerfana = previa && previa.miniatura && previa.miniatura !== miniatura ? previa.miniatura : null;
    if (previa) vive.videos[idx] = video; else vive.videos.push(video);
    await writeJson(VIVE_FILE, vive);
    if (huerfana) await borrarArchivoSiHuerfano(vive, huerfana);
    res.json({ ok: true, video });
  } catch {
    res.status(500).json({ error: 'No se pudo guardar el video.' });
  }
});

app.delete('/api/vive/videos', requireAuth, async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Falta el parámetro id' });
  const vive = await readVive();
  const video = vive.videos.find((v) => v.id === id);
  if (!video) return res.status(404).json({ error: 'El video ya no existe.' });
  vive.videos = vive.videos.filter((v) => v.id !== id);
  await writeJson(VIVE_FILE, vive);
  await borrarArchivoSiHuerfano(vive, video.miniatura);
  res.json({ ok: true });
});

/* ─── Video destacado (uno solo, o ninguno) ────────────────────────────── */
app.post('/api/vive/destacado', requireAuth, async (req, res) => {
  const id = (req.body || {}).id || null;
  const vive = await readVive();
  if (id && !vive.videos.some((v) => v.id === id)) {
    return res.status(404).json({ error: 'El video indicado no existe.' });
  }
  vive.videos.forEach((v) => { v.destacado = !!id && v.id === id && v.publicado !== false; });
  await writeJson(VIVE_FILE, vive);
  res.json({ ok: true, destacado: id });
});

/* ─── Reordenamiento ───────────────────────────────────────────────────── */
app.post('/api/vive/orden', requireAuth, async (req, res) => {
  const { tipo, ids } = req.body || {};
  if (tipo !== 'fotos' && tipo !== 'videos') return res.status(400).json({ error: 'Tipo inválido.' });
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Se esperaba una lista de ids.' });
  const vive = await readVive();
  const porId = new Map(vive[tipo].map((x) => [x.id, x]));
  const ordenados = ids.map((id) => porId.get(id)).filter(Boolean);
  // Lo que no venga en la lista conserva su contenido al final
  vive[tipo].forEach((x) => { if (!ids.includes(x.id)) ordenados.push(x); });
  vive[tipo] = ordenados;
  await writeJson(VIVE_FILE, vive);
  res.json({ ok: true });
});

/* ─── Validación previa de un video (vista previa del panel) ───────────── */
app.post('/api/vive/validar-video', requireAuth, async (req, res) => {
  const r = parseVideo((req.body || {}).fuente);
  if (r.error) return res.status(400).json({ error: r.error });
  if (r.proveedor === 'vimeo' && !r.portada_auto) r.portada_auto = await vimeoPortada(r.video_id);
  res.json({ ok: true, ...r });
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
  await ensureFile(VIVE_FILE, VIVE_DEFAULT);
  console.log(`\n  EDUCIENCIA corriendo en: http://localhost:${PORT}`);
  console.log(`  Panel de administracion: http://localhost:${PORT}/admin/`);
  console.log('  Presiona Ctrl+C para detener.');
});
