const http = require('node:http');

const port = Number(process.env.PORT || 8080);
const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'Healthy', service: 'WPWW War Room' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(port);
