<script lang="ts">
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
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 bg-white shadow-sm">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" class="text-xl font-bold text-gray-900">独立游戏 Demo 试玩清单</a>
        <span class="text-sm text-gray-500">MVP · Svelte 5</span>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      {@render children()}
    </main>
  </div>
</QueryClientProvider>
