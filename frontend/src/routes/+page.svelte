<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { Button, Card, Input, Select, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { DownloadOutline, FilterOutline, PlusOutline, SearchOutline, XOutline } from 'flowbite-svelte-icons';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { exportGames, fetchGames, fetchPlayStatuses } from '$lib/api';
  import type { PlayStatus } from '$lib/types';

  let selectedStatus = $state('全部');
  let searchInput = $state('');
  let searchKeyword = $state('');

  const statusesQuery = createQuery({
    queryKey: ['playStatuses'],
    queryFn: fetchPlayStatuses
  });

  const statusOptions = $derived(['全部', ...($statusesQuery.data ?? [])]);

  const gamesQuery = createQuery({
    queryKey: ['games', selectedStatus, searchKeyword],
    queryFn: () => fetchGames(
      selectedStatus === '全部' ? undefined : selectedStatus,
      searchKeyword || undefined
    )
  });

  let exporting = false;
  let exportError = '';

  async function handleExport() {
    if (exporting) return;
    exporting = true;
    exportError = '';
    try {
      await exportGames();
    } catch {
      exportError = '导出失败，请确认后端已在 http://localhost:5000 启动。';
    } finally {
      exporting = false;
    }
  }

  function handleSearch() {
    searchKeyword = searchInput.trim();
  }

  function handleClearSearch() {
    searchInput = '';
    searchKeyword = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<svelte:head>
  <title>游戏列表 · 试玩清单</title>
</svelte:head>

<div class="mb-6">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">试玩游戏列表</h1>
      <p class="mt-1 text-sm text-gray-500">记录独立 Demo 的试玩状态与简短评价</p>
    </div>
    <div class="flex items-center gap-3">
      <Button color="light" on:click={handleExport} disabled={exporting || $gamesQuery.isPending}>
        <DownloadOutline class="me-2 h-4 w-4" />
        {exporting ? '导出中...' : '导出清单'}
      </Button>
      <Button href="/games/new" color="blue">
        <PlusOutline class="me-2 h-4 w-4" />
        新增游戏
      </Button>
    </div>
  </div>
  <div class="flex items-center gap-3 flex-wrap">
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
    <div class="h-6 w-px bg-gray-300"></div>
    <div class="flex items-center gap-2">
      <div class="w-56">
        <Input
          bind:value={searchInput}
          placeholder="搜索游戏名..."
          on:keydown={handleKeydown}
        />
      </div>
      <Button size="sm" color="blue" on:click={handleSearch}>
        <SearchOutline class="h-4 w-4" />
      </Button>
      {#if searchKeyword}
        <Button size="sm" color="light" on:click={handleClearSearch}>
          <XOutline class="h-4 w-4" />
        </Button>
      {/if}
    </div>
    {#if $gamesQuery.isSuccess}
      <span class="text-sm text-gray-500">
        共 {$gamesQuery.data.length} 条记录
      </span>
    {/if}
  </div>
</div>

{#if exportError}
  <Card class="mb-4 border-red-200 bg-red-50">
    <p class="text-red-700">{exportError}</p>
  </Card>
{/if}

{#if $gamesQuery.isFetching && !$gamesQuery.isError}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if $gamesQuery.isError}
  <Card class="border-red-200 bg-red-50">
    <p class="text-red-700">加载失败，请确认后端已在 http://localhost:5000 启动。</p>
  </Card>
{:else if $gamesQuery.data.length === 0}
  <Card>
    {#if searchKeyword}
      <div class="text-center py-4">
        <p class="text-gray-600 mb-2">未找到与「{searchKeyword}」相关的游戏</p>
        <Button size="sm" color="light" on:click={handleClearSearch}>清空搜索</Button>
      </div>
    {:else}
      <p class="text-gray-600">暂无数据</p>
    {/if}
  </Card>
{:else}
  <Card class="overflow-x-auto p-0">
    <Table hoverable>
      <TableHead>
        <TableHeadCell>游戏名</TableHeadCell>
        <TableHeadCell>作者</TableHeadCell>
        <TableHeadCell>试玩状态</TableHeadCell>
        <TableHeadCell class="whitespace-nowrap">试玩时长</TableHeadCell>
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
            <TableBodyCell class="whitespace-nowrap">
              {#if game.play_hours !== null && game.play_hours !== undefined}
                {game.play_hours}h
              {:else}
                <span class="text-gray-400">未记录</span>
              {/if}
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
