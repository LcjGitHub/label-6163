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
  import { createGame, deleteGame, fetchGame, fetchPlayStatuses, fetchTags, updateGame } from '$lib/api';
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

  const tagsQuery = createQuery({
    queryKey: ['tags'],
    queryFn: fetchTags
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
  let play_hours = $state<string>('');
  let rating = $state<number | null>(null);
  let review = $state('');
  let selectedTagIds = $state<number[]>([]);
  let formError = $state('');
  let initialized = $state(false);

  $effect(() => {
    if (isEdit && $gameQuery.data && !initialized) {
      name = $gameQuery.data.name;
      author = $gameQuery.data.author;
      platform_url = $gameQuery.data.platform_url;
      play_status = $gameQuery.data.play_status as PlayStatus;
      play_hours = $gameQuery.data.play_hours !== null ? String($gameQuery.data.play_hours) : '';
      rating = $gameQuery.data.rating ?? null;
      review = $gameQuery.data.review;
      selectedTagIds = ($gameQuery.data.tags ?? []).map((t: { id: number }) => t.id);
      initialized = true;
    }
  });

  function toggleTag(tagId: number) {
    if (selectedTagIds.includes(tagId)) {
      selectedTagIds = selectedTagIds.filter((id: number) => id !== tagId);
    } else {
      selectedTagIds = [...selectedTagIds, tagId];
    }
  }

  function setRating(value: number) {
    if (rating === value) {
      rating = null;
    } else {
      rating = value;
    }
  }

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

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    formError = '';

    if (!name.trim()) {
      formError = '请填写游戏名';
      return;
    }

    const playHoursNum = play_hours.trim() !== '' ? Number(play_hours) : null;
    if (playHoursNum !== null && (isNaN(playHoursNum) || playHoursNum < 0)) {
      formError = '试玩时长必须是非负数';
      return;
    }

    $saveMutation.mutate({
      name: name.trim(),
      author: author.trim(),
      platform_url: platform_url.trim(),
      play_status,
      play_hours: playHoursNum !== null ? Math.round(playHoursNum * 10) / 10 : null,
      rating,
      review: review.trim(),
      tag_ids: selectedTagIds
    });
  }

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
        <Label for="play_hours" class="mb-2">试玩时长（小时）</Label>
        <Input
          id="play_hours"
          type="number"
          step="0.1"
          min="0"
          bind:value={play_hours}
          placeholder="例如 12.5"
        />
      </div>

      <div>
        <Label class="mb-2">试玩评分</Label>
        <div class="flex items-center gap-1">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              onclick={() => setRating(star)}
              class="text-2xl transition-colors cursor-pointer select-none focus:outline-none"
              style="color: {rating !== null && star <= rating ? '#f59e0b' : '#d1d5db'};"
            >
              {rating !== null && star <= rating ? '★' : '☆'}
            </button>
          {/each}
          {#if rating !== null}
            <span class="ml-2 text-sm text-gray-500">{rating} 星</span>
          {:else}
            <span class="ml-2 text-sm text-gray-400">未评</span>
          {/if}
        </div>
        <p class="mt-1 text-xs text-gray-400">点击星星评分，再次点击当前星级可取消</p>
      </div>

      <div>
        <Label class="mb-2">标签</Label>
        {#if $tagsQuery.isPending}
          <Spinner size="4" />
        {:else if $tagsQuery.data && $tagsQuery.data.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each $tagsQuery.data as tag (tag.id)}
              {@const active = selectedTagIds.includes(tag.id)}
              <button
                type="button"
                onclick={() => toggleTag(tag.id)}
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all border cursor-pointer select-none"
                style="
                  background-color: {active ? tag.color : 'transparent'};
                  color: {active ? '#ffffff' : tag.color};
                  border-color: {tag.color};
                  {active ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.15);' : ''}
                "
              >
                {tag.name}
              </button>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-gray-400">暂无标签</p>
        {/if}
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
