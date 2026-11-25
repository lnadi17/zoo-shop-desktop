<script>
  export let pathName = '/home';
  export let show = {};
  const pages = [['/home','მთავარი'],['/products','პროდუქცია'],['/scanner','გაყიდვა'],['/history','ისტორია'],['/parameter','პარამეტრები']];
</script>
<header>
  <strong>მაღაზია</strong>
  <nav aria-label="ნავიგაცია">
    {#each pages as [path,label]}
      <a href={path} class:active={pathName === path} aria-current={pathName === path ? 'page' : undefined}>{label}</a>
    {/each}
  </nav>
  <aside>
    {#if ['/products','/history','/parameter'].includes(pathName)}
      <button aria-expanded={!!show.showToolbar} on:click={() => show.showToolbar = !show.showToolbar}>ფილტრი</button>
    {/if}
    {#if ['/products','/history'].includes(pathName)}
      <button on:click={() => pathName === '/products' ? show.showProductReport = true : show.showHistoryReport = true}>Excel</button>
    {/if}
    {#if pathName === '/parameter'}<a href="/api/backup" download>სარეზერვო ასლი</a>{/if}
  </aside>
</header>
<style>
  header,nav,aside{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
  header{padding:.8rem 1.25rem;background:#173c35;color:white;gap:1rem}
  strong{font-size:1.15rem} nav a,aside a,button{padding:.48rem .65rem;border-radius:5px;color:white}
  nav a:hover,aside a:hover,button:hover{background:#326158;color:white}
  nav a.active{background:#e3f2e9;color:#173c35;font-weight:650}
  aside{margin-left:auto} button,aside a{border:1px solid #82a59c;background:transparent;font:inherit}
  :focus-visible{outline:3px solid #efc269;outline-offset:2px}
</style>
