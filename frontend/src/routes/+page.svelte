<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { Button, Card, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { PlusOutline } from 'flowbite-svelte-icons';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { fetchGames } from '$lib/api';
  import type { PlayStatus } from '$lib/types';

  const gamesQuery = createQuery({
    queryKey: ['games'],
    queryFn: fetchGames
  });
</script>

<svelte:head>
  <title>游戏列表 · 试玩清单</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">试玩游戏列表</h1>
    <p class="mt-1 text-sm text-gray-500">记录独立 Demo 的试玩状态与简短评价</p>
  </div>
  <Button href="/games/new" color="blue">
    <PlusOutline class="me-2 h-4 w-4" />
    新增游戏
  </Button>
</div>

{#if $gamesQuery.isPending}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if $gamesQuery.isError}
  <Card class="border-red-200 bg-red-50">
    <p class="text-red-700">加载失败，请确认后端已在 http://localhost:5000 启动。</p>
  </Card>
{:else if $gamesQuery.data.length === 0}
  <Card>
    <p class="text-gray-600">暂无游戏，点击「新增游戏」开始记录。</p>
  </Card>
{:else}
  <Card class="overflow-x-auto p-0">
    <Table hoverable>
      <TableHead>
        <TableHeadCell>游戏名</TableHeadCell>
        <TableHeadCell>作者</TableHeadCell>
        <TableHeadCell>试玩状态</TableHeadCell>
        <TableHeadCell>简短评价</TableHeadCell>
        <TableHeadCell>
          <span class="sr-only">操作</span>
        </TableHeadCell>
      </TableHead>
      <TableBody>
        {#each $gamesQuery.data as game (game.id)}
          <TableBodyRow>
            <TableBodyCell class="font-medium text-gray-900">
              <div class="flex flex-wrap items-center gap-1.5">
                <span>{game.name}</span>
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
            </TableBodyCell>
            <TableBodyCell>{game.author || '—'}</TableBodyCell>
            <TableBodyCell>
              <StatusBadge status={game.play_status as PlayStatus} />
            </TableBodyCell>
            <TableBodyCell class="max-w-xs truncate text-gray-600">{game.review || '—'}</TableBodyCell>
            <TableBodyCell>
              <Button href="/games/{game.id}" size="xs" color="light">编辑笔记</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </Card>
{/if}
