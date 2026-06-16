<script lang="ts">
  import { Card } from 'flowbite-svelte';

  interface Props {
    label: string;
    value: number;
  }

  let { label, value }: Props = $props();
</script>

<Card>
  <p class="text-sm font-medium text-gray-500">{label}</p>
  <p class="mt-1 text-3xl font-bold text-gray-900">{value}</p>
</Card>
