const set = v => v !== undefined && v !== null && v !== '';
const contains = (s, query) => !query || String(s).toLowerCase().includes(String(query).toLowerCase());
const typeMatches = (type, query) => query === 'ყველა' || contains(type, query);
const inRange = (v, lo, hi) => (!set(lo) || v >= Number(lo)) && (!set(hi) || v <= Number(hi));
function dateBoundary(value, nextDay) {
  if (/^\d{4}-\d\d-\d\d$/.test(value)) {
    const [y,m,d] = value.split('-').map(Number);
    return new Date(y, m - 1, d + Number(nextDay)).getTime();
  }
  return new Date(value).getTime();
}
function dateRange(value, from, to) {
  const time = new Date(value).getTime();
  return (!from || time >= dateBoundary(from,false)) && (!to || time < dateBoundary(to,true));
}
export function selectProducts(items, f) {
  return items.filter(p => contains(p.code,f.code) && contains(p.name,f.name) && typeMatches(p.productType,f.productType) &&
    inRange(p.sellingPrice,f.startPrice,f.endPrice) && dateRange(p.lastChangeDate,f.startLastChangeDate,f.endLastChangeDate) &&
    (!set(f.official) || p.official === f.official));
}
export function selectHistory(items, f) {
  return items.filter(h => (!f.productId || h.productId === f.productId) && contains(h.productCode,f.productCode) &&
    contains(h.productName,f.productName) && typeMatches(h.productType,f.productType) && inRange(h.benefit,f.benefitFrom,f.benefitTo) &&
    dateRange(h.sellDate,f.sellDateFrom,f.sellDateTo) && (!set(f.amount) || h.amount === Number(f.amount)) &&
    (!set(f.official) || h.official === f.official));
}
