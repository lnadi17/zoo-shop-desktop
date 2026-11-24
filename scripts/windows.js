const args = ['bun', 'build', 'desktop/server.js', '--compile'];
// The Windows runner already has the pinned x64 baseline runtime installed.
if (process.platform !== 'win32' || process.arch !== 'x64') args.push('--target=bun-windows-x64-baseline');
args.push('--outfile', 'dist/Zoo-Shop-Windows-x64.exe');
process.exit(Bun.spawnSync(args, { stdout: 'inherit', stderr: 'inherit' }).exitCode);
