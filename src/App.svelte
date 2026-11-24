<script>
  import Header from './components/Header.svelte';
  import Home from './routes/Home.route.svelte';
  import Product from './routes/Product.route.svelte';
  import History from './routes/History.route.svelte';
  import Parameter from './routes/Parameter.route.svelte';
  import Sell from './routes/Sell.route.svelte';

  const pathName = location.pathname === '/' ? '/home' : location.pathname;
  let show = {};
  let barcode = '', lastKey = 0;
  function readScanner(event) {
    if (event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable], button') || document.querySelector('.popup.active')) return;
    if (event.timeStamp - lastKey > 100) barcode = '';
    lastKey = event.timeStamp;
    if (event.key === 'Enter' && barcode) {
      if (pathName === '/scanner') window.dispatchEvent(new CustomEvent('barcode', {detail:barcode}));
      else {
        sessionStorage.setItem('incomingBarcode',barcode);
        location.assign('/scanner');
      }
      barcode = '';
    } else if (event.key.length === 1) barcode += event.key;
  }
</script>
<svelte:window on:keydown={readScanner}/>
<Header {pathName} bind:show/>
<main>
  {#if pathName === '/home'}<Home/>
  {:else if pathName === '/products'}<Product bind:show/>
  {:else if pathName === '/history'}<History bind:show/>
  {:else if pathName === '/parameter'}<Parameter bind:show/>
  {:else if pathName === '/scanner'}<Sell/>{/if}
</main>
