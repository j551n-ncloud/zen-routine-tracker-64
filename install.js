
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the scripts.js to update package.json
console.log('Updating package.json scripts...');
execSync('node scripts.js', { stdio: 'inherit' });

// Create data directory
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Installation complete!');
console.log('\nYou can now run the application with:');
console.log('npm start');
