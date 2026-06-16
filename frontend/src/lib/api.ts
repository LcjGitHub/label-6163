import axios from 'axios';
import type { Game, GameInput } from './types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * 获取全部游戏
 */
export async function fetchGames(): Promise<Game[]> {
  const { data } = await api.get<Game[]>('/games');
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
