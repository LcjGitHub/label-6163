import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/** @type {PageLoad} */
export const load: PageLoad = ({ params }) => {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw error(404, '无效的游戏 ID');
  }

  return {
    mode: 'edit' as const,
    id
  };
};
