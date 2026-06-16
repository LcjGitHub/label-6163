<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { Card, Select, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { ArrowLeftOutline, FilterOutline } from 'flowbite-svelte-icons';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { fetchGamesByAuthor, fetchPlayStatuses } from '$lib/api';
  import type { PageData } from './$types';
  import type { PlayStatus } from '$lib/types';

  let { data }: { data: PageData } = $props();

  let selectedStatus = $state('全部');
  const authorName = $derived(data.authorName);

  const statusesQuery = createQuery({
    queryKey: ['playStatuses'],
    queryFn: fetchPlayStatuses
  });

  const statusOptions = $derived(['全部', ...($statusesQuery.data ?? [])]);

  const gamesQuery = createQuery({
    queryKey: ['authorGames', authorName, selectedStatus],
    queryFn: () => fetchGamesByAuthor(authorName, selectedStatus === '全部' ? undefined : selectedStatus)
  });
</script>

<svelte:head>
  <title>{data.authorName} 的游戏 · 试玩清单</title>
</svelte:head>

<div class="mb-6">
  <a href="/developers" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
    <ArrowLeftOutline class="h-4 w-4" />
    返回开发者列表
  </a>
  <h1 class="text-2xl font-bold text-gray-900">{data.authorName} 的游戏</h1>
  <p class="mt-1 text-sm text-gray-500">该作者开发的所有游戏及其试玩状态</p>
  <div class="flex items-center gap-3 mt-4">
    <div class="flex items-center gap-2">
      <FilterOutline class="h-4 w-4 text-gray-500" />
      <span class="text-sm text-gray-600">试玩状态：</span>
    </div>
    <div class="w-40">
      <Select bind:value={selectedStatus}>
        {#each statusOptions as status}
          <option value={status}>{status}</option>
        {/each}
      </Select>
    </div>
    {#if $gamesQuery.isSuccess}
      <span class="text-sm text-gray-500">
        共 {$gamesQuery.data.length} 条记录
      </span>
    {/if}
  </div>
</div>

{#if $gamesQuery.isFetching && !$gamesQuery.isError}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if $gamesQuery.isError}
  {@const err = $gamesQuery.error as any}
  {@const isAuthorNotFound = err?.response?.status === 404 && err?.response?.data?.error === '作者不存在'}
  {#if isAuthorNotFound}
    <Card class="border-yellow-200 bg-yellow-50">
      <p class="text-yellow-800">作者不存在，请返回<a href="/developers" class="font-medium underline">开发者列表</a>查看。</p>
    </Card>
  {:else}
    <Card class="border-red-200 bg-red-50">
      <p class="text-red-700">加载失败，请确认后端已在 http://localhost:5000 启动。</p>
    </Card>
  {/if}
{:else if $gamesQuery.data.length === 0}
  <Card>
    <p class="text-gray-600">暂无数据</p>
  </Card>
{:else}
  <Card class="p-0">
    <Table hoverable class="w-full table-fixed">
      <TableHead>
        <TableHeadCell class="w-2/5">游戏名</TableHeadCell>
        <TableHeadCell class="w-[120px]">试玩状态</TableHeadCell>
        <TableHeadCell class="w-[100px] whitespace-nowrap">试玩时长</TableHeadCell>
        <TableHeadCell>简短评价</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each $gamesQuery.data as game (game.id)}
          <TableBodyRow>
            <TableBodyCell class="font-medium text-gray-900">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="truncate">{game.name}</span>
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
            <TableBodyCell>
              <StatusBadge status={game.play_status as PlayStatus} />
            </TableBodyCell>
            <TableBodyCell class="whitespace-nowrap">
              {#if game.play_hours !== null && game.play_hours !== undefined}
                {game.play_hours}h
              {:else}
                <span class="text-gray-400">未记录</span>
              {/if}
            </TableBodyCell>
            <TableBodyCell class="truncate text-gray-600">{game.review || '—'}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </Card>
{/if}
