<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { goto } from '$app/navigation';
  import {
    Alert,
    Button,
    Card,
    Input,
    Label,
    Select,
    Spinner,
    Textarea
  } from 'flowbite-svelte';
  import { ArrowLeftOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import { createGame, deleteGame, fetchGame, fetchPlayStatuses, updateGame } from '$lib/api';
  import type { GameInput, PlayStatus } from '$lib/types';

  interface Props {
    data: { mode: 'create' | 'edit'; id?: number };
  }

  let { data }: Props = $props();

  const queryClient = useQueryClient();
  const isEdit = $derived(data.mode === 'edit');
  const gameId = $derived(data.id ?? 0);

  const statusesQuery = createQuery({
    queryKey: ['play-statuses'],
    queryFn: fetchPlayStatuses
  });

  const gameQuery = createQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
    enabled: isEdit && gameId > 0
  });

  let name = $state('');
  let author = $state('');
  let platform_url = $state('');
  let play_status = $state<PlayStatus>('未开始');
  let review = $state('');
  let formError = $state('');
  let initialized = $state(false);

  $effect(() => {
    if (isEdit && $gameQuery.data && !initialized) {
      name = $gameQuery.data.name;
      author = $gameQuery.data.author;
      platform_url = $gameQuery.data.platform_url;
      play_status = $gameQuery.data.play_status as PlayStatus;
      review = $gameQuery.data.review;
      initialized = true;
    }
  });

  const saveMutation = createMutation({
    mutationFn: (input: GameInput) =>
      isEdit ? updateGame(gameId, input) : createGame(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      if (isEdit) {
        await queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      }
      goto('/');
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        formError = String(error.response.data.error);
        return;
      }
      formError = error instanceof Error ? error.message : '保存失败';
    }
  });

  const deleteMutation = createMutation({
    mutationFn: () => deleteGame(gameId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['games'] });
      goto('/');
    }
  });

  /**
   * 提交表单
   * @param event - 表单提交事件
   */
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    formError = '';

    if (!name.trim()) {
      formError = '请填写游戏名';
      return;
    }

    $saveMutation.mutate({
      name: name.trim(),
      author: author.trim(),
      platform_url: platform_url.trim(),
      play_status,
      review: review.trim()
    });
  }

  /** 删除当前游戏 */
  function handleDelete() {
    if (!confirm('确定删除这条试玩记录吗？')) {
      return;
    }
    $deleteMutation.mutate(undefined);
  }
</script>

<svelte:head>
  <title>{isEdit ? '编辑笔记' : '新增游戏'} · 试玩清单</title>
</svelte:head>

<Button href="/" color="light" class="mb-4">
  <ArrowLeftOutline class="me-2 h-4 w-4" />
  返回列表
</Button>

{#if isEdit && $gameQuery.isPending}
  <div class="flex justify-center py-16">
    <Spinner size="8" />
  </div>
{:else if isEdit && $gameQuery.isError}
  <Alert color="red">游戏不存在或加载失败。</Alert>
{:else}
  <Card>
    <h1 class="mb-1 text-2xl font-bold text-gray-900">{isEdit ? '编辑试玩笔记' : '新增试玩游戏'}</h1>
    <p class="mb-6 text-sm text-gray-500">填写游戏信息与试玩评价，保存后返回列表。</p>

    {#if formError}
      <Alert color="red" class="mb-4">{formError}</Alert>
    {/if}

    <form class="space-y-4" onsubmit={handleSubmit}>
      <div>
        <Label for="name" class="mb-2">游戏名 *</Label>
        <Input id="name" bind:value={name} placeholder="例如 Hollow Knight" required />
      </div>

      <div>
        <Label for="author" class="mb-2">作者</Label>
        <Input id="author" bind:value={author} placeholder="开发者或工作室" />
      </div>

      <div>
        <Label for="platform_url" class="mb-2">平台链接</Label>
        <Input
          id="platform_url"
          type="url"
          bind:value={platform_url}
          placeholder="https://store.steampowered.com/..."
        />
      </div>

      <div>
        <Label for="play_status" class="mb-2">试玩状态</Label>
        <Select id="play_status" bind:value={play_status} disabled={$statusesQuery.isPending}>
          {#if $statusesQuery.data}
            {#each $statusesQuery.data as status}
              <option value={status}>{status}</option>
            {/each}
          {:else}
            <option value="未开始">未开始</option>
            <option value="试玩中">试玩中</option>
            <option value="已完成">已完成</option>
            <option value="搁置">搁置</option>
          {/if}
        </Select>
      </div>

      <div>
        <Label for="review" class="mb-2">简短评价 / 笔记</Label>
        <Textarea
          id="review"
          bind:value={review}
          rows={5}
          placeholder="记录 Demo 体验、机制亮点或待验证点..."
        />
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <Button type="submit" color="blue" disabled={$saveMutation.isPending}>
          {#if $saveMutation.isPending}
            <Spinner class="me-2" size="4" />
          {/if}
          保存
        </Button>

        {#if isEdit}
          <Button
            type="button"
            color="red"
            outline
            disabled={$deleteMutation.isPending}
            onclick={handleDelete}
          >
            <TrashBinOutline class="me-2 h-4 w-4" />
            删除
          </Button>
        {/if}
      </div>
    </form>
  </Card>
{/if}
