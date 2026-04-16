/**
 * app.js — Utilidades compartidas de EDUCIENCIA
 * Carga datos, renderiza header/footer, helpers de chips y filtros.
 */

/* ─── Mapa de áreas ─────────────────────────────────────────────────── */
const AREAS = {
  biologia:    { label: 'Biología',    cls: 'bio',  icon: '🌿', btnCls: 'btn--bio' },
  quimica:     { label: 'Química',     cls: 'qui',  icon: '⚗️', btnCls: 'btn--qui' },
  matematicas: { label: 'Matemáticas', cls: 'mat',  icon: '📐', btnCls: 'btn--mat' },
  fisica:      { label: 'Física',      cls: 'fis',  icon: '⚡', btnCls: 'btn--fis' }
};

const ESTADOS = {
  proxima:    { label: 'Próxima',    cls: 'proxima' },
  disponible: { label: 'Disponible', cls: 'disponible' },
  finalizada: { label: 'Finalizada', cls: 'finalizada' }
};

/* ─── Carga de datos ─────────────────────────────────────────────────── */
async function loadData() {
  const res = await fetch('/api/data.php');
  if (!res.ok) throw new Error('No se pudo cargar la información del sitio.');
  return res.json();
}

/* ─── Header ─────────────────────────────────────────────────────────── */
function renderHeader(config, currentPage) {
  const pages = [
    { id: 'inicio',    label: 'Inicio',    href: '/' },
    { id: 'agenda',    label: 'Agenda',    href: '/agenda.html' },
    { id: 'recursos',  label: 'Recursos',  href: '/recursos.html' },
    { id: 'equipo',    label: 'Equipo',    href: '/equipo.html' },
    { id: 'contacto',  label: 'Contacto',  href: '/contacto.html' }
  ];

  const links = pages.map(p =>
    `<a href="${p.href}"${p.id === currentPage ? ' class="active"' : ''}>${p.label}</a>`
  ).join('');

  return `
<header class="site-header" role="banner">
  <div class="header-inner">
    <a href="/" class="header-logo" aria-label="${config.nombre_proyecto} – Inicio">
      <img src="/img/logo-educiencia.png" alt="${config.nombre_proyecto}" />
    </a>
    <nav class="header-nav" id="main-nav" role="navigation" aria-label="Navegación principal">
      ${links}
    </nav>
    <button class="nav-toggle" id="nav-toggle"
            aria-label="Abrir menú de navegación"
            aria-expanded="false" aria-controls="main-nav">☰</button>
  </div>
</header>`;
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function renderFooter(config) {
  return `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">

      <!-- Marca -->
      <div class="footer-brand">
        <a href="/" class="footer-logo-link" aria-label="${config.nombre_proyecto} – Inicio">
          <img src="https://i.postimg.cc/yxhChvDW/Logo-educiencia-BN-Mesa-de-trabajo-1-(1).png"
               alt="Logo EDUCIENCIA" class="footer-logo-img" />
        </a>
        <p class="footer-brand-desc">Proyecto de vinculación con la comunidad de la Carrera de Ciencias Experimentales.</p>
      </div>

      <!-- Institución -->
      <div>
        <p class="footer-col-title">Institución</p>
        <ul class="footer-links">
          <li>${config.institucion_nombre}</li>
          <li>${config.institucion_universidad}</li>
          <li>${config.departamento}</li>
        </ul>
      </div>

      <!-- Redes sociales -->
      <div>
        <p class="footer-col-title">Síguenos</p>
        <div class="footer-social-links">
          <a href="https://www.instagram.com/educienciaunae?igsh=emo2OGVhOW5oOXBo"
             target="_blank" rel="noopener noreferrer"
             class="footer-social-link" aria-label="Instagram de EDUCIENCIA">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
            <span class="footer-social-handle">@educienciaunae</span>
          </a>
        </div>
      </div>

    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} ${config.nombre_proyecto} — Proyecto de vinculación con la comunidad.</p>
      <p>Carrera de Ciencias Experimentales · ${config.institucion_universidad}</p>
    </div>
  </div>
</footer>`;
}

/* ─── Chips helpers ──────────────────────────────────────────────────── */
function chipArea(area) {
  const a = AREAS[area];
  if (!a) return '';
  return `<span class="chip chip--${a.cls}">${a.label}</span>`;
}

function chipEstado(estado) {
  const e = ESTADOS[estado] || { label: estado, cls: 'nivel' };
  return `<span class="chip chip--${e.cls}">${e.label}</span>`;
}

function chipNivel(nivel) {
  return nivel ? `<span class="chip chip--nivel">${nivel}</span>` : '';
}

/* ─── Render de tarjeta de clase ─────────────────────────────────────── */
function renderClaseCard(clase) {
  const area = AREAS[clase.area] || { cls: '', label: clase.area, btnCls: 'btn--primary' };
  const esVirtual = clase.modalidad && clase.modalidad.toLowerCase().includes('virtual');
  const esPresencial = clase.modalidad && clase.modalidad.toLowerCase().includes('presencial');
  const isFinalizada = clase.estado === 'finalizada';

  let acciones = '';
  if (isFinalizada) {
    acciones = clase.enlace_materiales
      ? `<a href="${clase.enlace_materiales}" class="btn btn--outline btn--sm">Ver materiales de la sesión</a>`
      : `<span class="chip chip--finalizada">Sesión finalizada</span>`;
  } else {
    if (esPresencial) {
      acciones = `<span class="chip chip--disponible" style="align-self:center;">Presencial – Acceso libre</span>`;
      if (clase.enlace_materiales)
        acciones += `<a href="${clase.enlace_materiales}" class="btn btn--outline btn--sm">Ver materiales</a>`;
    } else {
      if (clase.enlace_clase)
        acciones += `<a href="${clase.enlace_clase}" class="btn btn--primary btn--sm">Acceder a la clase</a>`;
      if (clase.enlace_materiales)
        acciones += `<a href="${clase.enlace_materiales}" class="btn btn--outline btn--sm">Ver materiales</a>`;
    }
  }

  const modalidadIcon = esPresencial ? '🏫' : esVirtual ? '💻' : '📍';

  return `
<article class="card card--clase card--${area.cls}"
         data-area="${clase.area}" data-estado="${clase.estado}"
         ${isFinalizada ? 'style="opacity:0.65;"' : ''}>
  <div class="clase-body">
    <div class="clase-meta">
      ${chipArea(clase.area)}
      ${chipEstado(clase.estado)}
      ${chipNivel(clase.nivel)}
    </div>
    <h3 class="clase-titulo">${clase.titulo}</h3>
    <p class="clase-info">
      📅 ${clase.fecha} &nbsp;|&nbsp; 🕓 ${clase.horario} &nbsp;|&nbsp;
      ${modalidadIcon} ${clase.modalidad}${clase.tutor ? ` &nbsp;|&nbsp; 🧑 Tutor: ${clase.tutor}` : ''}
    </p>
    ${clase.descripcion ? `<p style="font-size:0.875rem;color:var(--color-text-muted);margin-bottom:14px;">${clase.descripcion}</p>` : ''}
    <div class="clase-acciones">${acciones}</div>
  </div>
</article>`;
}

/* ─── Render de tarjeta de recurso ───────────────────────────────────── */
function renderRecursoCard(rec) {
  return `
<article class="card card--recurso" data-area="${rec.area}">
  <div class="recurso-icon" aria-hidden="true">${rec.icono || '📄'}</div>
  ${chipArea(rec.area)}
  <div class="recurso-meta">
    <span class="chip chip--tipo">${rec.tipo}</span>
    ${chipNivel(rec.nivel)}
  </div>
  <h3 class="recurso-titulo">${rec.titulo}</h3>
  <p class="recurso-desc">${rec.descripcion}</p>
  <p style="font-size:0.8rem;color:var(--color-text-muted);margin-bottom:14px;">
    Por ${rec.autor} · ${rec.fecha}
  </p>
  ${rec.enlace
    ? `<a href="${rec.enlace}" class="btn btn--primary btn--sm">${rec.accion_label || '⬇ Descargar'}</a>`
    : `<span class="chip chip--nivel">Próximamente</span>`
  }
</article>`;
}

/* ─── Filtro genérico ────────────────────────────────────────────────── */
function initFiltros(containerId, filterBtns, attr = 'area', todosValue = 'todos') {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');

      const val = this.dataset.filter;
      const container = document.getElementById(containerId);
      if (!container) return;

      let visible = 0;
      container.querySelectorAll('[data-area]').forEach(item => {
        const match = val === todosValue || item.dataset[attr] === val;
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Mensaje de estado vacío
      let empty = container.querySelector('.empty-state');
      if (visible === 0) {
        if (!empty) {
          empty = document.createElement('p');
          empty.className = 'empty-state';
          empty.textContent = 'No hay elementos para esta área.';
          container.appendChild(empty);
        }
        empty.style.display = '';
      } else if (empty) {
        empty.style.display = 'none';
      }
    });
  });
}

/* ─── Menú hamburguesa ───────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
    this.textContent = open ? '✕' : '☰';
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });
}

/* ─── Acordeón FAQ ───────────────────────────────────────────────────── */
function initFaq(container) {
  (container || document).querySelectorAll('.faq-pregunta').forEach(btn => {
    btn.addEventListener('click', function () {
      const resp  = this.nextElementSibling;
      const open  = resp.classList.toggle('open');
      this.setAttribute('aria-expanded', open);
      this.querySelector('.faq-icon').textContent = open ? '✕' : '+';
    });
  });
}

/* ─── Nav activa en scroll (solo home) ───────────────────────────────── */
function initScrollNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.header-nav a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= 100) current = sec.getAttribute('id');
    });
    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  }, { passive: true });
}

/* ─── Montaje de header + footer ─────────────────────────────────────── */
async function initPage(currentPage) {
  try {
    const data = await loadData();
    const hMount = document.getElementById('header-mount');
    const fMount = document.getElementById('footer-mount');
    if (hMount) hMount.innerHTML = renderHeader(data.config, currentPage);
    if (fMount) fMount.innerHTML = renderFooter(data.config);
    initMobileMenu();
    return data;
  } catch (err) {
    console.error('Error al cargar datos:', err);
    throw err;
  }
}
