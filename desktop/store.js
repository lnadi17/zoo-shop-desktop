import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';

export class ShopError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const now = () => new Date().toISOString();
const isoDate = value => {
  const localDay = typeof value === 'string' && /^\d{4}-\d\d-\d\d$/.test(value);
  const date = new Date(localDay ? value + 'T00:00:00' : value);
  if (Number.isNaN(date.getTime())) throw new ShopError('შეამოწმეთ თარიღი.');
  return date.toISOString();
};
function required(value) {
  if (typeof value !== 'string' || !value.trim()) throw new ShopError('შეავსეთ სავალდებულო ველები.');
  return value.trim();
}
function numeric(value, digits = 2) {
  const n = Number(value);
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '' ||
      !Number.isFinite(n) || n < 0 || n > 100000000 || Math.abs(n - Number(n.toFixed(digits))) > 0.00000001)
    throw new ShopError('შეამოწმეთ ფასი და რაოდენობა.');
  return n;
}
const money = n => Math.round((n + Number.EPSILON) * 100) / 100;

export function openStore(filename) {
  const db = new Database(filename, {create: true, strict: true});
  db.run('PRAGMA busy_timeout = 5000');
  db.run(`CREATE TABLE IF NOT EXISTS records (
    kind TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY(kind, id));
    CREATE UNIQUE INDEX IF NOT EXISTS barcodes ON records(json_extract(body,'$.code')) WHERE kind='product';
    CREATE UNIQUE INDEX IF NOT EXISTS names ON records(json_extract(body,'$.name')) WHERE kind='parameter';
    CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, request TEXT NOT NULL, result TEXT NOT NULL);`);
  function get(kind, id) {
    const row = db.query('SELECT body FROM records WHERE kind=? AND id=?').get(kind, id);
    if (!row) throw new ShopError('ჩანაწერი ვერ მოიძებნა.', 404);
    return JSON.parse(row.body);
  }
  function all(kind) {
    return db.query('SELECT body FROM records WHERE kind=? ORDER BY rowid DESC').all(kind)
      .map(row => JSON.parse(row.body)).sort((a,b) => (b.lastChangeDate || b.createDate).localeCompare(a.lastChangeDate || a.createDate));
  }
  function put(kind, item) {
    try {
      db.query('INSERT INTO records VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body')
        .run(kind, item._id, JSON.stringify(item));
    } catch (err) {
      if (String(err.message).includes('UNIQUE constraint')) throw new ShopError('ასეთი კოდი ან სახელი უკვე არსებობს.', 409);
      throw err;
    }
    return item;
  }
  function save(kind, body, editing, imported = {}) {
    const old = editing ? get(kind, required(body._id)) : {};
    if (editing && body.revision && body.revision !== old.revision)
      throw new ShopError('მონაცემები შეიცვალა. განაახლეთ გვერდი.', 409);
    const item = {...old, _id: old._id || imported._id || randomUUID(), lastChangeDate: isoDate(imported.lastChangeDate || now()), revision: randomUUID(), name: required(body.name)};
    if (kind === 'parameter') {
      Object.assign(item, {description: String(body.description ?? ''), parameterType: required(body.parameterType), value: String(body.value ?? '')});
    } else {
      const quantityType = required(body.quantityType);
      if (!Array.isArray(body.quantity)) throw new ShopError('შეამოწმეთ მარაგი.');
      const quantity = body.quantity.map(lot => ({
        quantity: numeric(lot.quantity, quantityType === 'ცალობითი' ? 0 : 3),
        originalPrice: numeric(lot.originalPrice), createDate: isoDate(lot.createDate || now())
      })).filter(lot => lot.quantity > 0).sort((a,b) => a.createDate.localeCompare(b.createDate));
      Object.assign(item, {code: required(body.code), quantity, quantityType, sellingPrice: numeric(body.sellingPrice),
        originalPrice: quantity[0]?.originalPrice ?? null, productType: body.productType || 'სხვა',
        official: body.official ?? true, createDate: old.createDate || isoDate(imported.createDate || now())});
    }
    return put(kind, item);
  }
  function addHistory(body, imported = {}) {
    const amount = numeric(body.amount,3);
    const originalPrice = Number(body.originalPrice);
    const sellingPrice = numeric(body.sellingPrice);
    const benefit = imported.benefit ?? money(amount * (sellingPrice - originalPrice));
    if (!amount || !Number.isFinite(originalPrice) || originalPrice < 0 || !Number.isFinite(benefit))
      throw new ShopError('შეამოწმეთ გაყიდვის მონაცემები.');
    return put('history',{_id: imported._id || randomUUID(), productId: required(body.productId),
      productCode: required(body.productCode), productName: required(body.productName), productType: body.productType || 'სხვა',
      quantityType: required(body.quantityType), amount, sellingPrice, originalPrice, benefit,
      official: body.official ?? true, sellDate: isoDate(body.sellDate || now()), createDate: isoDate(imported.createDate || now())});
  }
  function sell(line) {
    const p = get('product', required(line._id));
    const amount = numeric(line.amount, p.quantityType === 'ცალობითი' ? 0 : 3);
    const price = numeric(line.sellingPrice);
    let remaining = Math.round(amount * 1000), cost = 0;
    if (!remaining) throw new ShopError('მიუთითეთ გასაყიდი რაოდენობა.');
    for (const lot of p.quantity) {
      const available = Math.round(lot.quantity * 1000);
      const used = Math.min(remaining, available);
      cost += used * lot.originalPrice / 1000;
      lot.quantity = (available - used) / 1000;
      remaining -= used;
      if (!remaining) break;
    }
    if (remaining) throw new ShopError(p.name + ' — მარაგი არასაკმარისია.', 409);
    const date = now();
    put('history', {_id: randomUUID(), productId: p._id, productCode: p.code, productName: p.name, productType: p.productType,
      amount, sellingPrice: price, originalPrice: cost / amount, benefit: money(amount * price - cost), quantityType: p.quantityType,
      sellDate: line.sellDate ? isoDate(line.sellDate) : date, createDate: date, official: p.official});
    p.quantity = p.quantity.filter(lot => lot.quantity > 0);
    p.originalPrice = p.quantity[0]?.originalPrice ?? null;
    p.lastChangeDate = date;
    p.revision = randomUUID();
    put('product', p);
    return {_id: p._id, newQuantity: p.quantity, newOriginalPrice: p.originalPrice, revision: p.revision};
  }
  const checkout = db.transaction((lines, key) => {
    if (!Array.isArray(lines) || !lines.length || lines.length > 1000) throw new ShopError('კალათა ცარიელია ან ზედმეტად დიდია.');
    const request = JSON.stringify(lines);
    if (key) {
      const receipt = db.query('SELECT request,result FROM receipts WHERE id=?').get(required(key));
      if (receipt) {
        if (receipt.request !== request) throw new ShopError('გაყიდვის ნომერი უკვე გამოყენებულია.', 409);
        return JSON.parse(receipt.result);
      }
    }
    const result = lines.map(sell);
    if (key) db.query('INSERT INTO receipts VALUES(?,?,?)').run(key, request, JSON.stringify(result));
    return result;
  });
  return {db, get, all, addHistory, save: db.transaction(save).immediate, checkout: checkout.immediate,
    remove(kind,id) {
      if (!db.query('DELETE FROM records WHERE kind=? AND id=?').run(kind,id).changes)
        throw new ShopError('ჩანაწერი ვერ მოიძებნა.',404);
    }
  };
}
