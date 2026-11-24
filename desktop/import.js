// mongoexport --jsonArray produces relaxed Extended JSON dates and ObjectIds.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function importMongo(store, dir) {
  const collections = {product:'products',history:'sellhistories',parameter:'parameters'};
  const read = name => JSON.parse(readFileSync(join(dir, name + '.json'),'utf8'), (key,value) => {
    if (value && typeof value === 'object') {
      if (Object.hasOwn(value,'$oid')) return value.$oid;
      if (Object.hasOwn(value,'$date')) return new Date(value.$date).toISOString();
      if (Object.hasOwn(value,'$numberLong')) return Number(value.$numberLong);
    }
    return value;
  });
  const count = store.db.transaction(() => {
    if (store.db.query('SELECT COUNT(*) AS n FROM records').get().n ||
        store.db.query('SELECT COUNT(*) AS n FROM receipts').get().n) throw Error('Import requires an empty shop database.');
    let total = 0;
    for (const [kind,name] of Object.entries(collections)) {
      const rows = read(name);
      if (!Array.isArray(rows)) throw Error(name + ' must be a JSON array.');
      const ids = new Set();
      for (const row of rows) {
        if (typeof row._id !== 'string' || !row._id || ids.has(row._id)) throw Error(name + ' contains a missing or duplicate ID.');
        ids.add(row._id);
        if (kind === 'history') store.addHistory(row, row);
        else store.save(kind,row,false,row);
        total++;
      }
    }
    return total;
  }).immediate();
  return count;
}
