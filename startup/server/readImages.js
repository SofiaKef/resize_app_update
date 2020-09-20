const path = require('path');
import { ApolloServer } from 'apollo-server-express';
const fs = require('fs');
const http = require('http');
const { WebApp } = require('meteor/webapp');

const server = http.createServer((req, res) => {
  req.on('error', err => {
      console.error(err);
      // Handle error...
      res.statusCode = 400;
      res.end('400: Bad Request');
      return;
  });

  res.on('error', err => {
      console.error(err);
      // Handle error...
  });

  fs.readFile('./public' + req.url, (err, data) => {
    if (err) {
        if (req.url === '/' && req.method === 'GET') {
            res.end('Welcome Home');
        } else if (req.url === '/tcs' && req.method === 'GET') {
            res.end('HI RCSer');
        } else {
            res.statusCode = 404;
            res.end('404: File Not Found');
        }
    } else {
        // NOTE: The file name could be parsed to determine the
        // appropriate data type to return. This is just a quick
        // example.
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(data);
    }
  });
});

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: '/resize',
});
/*
const dirPath = __dirname;
const images64 = [];
let image;

function base64Encode(file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString('base64');
}

function fromDir(startPath) {
  const filter = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg'];
  const files = fs.readdirSync(startPath);
  for (let i = 0, filesLength = files.length; i < filesLength; i += 1) {
    const filename = path.join(startPath, files[i]);
    // checks if the current file has the extension type of an image
    if (filter.some((extension) => (path.extname(filename.toLowerCase()) === extension))) {
      image = base64Encode(files[i]);
      images64.push({ id: i, content: image });
    }
  }
}

this.get('/resize', (req, res) => {
  const exampleJson = [
    { id: 1, desc: 'background' },
    { id: 2, desc: 'witch' },
    { id: 3, desc: 'vampire' },
  ];

  res.json(exampleJson);
});
*/
