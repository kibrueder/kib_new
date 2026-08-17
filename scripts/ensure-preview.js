import { spawn } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const port = Number(process.env.PREVIEW_PORT || 8080);
const previewUrl = process.env.PREVIEW_URL || `http://localhost:${port}/`;
const logPath = path.join(root, '.preview-dev.log');

function portOpen(host, p) {
  return new Promise((resolve) => {
    const socket = net.connect({ port: p, host });
    socket.setTimeout(400);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
  });
}

async function waitForPort(p, maxMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (await portOpen('127.0.0.1', p)) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  if (await portOpen('127.0.0.1', port)) {
    console.log(`Preview already running: ${previewUrl}`);
    return;
  }

  console.log(`Starting dev server on port ${port}…`);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const logFd = fs.openSync(logPath, 'a');
  fs.writeSync(
    logFd,
    `\n--- ensure-preview ${new Date().toISOString()} ---\n`
  );

  const child = spawn('npm', ['run', 'dev'], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: process.env,
  });
  child.unref();

  const ready = await waitForPort(port);
  if (!ready) {
    console.error(`Dev server did not start within 45s. See ${logPath}`);
    process.exit(1);
  }

  console.log(`Preview ready: ${previewUrl}`);
  console.log(`Log: ${logPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
