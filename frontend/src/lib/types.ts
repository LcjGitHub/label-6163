/** 试玩状态枚举 */
export type PlayStatus = '未开始' | '试玩中' | '已完成' | '搁置';

/** 游戏记录 */
export interface Game {
  id: number;
  name: string;
  author: string;
  platform_url: string;
  play_status: PlayStatus;
  review: string;
  created_at: string;
  updated_at: string;
}

/** 创建/更新游戏请求体 */
export interface GameInput {
  name: string;
  author: string;
  platform_url: string;
  play_status: PlayStatus;
  review: string;
}

/** 各试玩状态数量映射 */
export type StatusCounts = Record<PlayStatus, number>;

/** 统计数据 */
export interface Stats {
  total: number;
  status_counts: StatusCounts;
  recent_games: Game[];
}
