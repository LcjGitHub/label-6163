<script lang="ts">
  import { Badge } from 'flowbite-svelte';
  import { getStatusColor } from '$lib/status';
  import type { PlayStatus } from '$lib/types';

  interface Props {
    status: PlayStatus;
  }

  let { status }: Props = $props();
</script>

<Badge color={getStatusColor(status)}>{status}</Badge>
