# EDUCIENCIA (Node.js)

Proyecto estático con panel de administración y APIs de persistencia en archivos JSON.

## Ejecutar en local (Windows)

1. Doble clic en `INICIAR SERVIDOR.bat`
2. Abre http://localhost:8080 y el panel en http://localhost:8080/admin/

Alternativa (multiplataforma):

```bash
npm install
npm start
```

## Estructura
- Archivos estáticos: raíz del proyecto (HTML/CSS/JS/img)
- APIs: `server.js` (Express)
- Datos: `data/data.json`, `data/registros.json`, `data/mensajes.json`

## Endpoints
- GET/POST `/api/data` y `/api/data.php` → lee/guarda `data/data.json`
- GET/POST `/api/registros` → lista completa (para marcar leído)
- GET/POST `/api/mensajes`  → lista completa (para marcar leído)
- POST `/api/registro`      → agrega registro (autogenera `id`, `fecha`, `leido:false`)
- POST `/api/mensaje`       → agrega mensaje (autogenera `id`, `fecha`, `leido:false`)
- DELETE `/api/registro?id=...` y `/api/mensaje?id=...` → elimina por id

## Despliegue en Hostinger (Node.js)
1. Sube todos los archivos del proyecto.
2. En Hostinger, crea aplicación Node.js apuntando a la carpeta del proyecto.
3. Define `Archivo de inicio`: `server.js` (o deja `package.json` con `npm start`).
4. Asegura versión de Node 18+.
5. Ejecuta "Instalar dependencias" (npm install) y luego "Iniciar".

No se requiere PHP: la ruta `/api/data.php` es servida por Express para compatibilidad con el frontend.
