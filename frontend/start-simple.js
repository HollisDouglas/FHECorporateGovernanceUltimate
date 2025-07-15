const http = require('http');
const fs = require('fs');
const path = require('path');

let port = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};


function startServer(currentPort) {
  const newServer = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    
    if (!fs.existsSync(filePath) && req.url !== '/') {
      filePath = path.join(__dirname, 'public', 'index.html');
    }
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('404 - File Not Found');
        } else {
          res.writeHead(500);
          res.end('500 - Internal Server Error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  newServer.listen(currentPort, () => {
    console.log(`\n🚀 PrivacyPad Development Server`);
    console.log(`📍 Server running at http://localhost:${currentPort}`);
    console.log(`🔧 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log(`⚠️  This is a simple static server for demonstration`);
    console.log(`🎯 To use React features, run: npm install && npm start\n`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${currentPort} is in use, trying ${currentPort + 1}...`);
      startServer(currentPort + 1);
    } else {
      console.error('❌ Server error:', error);
    }
  });
}

startServer(port);