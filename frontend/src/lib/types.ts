/** 试玩状态枚举 */
export type PlayStatus = '未开始' | '试玩中' | '已完成' | '搁置';

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Game {
  id: number;
  name: string;
  author: string;
  platform_url: string;
  play_status: PlayStatus;
  play_hours: number | null;
  review: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface GameInput {
  name: string;
  author: string;
  platform_url: string;
  play_status: PlayStatus;
  play_hours: number | null;
  review: string;
  tag_ids: number[];
}

/** 各试玩状态数量映射 */
export type StatusCounts = Record<PlayStatus, number>;

/** 统计数据 */
export interface Stats {
  total: number;
  status_counts: StatusCounts;
  recent_games: Game[];
}

/** 作者信息 */
export interface Author {
  name: string;
  game_count: number;
  games: Game[];
}
