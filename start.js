
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Start the server
console.log('Starting Express server...');
const server = spawn('node', ['--loader', 'ts-node/esm', './src/server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

// Start the frontend
console.log('Starting Vite development server...');
const client = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  client.kill();
  process.exit(code);
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  server.kill();
  process.exit(code);
});
