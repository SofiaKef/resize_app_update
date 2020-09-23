const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const port = 5010;
const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'public')));
const corsOptions = {
  origin: 'http://localhost:3210',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const dirPath = __dirname;
const images64 = [];
let image;

function base64Encode(file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString('base64');
}

function fromDir(startPath) {
  let countId = 0;
  const filter = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg'];
  const files = fs.readdirSync(startPath);
  for (let i = 0, filesLength = files.length; i < filesLength; i += 1) {
    const filename = path.join(startPath, files[i]);
    // checks if the current file has the extension type of an image
    if (filter.some((extension) => (path.extname(filename.toLowerCase()) === extension))) {
      image = base64Encode(files[i]);
      images64.push(image);
    }
  }
}

fromDir(dirPath);

app.get('/resize', cors(corsOptions), (req, res) => {
  try {
    res.status(200).json(images64);
  } catch (err) {
    res.status(400).send('Couldn\'t resize images.');
  }
});

/*
app.get('/resizeTest', cors(corsOptions), (req, res) => {
  const exampleJson = ['background', 'witch', 'vampire'];

  res.json(exampleJson);
});
*/

app.listen(port);

console.log(`App is listening on port ${port}`);
