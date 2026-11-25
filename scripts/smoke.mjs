import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const executable = resolve(process.argv[2]);
const dir = await mkdtemp(join(tmpdir(),'Zoo Shop smoke '));
let child, browser;
async function start(dataDir) {
  child = spawn(executable,['--no-browser'],{env:{...process.env,ZOO_DATA_DIR:dataDir},stdio:['ignore','pipe','inherit']});
  let log = '';
  const origin = await new Promise((resolve,reject) => {
    const timeout = setTimeout(() => reject(Error('Startup timed out: ' + log)),15000);
    child.on('error',reject);
    child.once('exit',code => {clearTimeout(timeout); reject(Error('Exited: ' + code));});
    child.stdout.on('data',chunk => {
      log += chunk;
      const match = log.match(/http:\/\/127\.0\.0\.1:\d+(?=\/home)/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
  return origin;
}
async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exit = once(child,'exit'); child.kill(); await exit;
}
try {
  const origin = await start(dir);
  const json = async path => (await fetch(origin + path)).json();
  browser = await chromium.launch({channel:'chrome',headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror',err => errors.push(err.message));
  await page.goto(origin + '/home');
  assert.equal(await page.title(), 'მაღაზია');
  await page.getByRole('banner').getByText('მაღაზია', {exact:true}).waitFor();
  await page.getByRole('link',{name:'დაამატეთ პირველი პროდუქტი'}).click();
  await page.getByRole('button',{name:'პროდუქტის დამატება'}).click();
  const modal = page.locator('.popup.active .content').first();
  const texts = modal.locator('input[type=text]');
  await texts.nth(0).fill('0019');
  await texts.nth(1).fill('კატის საკვები');
  await modal.locator('input[type=number]').nth(0).fill('10');
  await modal.locator('#quantity-pairs input[type=number]').nth(0).fill('5');
  await modal.locator('#quantity-pairs input[type=number]').nth(1).fill('4');
  await modal.getByRole('button',{name:'დასტური'}).click();
  await page.getByRole('cell',{name:'კატის საკვები',exact:true}).waitFor();
  await page.getByRole('link',{name:'გაყიდვა',exact:true}).click();
  const lookup = page.getByLabel('პროდუქტის სახელი ან შტრიხკოდი');
  await lookup.fill('0019');
  await lookup.press('Enter');
  await page.getByRole('spinbutton',{name:'რაოდენობა'}).fill('2');
  await page.getByRole('button',{name:'გაყიდვის დადასტურება'}).click();
  await page.getByRole('status').filter({hasText:'20.00 ₾'}).waitFor();
  const [product] = await json('/api/product/findAll');
  assert.equal(product.quantity[0].quantity,3);
  const [history] = await json('/api/history/findAll');
  assert.equal(history.benefit,12);
  await page.getByRole('link',{name:'ისტორია',exact:true}).click();
  await page.getByRole('cell',{name:'კატის საკვები',exact:true}).waitFor();
  await page.getByRole('button',{name:'Excel'}).click();
  const report = page.locator('.popup.active .content').first();
  const excelDownload = page.waitForEvent('download');
  await report.locator('button').first().click();
  assert.match((await excelDownload).suggestedFilename(),/\.xlsx$/);
  await page.getByRole('link',{name:'პარამეტრები'}).click();
  const download = page.waitForEvent('download');
  await page.getByRole('link',{name:'სარეზერვო ასლი'}).click();
  const restored = join(dir,'restored');
  await mkdir(restored);
  await (await download).saveAs(join(restored,'shop.sqlite'));
  await stop();
  const restarted = await start(dir);
  assert.equal((await (await fetch(restarted + '/api/history/findAll')).json()).length,1);
  await stop();
  const fromBackup = await start(restored);
  assert.equal((await (await fetch(fromBackup + '/api/product/findAll')).json())[0].quantity[0].quantity,3);
  assert.deepEqual(errors,[]);
  console.log('PASS: packaged startup, Georgian product entry, barcode checkout, profit, Excel, backup, restart and restore');
} finally {
  await browser?.close();
  await stop();
  await rm(dir,{recursive:true,force:true,maxRetries:3});
}
