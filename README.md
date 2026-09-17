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
- Datos: `data/data.json`, `data/registros.json`, `data/mensajes.json`, `data/vive.json`
- Imágenes subidas desde el panel: `uploads/vive/` (se sirven en `/uploads/vive/...`)

## Endpoints
- GET/POST `/api/data` y `/api/data.php` → lee/guarda `data/data.json`
- GET/POST `/api/registros` → lista completa (para marcar leído)
- GET/POST `/api/mensajes`  → lista completa (para marcar leído)
- POST `/api/registro`      → agrega registro (autogenera `id`, `fecha`, `leido:false`)
- POST `/api/mensaje`       → agrega mensaje (autogenera `id`, `fecha`, `leido:false`)
- DELETE `/api/registro?id=...` y `/api/mensaje?id=...` → elimina por id

### Vive EDUCIENCIA (`/contacto.html`)
- GET `/api/vive` → público: solo fotografías y videos **publicados**
- GET `/api/vive/admin` → estado completo, incluidos los ocultos (requiere sesión)
- POST `/api/vive/upload` → sube una imagen a `uploads/vive/` (requiere sesión)
- POST `/api/vive/fotos` → alta o edición de una fotografía
- DELETE `/api/vive/fotos?id=...`
- POST `/api/vive/videos` → alta o edición de un video
- DELETE `/api/vive/videos?id=...`
- POST `/api/vive/destacado` → marca (o desmarca) el video destacado
- POST `/api/vive/orden` → reordena `fotos` o `videos`
- POST `/api/vive/validar-video` → valida una URL o código de inserción

## Vive EDUCIENCIA

La página `/contacto.html` se presenta como **Vive EDUCIENCIA** (la ruta se conserva para no
romper enlaces). Su contenido se administra en el panel, apartado «Vive EDUCIENCIA».

**Fotografías.** Se suben desde el panel (selector o arrastrar y soltar). El navegador las
reduce a 1920 px de lado mayor y genera una vista previa de 640 px; ambas se guardan
optimizadas en JPEG. El servidor comprueba el tipo real por firma de bytes (JPG, PNG, WebP,
GIF), limita cada archivo a 6 MB y genera un nombre único, de modo que nunca sobrescribe otro.
Los metadatos (título, descripción, texto alternativo, fecha, encuadre y estado de
publicación) viven en `data/vive.json`; los archivos, en `uploads/vive/`. Al eliminar un
registro o reemplazar una imagen, el archivo solo se borra si ningún otro registro lo usa.

**Videos.** Se agregan pegando la URL o el código de inserción. Solo se admiten **YouTube**
(incluidos Shorts) y **Vimeo**: el servidor extrae el identificador, lo valida contra una lista
explícita de dominios y reconstruye el `iframe` con atributos propios. Nunca se almacena ni se
ejecuta HTML pegado. Se puede marcar un único video destacado.

**Persistencia.** `data/vive.json` es independiente de `data/data.json`, así que el panel no
puede sobrescribir una sección con la otra. En Hostinger el sistema de archivos es persistente,
por lo que `uploads/vive/` sobrevive a los reinicios de la aplicación; conviene incluir esa
carpeta en las copias de seguridad.

## Despliegue en Hostinger (Node.js)
1. Sube todos los archivos del proyecto.
2. En Hostinger, crea aplicación Node.js apuntando a la carpeta del proyecto.
3. Define `Archivo de inicio`: `server.js` (o deja `package.json` con `npm start`).
4. Asegura versión de Node 18+.
5. Ejecuta "Instalar dependencias" (npm install) y luego "Iniciar".
6. Asegura que la carpeta `uploads/` tenga permisos de escritura: ahí se guardan las
   fotografías subidas desde el panel (se crea sola al arrancar si no existe).

No se requiere PHP: la ruta `/api/data.php` es servida por Express para compatibilidad con el frontend.

> Nota: `server.py` es un servidor alternativo heredado y **no** implementa las APIs de
> Vive EDUCIENCIA. Usa `server.js` (es lo que arranca `INICIAR SERVIDOR.bat` y `npm start`).
