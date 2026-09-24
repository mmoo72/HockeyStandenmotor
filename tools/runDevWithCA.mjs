#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const arg = process.argv[2] || process.env.NODE_EXTRA_CA_CERTS;
if (!arg) {
  console.error('Usage: node tools/runDevWithCA.mjs <path-to-ca-pem>');
  process.exit(1);
}

const caPath = path.resolve(arg);
if (!fs.existsSync(caPath)) {
  console.error('CA file not found:', caPath);
  process.exit(2);
}

console.log('Using CA file:', caPath);
const env = { ...process.env, NODE_EXTRA_CA_CERTS: caPath };

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
