import { spawn } from 'child_process';
import path from 'path';

console.log('[Dev Runner] Starting BreatheWise AI backend (port 5000) and Vite frontend (port 3000)...');

const isWin = process.platform === 'win32';
const viteBin = path.resolve(isWin ? './node_modules/.bin/vite.cmd' : './node_modules/.bin/vite');
const tsxBin = path.resolve(isWin ? './node_modules/.bin/tsx.cmd' : './node_modules/.bin/tsx');

const server = spawn(tsxBin, ['watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: isWin,
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' },
});

const client = spawn(viteBin, ['--host', '127.0.0.1', '--port', '3000'], {
  stdio: 'inherit',
  shell: isWin,
  env: { ...process.env, CI: 'true' },
});

server.on('error', (err) => console.error('[Backend Error]:', err));
client.on('error', (err) => console.error('[Frontend Error]:', err));

const cleanExit = () => {
  try {
    server.kill();
    client.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
