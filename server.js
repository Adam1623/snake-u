// node --watch server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((req, res) => {
    const page = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(page, (err, content) => {
    res.end(content);
  });
});

//normal
server.listen(3000);

//allows other connection on the same network, given they have your ip address
// server.listen(3000, "0.0.0.0");