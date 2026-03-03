#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawn } = require('child_process');

// Use Puppeteer's Chromium when Chrome is not installed (e.g. no /Applications/Google Chrome).
try {
  const puppeteer = require('puppeteer');
  process.env.CHROME_BIN = puppeteer.executablePath();
} catch (_) {
  // Puppeteer not installed; Karma will use system Chrome or fail with "set CHROME_BIN"
}

const cwd = path.join(__dirname, '..');
const proc = spawn('npx', ['ng', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd
});
proc.on('exit', (code) => process.exit(code ?? 0));
