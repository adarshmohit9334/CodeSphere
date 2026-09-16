import pty from 'node-pty';
const shell = process.env.SHELL || '/bin/zsh';
try {
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });
  console.log('PTY spawned successfully');
  ptyProcess.onData((data) => {
    console.log('DATA:', data);
  });
  ptyProcess.write('ls\r');
  setTimeout(() => ptyProcess.kill(), 1000);
} catch (err) {
  console.error('Failed to spawn PTY:', err);
}
