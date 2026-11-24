import { test, expect } from 'bun:test';
import { openStore } from '../desktop/store.js';
import { importMongo } from '../desktop/import.js';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const product = {name:'საკვები',code:'001',productType:'სხვა',quantityType:'წონითი',sellingPrice:10,
  quantity:[{quantity:.3,originalPrice:4,createDate:'2025-01-01'},{quantity:1,originalPrice:6,createDate:'2025-02-01'}]};
test('FIFO, fractional stock, atomic basket, duplicate retries, and stale edits', () => {
  const s = openStore(':memory:');
  const original = s.save('product',product,false);
  const line = {_id:original._id,amount:.5,sellingPrice:10};
  expect(() => s.checkout([line,{...line,amount:2}],'bad')).toThrow();
  expect(s.all('history')).toHaveLength(0);
  expect(s.get('product',original._id).quantity[0].quantity).toBe(.3);
  expect(s.checkout([line],'once')).toEqual(s.checkout([line],'once'));
  expect(() => s.checkout([{...line,amount:.4}],'once')).toThrow();
  expect(s.all('history')).toHaveLength(1);
  expect(s.all('history')[0].benefit).toBe(2.6);
  expect(s.get('product',original._id).quantity[0].quantity).toBe(.8);
  expect(() => s.save('product',original,true)).toThrow();
  expect(() => s.save('product',product,false)).toThrow();
  s.db.close();
});
test('original mongoexport files import atomically with stable IDs', () => {
  const dir = mkdtempSync(join(tmpdir(),'zoo-import-'));
  const s = openStore(':memory:');
  try {
    writeFileSync(join(dir,'products.json'),JSON.stringify([{...product,_id:{$oid:'abc'},createDate:{$date:'2020-01-01T00:00:00.000Z'}}]));
    writeFileSync(join(dir,'sellhistories.json'),'[]');
    expect(() => importMongo(s,dir)).toThrow();
    expect(s.all('product')).toHaveLength(0);
    writeFileSync(join(dir,'parameters.json'),'[]');
    expect(importMongo(s,dir)).toBe(1);
    expect(s.get('product','abc').createDate).toBe('2020-01-01T00:00:00.000Z');
    expect(() => importMongo(s,dir)).toThrow();
  } finally { s.db.close(); rmSync(dir,{recursive:true,force:true}); }
});
