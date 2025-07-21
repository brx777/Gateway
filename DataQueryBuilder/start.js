#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const distPath = path.join(__dirname, 'dist', 'index.js');

if (isProduction && fs.existsSync(distPath)) {
  // Production mode - use built file
  console.log('Starting in production mode...');
  const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '5000' }
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
} else {
  // Development mode - use tsx
  console.log('Starting in development mode...');
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      PORT: process.env.PORT || '5000',
      NODE_ENV: 'development'
    }
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});