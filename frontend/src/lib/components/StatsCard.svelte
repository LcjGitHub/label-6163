<script lang="ts">
  interface Props {
    label: string;
    value: number;
    color?: 'blue' | 'green' | 'yellow' | 'gray' | 'purple' | 'red';
  }

  let { label, value, color = 'blue' }: Props = $props();

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    red: 'border-red-200 bg-red-50 text-red-700'
  };
</script>

<div class="rounded-lg border p-4 {colorClasses[color]}">
  <p class="text-sm font-medium opacity-80">{label}</p>
  <p class="mt-1 text-3xl font-bold">{value}</p>
</div>
