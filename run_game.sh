#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"

start_python3() {
  echo "Iniciando servidor en http://localhost:${PORT} (python3)..."
  exec python3 -m http.server "$PORT"
}

start_python() {
  echo "Iniciando servidor en http://localhost:${PORT} (python)..."
  exec python -m http.server "$PORT"
}

start_busybox() {
  echo "Iniciando servidor en http://localhost:${PORT} (busybox httpd)..."
  exec busybox httpd -f -p "$PORT"
}

start_node() {
  echo "Iniciando servidor en http://localhost:${PORT} (node)..."
  exec node -e "const http=require('http');const fs=require('fs');const path=require('path');const port=${PORT};const root=process.cwd();const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};http.createServer((req,res)=>{const reqPath=(req.url||'/').split('?')[0];const safePath=path.normalize(decodeURIComponent(reqPath)).replace(/^\.\.(\/|\\|$)/,'');let filePath=path.join(root,safePath==='/'?'index.html':safePath);if(fs.existsSync(filePath)&&fs.statSync(filePath).isDirectory())filePath=path.join(filePath,'index.html');fs.readFile(filePath,(err,data)=>{if(err){res.statusCode=404;res.setHeader('Content-Type','text/plain; charset=utf-8');res.end('Not found');return;}res.statusCode=200;res.setHeader('Content-Type',mime[path.extname(filePath)]||'application/octet-stream');res.end(data);});}).listen(port,'0.0.0.0',()=>console.log('Serving',root,'on http://0.0.0.0:'+port));"
}

if command -v python3 >/dev/null 2>&1; then
  start_python3
elif command -v python >/dev/null 2>&1; then
  start_python
elif command -v busybox >/dev/null 2>&1; then
  start_busybox
elif command -v node >/dev/null 2>&1; then
  start_node
else
  echo "Error: no encontré python3/python/busybox/node para levantar servidor." >&2
  echo "Abre index.html directamente en el navegador como alternativa." >&2
  exit 1
fi
