// Servidor para publicar el aplicativo en Railway.
// Sirve unicamente index.html: las planillas del repositorio no quedan
// accesibles desde internet.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = process.env.PORT || 3000;
const APLICATIVO = path.join(__dirname, 'index.html');

const html = fs.readFileSync(APLICATIVO);

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Allow': 'GET, HEAD' });
    return res.end();
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(req.method === 'HEAD' ? undefined : html);
}).listen(PUERTO, () => {
  console.log(`Porcionamiento La Independiente escuchando en el puerto ${PUERTO}`);
});
