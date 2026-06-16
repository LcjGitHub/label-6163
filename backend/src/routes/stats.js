import { Router } from 'express';
import db from '../db.js';

const router = Router();

const PLAY_STATUSES = ['未开始', '试玩中', '已完成', '搁置'];

router.get('/', (_req, res) => {
  const totalResult = db.prepare('SELECT COUNT(*) as count FROM games').get();
  const total = totalResult.count;

  const statusCounts = {};
  for (const status of PLAY_STATUSES) {
    const result = db
      .prepare('SELECT COUNT(*) as count FROM games WHERE play_status = ?')
      .get(status);
    statusCounts[status] = result.count;
  }

  const recentGames = db
    .prepare('SELECT * FROM games ORDER BY updated_at DESC, id DESC LIMIT 3')
    .all();

  res.json({
    total,
    status_counts: statusCounts,
    recent_games: recentGames
  });
});

export default router;
