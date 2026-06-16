<script lang="ts">
  import { goto } from '$app/navigation';
  import { createQuery } from '@tanstack/svelte-query';
  import { Card, Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { UserOutline } from 'flowbite-svelte-icons';
  import { fetchAuthors } from '$lib/api';
  import type { Author } from '$lib/types';

  const authorsQuery = createQuery({
    queryKey: ['authors'],
    queryFn: fetchAuthors
  });

  function navigateToAuthor(authorName: string) {
    goto(`/developers/${encodeURIComponent(authorName)}`);
  }

  function authorUrl(author: Author) {
    return `/developers/${encodeURIComponent(author.name)}`;
  }
</script>

<svelte:head>
  <title>开发者视图 · 试玩清单</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-gray-900">开发者视图</h1>
  <p class="mt-1 text-sm text-gray-500">按作者分组查看所有游戏及其试玩状态</p>
</div>

{#if $authorsQuery.isPending}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if $authorsQuery.isError}
  <Card class="border-red-200 bg-red-50">
    <p class="text-red-700">加载失败，请确认后端已在 http://localhost:5000 启动。</p>
  </Card>
{:else if $authorsQuery.data.length === 0}
  <Card>
    <p class="text-gray-600">暂无带作者信息的游戏记录。</p>
  </Card>
{:else}
  <Card class="p-0">
    <Table hoverable>
      <TableHead>
        <TableHeadCell>开发者</TableHeadCell>
        <TableHeadCell>游戏数量</TableHeadCell>
        <TableHeadCell>
          <span class="sr-only">操作</span>
        </TableHeadCell>
      </TableHead>
      <TableBody>
        {#each $authorsQuery.data as author (author.name)}
          <TableBodyRow
            class="cursor-pointer hover:bg-blue-50 transition-colors"
            on:click={() => navigateToAuthor(author.name)}
          >
            <TableBodyCell>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <UserOutline class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{author.name}</p>
                  <p class="text-sm text-gray-500">
                    代表作品：{author.games.slice(0, 2).map(g => g.name).join('、')}
                    {#if author.games.length > 2}
                      等
                    {/if}
                  </p>
                </div>
              </div>
            </TableBodyCell>
            <TableBodyCell>
              <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {author.game_count} 款
              </span>
            </TableBodyCell>
            <TableBodyCell class="text-right">
              <a
                href={authorUrl(author)}
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                on:click|stopPropagation
              >
                查看全部 →
              </a>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </Card>
{/if}
