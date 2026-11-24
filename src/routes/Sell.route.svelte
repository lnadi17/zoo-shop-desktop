<script>
  import { onMount } from 'svelte';
  import { ProductService } from '../services/product.service';
  let products = [], cart = [], query = '', message = '', busy = false, searchBox, ready = false;
  let receipt = '', previousRequest = '';
  const stock = p => Number(p.quantity.reduce((n, lot) => n + lot.quantity, 0).toFixed(3));
  const format = n => Number(n || 0).toFixed(2);
  $: matches = query.trim() ? products.filter(p => (p.code + ' ' + p.name).toLowerCase().includes(query.trim().toLowerCase())).slice(0,8) : [];
  $: total = cart.reduce((sum, line) => sum + Math.round(line.amount * line.price * 100) / 100, 0);

  onMount(async () => {
    try {
      products = await ProductService.getInstance().getProducts();
      ready = true;
      const code = sessionStorage.getItem('incomingBarcode');
      sessionStorage.removeItem('incomingBarcode');
      if (code) addCode(code);
      searchBox.focus();
    } catch { message = 'პროდუქცია ვერ ჩაიტვირთა. განაახლეთ გვერდი.'; }
  });
  function addCode(code) {
    const product = products.find(p => p.code === code.trim());
    if (product) add(product);
    else message = 'პროდუქტი ამ კოდით ვერ მოიძებნა.';
  }
  function add(product) {
    if (busy) return;
    const line = cart.find(l => l.product._id === product._id);
    const available = stock(product);
    const increment = Math.min(1, Number((available - (line?.amount || 0)).toFixed(3)));
    if (increment <= 0) { message = product.name + ' — მარაგი არასაკმარისია.'; return; }
    if (line) { line.amount = Number((line.amount + increment).toFixed(3)); cart = [...cart]; }
    else cart = [...cart, {product, amount:increment, price:product.sellingPrice}];
    query = ''; message = ''; searchBox.focus();
  }
  function setLineTotal(line, target) {
    if (!(line.price > 0) || !Number.isFinite(target)) return;
    const units = target / line.price;
    line.amount = Math.min(stock(line.product), line.product.quantityType === 'ცალობითი' ? Math.floor(units) : Number(units.toFixed(3)));
    cart = [...cart];
  }
  async function checkout() {
    if (busy || !cart.length) return;
    busy = true;
    const items = cart.map(l => ({_id:l.product._id, amount:l.amount, sellingPrice:l.price}));
    const request = JSON.stringify(items);
    if (request !== previousRequest) { receipt = crypto.randomUUID(); previousRequest = request; }
    try {
      const response = await fetch('/api/product/checkout', {method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({items, requestId:receipt})});
      const result = await response.json();
      if (!response.ok) { message = result.message; return; }
      for (const item of result.items) products.find(p => p._id === item._id).quantity = item.newQuantity;
      products = [...products];
      message = 'გაყიდვა შენახულია — ' + format(total) + ' ₾';
      cart = []; previousRequest = ''; receipt = ''; query = '';
    } catch { message = 'კავშირი შეწყდა. სცადეთ ხელახლა.'; }
    finally { busy = false; }
  }
</script>
<svelte:window on:barcode={event => addCode(event.detail)}/>
<section class="pos">
  <h1>გაყიდვა</h1>
  <label for="lookup">პროდუქტის სახელი ან შტრიხკოდი</label>
  <form class="lookup" on:submit|preventDefault={() => products.some(p => p.code === query.trim()) ? addCode(query) : matches.length === 1 ? add(matches[0]) : addCode(query)}>
    <input id="lookup" bind:this={searchBox} type="search" bind:value={query} disabled={!ready || busy} autocomplete="off" placeholder="დაასკანერეთ ან ჩაწერეთ">
    <button disabled={!query || busy}>დამატება</button>
  </form>
  {#if matches.length}<ul class="matches">
    {#each matches as p}<li><button disabled={busy} on:click={() => add(p)}>{p.name} · {p.code} <small>{format(p.sellingPrice)} ₾ · მარაგი {stock(p)}</small></button></li>{/each}
  </ul>{/if}
  <p role="status" aria-live="polite">{message}</p>
  {#if ready && !products.length}<p>გაყიდვის დასაწყებად <a href="/products">დაამატეთ პროდუქტი</a>.</p>{/if}
  <form on:submit|preventDefault={checkout}>
    <fieldset disabled={busy}>
      <table><caption>კალათა</caption>
        <thead><tr><th>პროდუქტი</th><th>რაოდენობა</th><th>ფასი ₾</th><th>ჯამი ₾</th><th></th></tr></thead>
        <tbody>
          {#each cart as line (line.product._id)}
            <tr><td>{line.product.name}<small>{line.product.code} · {line.product.quantityType}</small></td>
              <td><input required aria-label="რაოდენობა" type="number" min={line.product.quantityType === 'ცალობითი' ? 1 : .001} max={stock(line.product)} step={line.product.quantityType === 'ცალობითი' ? 1 : .001} bind:value={line.amount}></td>
              <td><input required aria-label="ფასი" type="number" min="0" step=".01" bind:value={line.price}></td>
              <td><input aria-label="ჯამური ფასი" type="number" min="0" step=".01" disabled={!line.price} value={format(line.amount * line.price)} on:change={e => setLineTotal(line,e.currentTarget.valueAsNumber)}></td><td><button type="button" on:click={() => cart=cart.filter(l => l !== line)}>ამოღება</button></td></tr>
          {:else}<tr><td colspan="5">კალათა ცარიელია</td></tr>{/each}
        </tbody>
      </table>
      <footer>{#if cart.length}<button type="button" on:click={() => { cart=[]; message=''; }}>კალათის გასუფთავება</button>{/if}<strong>სულ {format(total)} ₾</strong><button class="pay" disabled={!cart.length || busy}>{busy ? 'ინახება…' : 'გაყიდვის დადასტურება'}</button></footer>
    </fieldset>
  </form>
</section>
<style>
.pos{max-width:960px;margin:2rem auto;padding:1.6rem;background:white;border:1px solid #d7e1dc;border-radius:12px}
h1{font-size:1.65rem;margin:0 0 1.2rem}label,caption{font-weight:650} .lookup,footer{display:flex;gap:.6rem;align-items:center}
input,button{border:1px solid #9eafa8;border-radius:5px;padding:.55rem .75rem;background:white}input[type=search]{flex:1;min-width:0}
button:disabled{opacity:.55}.matches{list-style:none;padding:0}.matches button{width:100%;text-align:left}
small{display:block;color:#53645d}.pay{background:#185345;color:white}p[role=status]{color:#185345;font-weight:600}
table{width:100%;border-collapse:collapse}caption{caption-side:top;color:#172f26}td,th{padding:.7rem .3rem;border-bottom:1px solid #dce5df}td input{width:6rem}footer{justify-content:flex-end;margin-top:1rem}
@media(max-width:650px){.pos{margin:.5rem;padding:.65rem;overflow-x:auto}td input{width:4rem}td,th{font-size:.85rem}}
</style>
