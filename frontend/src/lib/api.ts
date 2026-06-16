import axios from 'axios';
import type { Author, Game, GameInput, Stats, Tag } from './types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * 获取全部游戏
 * @param status - 可选的试玩状态筛选
 */
export async function fetchGames(status?: string): Promise<Game[]> {
  const params: Record<string, string> = {};
  if (status) {
    params.status = status;
  }
  const { data } = await api.get<Game[]>('/games', { params });
  return data;
}

/**
 * 获取单个游戏
 * @param id - 游戏 ID
 */
export async function fetchGame(id: number): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${id}`);
  return data;
}

/**
 * 获取试玩状态选项
 */
export async function fetchPlayStatuses(): Promise<string[]> {
  const { data } = await api.get<string[]>('/games/statuses');
  return data;
}

/**
 * 创建游戏
 * @param input - 游戏表单数据
 */
export async function createGame(input: GameInput): Promise<Game> {
  const { data } = await api.post<Game>('/games', input);
  return data;
}

/**
 * 更新游戏
 * @param id - 游戏 ID
 * @param input - 游戏表单数据
 */
export async function updateGame(id: number, input: GameInput): Promise<Game> {
  const { data } = await api.put<Game>(`/games/${id}`, input);
  return data;
}

/**
 * 删除游戏
 * @param id - 游戏 ID
 */
export async function deleteGame(id: number): Promise<void> {
  await api.delete(`/games/${id}`);
}

/**
 * 获取统计数据
 */
export async function fetchStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/stats');
  return data;
}

export async function fetchTags(): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

/**
 * 获取作者列表（按作者分组）
 */
export async function fetchAuthors(): Promise<Author[]> {
  const { data } = await api.get<Author[]>('/authors');
  return data;
}

/**
 * 按作者名获取其全部游戏
 * @param authorName - 作者名称
 * @param status - 可选的试玩状态筛选
 */
export async function fetchGamesByAuthor(authorName: string, status?: string): Promise<Game[]> {
  const params: Record<string, string> = {};
  if (status) {
    params.status = status;
  }
  const { data } = await api.get<Game[]>(`/authors/${encodeURIComponent(authorName)}/games`, { params });
  return data;
}

/**
 * 导出全部游戏记录为 CSV 文件
 */
export async function exportGames(): Promise<void> {
  const response = await api.get('/export/games', {
    responseType: 'blob'
  });

  const contentDisposition = response.headers['content-disposition'];
  let filename = '游戏清单.csv';
  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    if (utf8Match && utf8Match[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else {
      const matches = contentDisposition.match(/filename="?([^"]+)"?/);
      if (matches && matches[1]) {
        filename = decodeURIComponent(matches[1]);
      }
    }
  }

  const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
