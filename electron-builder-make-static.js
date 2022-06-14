// import electron-builder.js with right process.env and copy `from` and `to`
// in a dedicated file

const fs = require('fs');
const path = require('path');
const config = require('./electron-builder.js');

let productName = config.productName;
let { from, to } = config.extraFiles[0];

fs.writeFileSync(
  path.join(process.cwd(), 'electron-builder-static.json'),
  JSON.stringify({ productName, from, to }),
);


