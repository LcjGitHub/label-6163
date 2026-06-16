<script lang="ts">
  import { page } from '$app/stores';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import '../app.css';

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false
      }
    }
  });

  const navItems = [
    { href: '/', label: '游戏列表' },
    { href: '/stats', label: '数据统计' },
    { href: '/developers', label: '开发者视图' }
  ];
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 bg-white shadow-sm">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-6">
          <a href="/" class="text-xl font-bold text-gray-900">独立游戏 Demo 试玩清单</a>
          <nav class="flex gap-1 text-sm">
            {#each navItems as item}
              <a
                href={item.href}
                class={$page.url.pathname === item.href
                  ? 'rounded-md bg-blue-50 px-3 py-1.5 font-semibold text-blue-600'
                  : 'rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              >{item.label}</a>
            {/each}
          </nav>
        </div>
        <span class="text-sm text-gray-500">MVP · Svelte 5</span>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      {@render children()}
    </main>
  </div>
</QueryClientProvider>
