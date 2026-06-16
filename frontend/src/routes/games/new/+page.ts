import type { PageLoad } from './$types';

/** @type {PageLoad} */
export const load: PageLoad = () => ({
  mode: 'create' as const
});
