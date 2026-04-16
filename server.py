#!/usr/bin/env python3
"""
Servidor EDUCIENCIA
-------------------
Sirve la página web y expone la API para el panel de administración.

Endpoints:
  GET  /api/data          → devuelve data/data.json
  POST /api/data          → guarda data/data.json (panel admin)
  GET  /api/registros     → devuelve data/registros.json
  POST /api/registro      → agrega un registro de estudiante
  GET  /api/mensajes      → devuelve data/mensajes.json
  POST /api/mensaje       → agrega un mensaje del formulario de contacto
  DELETE /api/registro?id → elimina un registro por id
  DELETE /api/mensaje?id  → elimina un mensaje por id

Uso:
    python server.py

Luego abre: http://localhost:8080
Panel admin: http://localhost:8080/admin/
"""

import http.server
import json
import mimetypes
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Windows no siempre tiene estos tipos en el registro del sistema.
mimetypes.add_type("image/svg+xml",          ".svg")
mimetypes.add_type("text/css",               ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json",       ".json")

PORT     = 8080
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / "data"
DATA_FILE       = DATA_DIR / "data.json"
REGISTROS_FILE  = DATA_DIR / "registros.json"
MENSAJES_FILE   = DATA_DIR / "mensajes.json"


def _ensure_file(path: Path, default):
    """Crea el archivo con el valor por defecto si no existe."""
    if not path.exists():
        path.write_text(json.dumps(default, ensure_ascii=False, indent=2), encoding="utf-8")


def _read_json(path: Path, default):
    _ensure_file(path, default)
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _write_json(path: Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


class EducienciaHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    # ── GET ─────────────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path.rstrip("/") or "/"

        if path in ("/api/data", "/api/data.php"):
            self._serve_file(DATA_FILE)
        elif path == "/api/registros":
            self._serve_file(REGISTROS_FILE, default=[])
        elif path == "/api/mensajes":
            self._serve_file(MENSAJES_FILE, default=[])
        elif path in ("/admin", "/admin/"):
            self._redirect("/admin/index.html")
        else:
            super().do_GET()

    # ── POST ────────────────────────────────────────────────────────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path in ("/api/data", "/api/data.php"):
            self._save_data()
        elif path == "/api/registro":
            self._append_item(REGISTROS_FILE, "reg")
        elif path == "/api/mensaje":
            self._append_item(MENSAJES_FILE, "msg")
        elif path == "/api/registros":
            self._save_list(REGISTROS_FILE)    # reemplaza lista completa (marcar leído)
        elif path == "/api/mensajes":
            self._save_list(MENSAJES_FILE)     # reemplaza lista completa (marcar leído)
        else:
            self.send_error(404, "Endpoint no encontrado")

    # ── DELETE ──────────────────────────────────────────────────────────────
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        params = parse_qs(parsed.query)
        item_id = (params.get("id") or [None])[0]

        if path == "/api/registro":
            self._delete_item(REGISTROS_FILE, item_id)
        elif path == "/api/mensaje":
            self._delete_item(MENSAJES_FILE, item_id)
        else:
            self.send_error(404, "Endpoint no encontrado")

    # ── OPTIONS (CORS preflight) ─────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    # ── Helpers ─────────────────────────────────────────────────────────────
    def _serve_file(self, file_path: Path, default=None):
        try:
            if default is not None:
                data = _read_json(file_path, default)
                body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            else:
                body = file_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:
            self._json_error(500, str(exc))

    def _save_data(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length)
            obj    = json.loads(body)
            _write_json(DATA_FILE, obj)
            self._json_ok()
        except json.JSONDecodeError as exc:
            self._json_error(400, f"JSON inválido: {exc}")
        except Exception as exc:
            self._json_error(500, str(exc))

    def _save_list(self, file_path: Path):
        """Reemplaza el archivo con la lista JSON recibida (usado para marcar leído)."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length)
            lista  = json.loads(body)
            if not isinstance(lista, list):
                raise ValueError("Se esperaba una lista JSON")
            _write_json(file_path, lista)
            self._json_ok()
        except json.JSONDecodeError as exc:
            self._json_error(400, f"JSON inválido: {exc}")
        except Exception as exc:
            self._json_error(500, str(exc))

    def _append_item(self, file_path: Path, prefix: str):
        """Lee el body JSON, le agrega id y fecha, y lo inserta al inicio de la lista."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length)
            item   = json.loads(body)
            # Agregar metadatos automáticos
            item["id"]    = f"{prefix}-{int(time.time() * 1000)}"
            item["fecha"] = time.strftime("%Y-%m-%d %H:%M", time.localtime())
            item["leido"] = False
            lista = _read_json(file_path, [])
            lista.insert(0, item)      # más reciente primero
            _write_json(file_path, lista)
            self.send_response(201)
            self.send_header("Content-Type", "application/json")
            self._cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "id": item["id"]}).encode())
        except json.JSONDecodeError as exc:
            self._json_error(400, f"JSON inválido: {exc}")
        except Exception as exc:
            self._json_error(500, str(exc))

    def _delete_item(self, file_path: Path, item_id):
        try:
            if not item_id:
                self._json_error(400, "Falta el parámetro id")
                return
            lista = _read_json(file_path, [])
            nueva = [x for x in lista if x.get("id") != item_id]
            _write_json(file_path, nueva)
            self._json_ok()
        except Exception as exc:
            self._json_error(500, str(exc))

    def _redirect(self, location):
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    def _json_ok(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _json_error(self, code, msg):
        body = json.dumps({"error": msg}, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def end_headers(self):
        path = urlparse(self.path).path
        if path.endswith(('.html', '.css', '.js')):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma",        "no-cache")
            self.send_header("Expires",       "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and "/api/" in str(args[0]):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    DATA_DIR.mkdir(exist_ok=True)
    _ensure_file(REGISTROS_FILE, [])
    _ensure_file(MENSAJES_FILE,  [])
    try:
        with http.server.HTTPServer(("", PORT), EducienciaHandler) as httpd:
            print(f"\n  EDUCIENCIA corriendo en: http://localhost:{PORT}")
            print(f"  Panel de administracion: http://localhost:{PORT}/admin/")
            print("  Presiona Ctrl+C para detener.\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except OSError as e:
        print(f"\nError al iniciar el servidor: {e}")
        print(f"¿El puerto {PORT} está en uso? Prueba cambiando PORT en server.py")
        sys.exit(1)
