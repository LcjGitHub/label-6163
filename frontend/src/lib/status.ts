import type { PlayStatus } from './types';

/** 状态 Badge 配色映射 */
const STATUS_COLORS: Record<PlayStatus, string> = {
  未开始: 'gray',
  试玩中: 'blue',
  已完成: 'green',
  搁置: 'yellow'
};

/**
 * 根据试玩状态返回 Flowbite Badge 颜色
 * @param status - 试玩状态
 */
export function getStatusColor(status: PlayStatus): string {
  return STATUS_COLORS[status] ?? 'gray';
}
