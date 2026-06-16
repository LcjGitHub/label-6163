<script lang="ts">
  import GameForm from '$lib/components/GameForm.svelte';

  let { data } = $props();
</script>

<GameForm {data} />
