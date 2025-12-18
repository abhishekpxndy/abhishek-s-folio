#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting both development servers...\n');

// Start inner site server
const innerSite = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'inner-site'),
  stdio: 'pipe',
  shell: true
});

// Start main site server
const mainSite = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

// Handle inner site output
innerSite.stdout.on('data', (data) => {
  console.log(`📱 Inner Site: ${data.toString().trim()}`);
});

innerSite.stderr.on('data', (data) => {
  console.error(`📱 Inner Site Error: ${data.toString().trim()}`);
});

// Handle main site output
mainSite.stdout.on('data', (data) => {
  console.log(`🏠 Main Site: ${data.toString().trim()}`);
});

mainSite.stderr.on('data', (data) => {
  console.error(`🏠 Main Site Error: ${data.toString().trim()}`);
});

// Handle process exits
innerSite.on('close', (code) => {
  console.log(`📱 Inner site process exited with code ${code}`);
  mainSite.kill();
});

mainSite.on('close', (code) => {
  console.log(`🏠 Main site process exited with code ${code}`);
  innerSite.kill();
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  innerSite.kill();
  mainSite.kill();
  process.exit(0);
});

console.log('✅ Both servers started!');
console.log('🏠 Main Site: http://localhost:5173/');
console.log('📱 Inner Site: http://localhost:3001/');
console.log('\nPress Ctrl+C to stop both servers');