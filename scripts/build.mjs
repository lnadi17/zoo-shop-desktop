import { build } from 'esbuild';
import { compile } from 'svelte/compiler';
import * as sass from 'sass';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const assets = {};
async function includeFolder(folder, prefix = '') {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name);
    const key = prefix + '/' + entry.name;
    if (entry.isDirectory()) await includeFolder(filename, key);
    else assets[key] = (await readFile(filename)).toString('base64');
  }
}
await includeFolder('public');
const bundle = await build({
  entryPoints: ['src/main.js'], bundle: true, write: false, minify: true,
  mainFields: ['svelte', 'browser', 'module', 'main'],
  plugins: [{
    name: 'svelte', setup(builder) {
      builder.onLoad({filter: /\.svelte$/}, async ({path: filename}) => {
        const source = await readFile(filename, 'utf8');
        const { js } = compile(source, { filename, css: true });
        return { contents: js.code, loader: 'js' };
      });
    }
  }]
});
assets['/bundle.js'] = Buffer.from(bundle.outputFiles[0].contents).toString('base64');
assets['/global.css'] = Buffer.from(sass.compile('src/styles/global.scss').css).toString('base64');
await mkdir('build', { recursive: true });
await mkdir('dist', { recursive: true });
await writeFile('build/assets.json', JSON.stringify(assets));
