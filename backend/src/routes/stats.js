import { Router } from 'express';
import db from '../db.js';

const router = Router();

const PLAY_STATUSES = ['未开始', '试玩中', '已完成', '搁置'];

function getTagsForGame(gameId) {
  return db
    .prepare(
      `SELECT t.* FROM tags t
       INNER JOIN game_tags gt ON t.id = gt.tag_id
       WHERE gt.game_id = ?
       ORDER BY t.name ASC`
    )
    .all(gameId);
}

function attachTagsToGames(games) {
  return games.map(game => ({
    ...game,
    tags: getTagsForGame(game.id)
  }));
}

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
  const recentGamesWithTags = attachTagsToGames(recentGames);

  res.json({
    total,
    status_counts: statusCounts,
    recent_games: recentGamesWithTags
  });
});

export default router;
