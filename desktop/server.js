import express from 'express';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';
import assets from '../build/assets.json';
import { openStore, ShopError } from './store.js';
import { importMongo } from './import.js';
import { productRoutes } from './routes/product.route.js';
import { historyRoutes } from './routes/sellHistory.route.js';
import { parameterRoutes } from './routes/parameter.route.js';

const dir = process.env.ZOO_DATA_DIR || join(process.env.LOCALAPPDATA || homedir(), 'ZooShopDesktop');
mkdirSync(dir,{recursive:true});
const store = openStore(join(dir,'shop.sqlite'));
if (process.argv.includes('--import-mongo')) {
  const folder = process.argv[process.argv.indexOf('--import-mongo') + 1];
  if (!folder) throw Error('Provide the folder containing the three MongoDB JSON exports.');
  console.log('Imported ' + importMongo(store,folder) + ' records.');
  store.db.close();
  process.exit(0);
}
const app = express();
app.disable('x-powered-by');
let origin;
app.use((req,res,next) => {
  if ('http://' + req.headers.host !== origin || (req.headers.origin && req.headers.origin !== origin) ||
      req.headers['sec-fetch-site'] === 'cross-site') return res.sendStatus(403);
  res.set('X-Content-Type-Options','nosniff');
  res.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  if (req.method === 'POST' && !req.is('application/json')) return res.sendStatus(415);
  next();
});
app.use(express.json({limit:'2mb'}));
app.use('/api', (req,res,next) => { res.set('Cache-Control','no-store'); next(); });
app.use('/api/product', productRoutes(store));
app.use('/api/history', historyRoutes(store));
app.use('/api/parameter', parameterRoutes(store));
app.get('/api/backup', (req,res) => {
  res.attachment('zoo-shop-' + new Date().toISOString().slice(0,10) + '.sqlite');
  res.send(Buffer.from(store.db.serialize()));
});
const pages = new Set(['/', '/home','/products','/history','/parameter','/scanner']);
app.use((req,res) => {
  const key = pages.has(req.path) ? '/index.html' : req.path;
  if (req.method !== 'GET' || !Object.hasOwn(assets,key)) return res.sendStatus(404);
  res.type(key.split('.').pop()).send(Buffer.from(assets[key],'base64'));
});
app.use((err,req,res,next) => {
  if (!(err instanceof ShopError)) console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({status, message: err instanceof ShopError ? err.message : 'მოთხოვნის შესრულება ვერ მოხერხდა.'});
});
const server = app.listen(Number(process.env.ZOO_PORT || 0),'127.0.0.1', () => {
  origin = 'http://127.0.0.1:' + server.address().port;
  console.log('Zoo Shop: ' + origin + '/home');
  console.log('Keep this window open while using Zoo Shop. Close it when finished.');
  console.log('Database folder: ' + dir);
  if (!process.argv.includes('--no-browser')) {
    const [cmd, ...args] = process.platform === 'win32' ? ['rundll32.exe','url.dll,FileProtocolHandler'] :
      [process.platform === 'darwin' ? 'open' : 'xdg-open'];
    const browser = spawn(cmd,[...args,origin + '/home'],{detached:true,stdio:'ignore'});
    browser.on('error', () => console.log('Open the address above in your browser.'));
    browser.unref();
  }
});
