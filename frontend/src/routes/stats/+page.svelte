<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { Button, Card, Spinner } from 'flowbite-svelte';
  import StatsCard from '$lib/components/StatsCard.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { fetchStats } from '$lib/api';
  import type { PlayStatus } from '$lib/types';

  const statsQuery = createQuery({
    queryKey: ['stats'],
    queryFn: fetchStats
  });

  const statusOrder: PlayStatus[] = ['未开始', '试玩中', '已完成', '搁置'];

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>数据统计 · 试玩清单</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-gray-900">数据统计</h1>
  <p class="mt-1 text-sm text-gray-500">游戏总数、各状态分布与最近更新记录</p>
</div>

{#if $statsQuery.isPending}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if $statsQuery.isError}
  <Card class="border-red-200 bg-red-50">
    <p class="text-red-700">加载失败，请确认后端已在 http://localhost:5000 启动。</p>
  </Card>
{:else}
  {@const stats = $statsQuery.data}

  <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    <StatsCard label="游戏总数" value={stats.total} />
    {#each statusOrder as status}
      <StatsCard label={status} value={stats.status_counts[status]} />
    {/each}
  </div>

  <Card>
    <h2 class="mb-4 text-lg font-semibold text-gray-900">最近更新</h2>
    {#if stats.recent_games.length === 0}
      <p class="text-gray-500">暂无更新记录</p>
    {:else}
      <div class="divide-y divide-gray-100">
        {#each stats.recent_games as game (game.id)}
          <div class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div class="flex items-center gap-3">
              <div class="flex flex-wrap items-center gap-1.5">
                <a href="/games/{game.id}" class="font-medium text-gray-900 hover:text-blue-600 hover:underline">{game.name}</a>
                {#if game.tags && game.tags.length > 0}
                  {#each game.tags as tag (tag.id)}
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none"
                      style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
                    >
                      {tag.name}
                    </span>
                  {/each}
                {/if}
              </div>
              <StatusBadge status={game.play_status as PlayStatus} />
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">{formatDate(game.updated_at)}</span>
              <Button href="/games/{game.id}" size="xs" color="light">编辑笔记</Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
{/if}
