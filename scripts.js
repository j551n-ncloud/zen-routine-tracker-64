
// This script will modify package.json without directly changing it
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update scripts section
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "node start.js",
  "server": "ts-node src/server/index.ts",
  "dev:server": "nodemon --watch src/server --exec ts-node src/server/index.ts"
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Updated package.json scripts successfully');
