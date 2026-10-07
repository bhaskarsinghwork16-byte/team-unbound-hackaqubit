const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;

console.log(`\n======================================================`);
console.log(`  HealthScreen AI — Next.js Clinical Dashboard`);
console.log(`  Local URL: http://localhost:${PORT}`);
console.log(`======================================================\n`);

const nextProc = spawn('npx', ['next', 'dev', '-p', PORT.toString()], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

nextProc.on('error', (err) => {
  console.error('Failed to start Next.js dev server:', err);
});

