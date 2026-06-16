import { Router } from 'express';
import db from '../db.js';

const router = Router();

function escapeCsvField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

router.get('/games', (_req, res) => {
  const games = db
    .prepare('SELECT name, author, platform_url, play_status, review, updated_at FROM games ORDER BY updated_at DESC, id DESC')
    .all();

  const header = ['游戏名', '作者', '平台链接', '试玩状态', '简短评价', '更新时间'];
  const rows = games.map(game => [
    game.name,
    game.author,
    game.platform_url,
    game.play_status,
    game.review,
    game.updated_at
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(escapeCsvField).join(','))
    .join('\n');

  const filename = `游戏清单_${new Date().toISOString().slice(0, 10)}.csv`;
  const encodedFilename = encodeURIComponent(filename);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
  res.setHeader('Content-Length', Buffer.byteLength('\uFEFF' + csv, 'utf8'));
  res.send('\uFEFF' + csv);
});

export default router;
