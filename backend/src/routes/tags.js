import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const tags = db
    .prepare('SELECT * FROM tags ORDER BY name ASC')
    .all();
  res.json(tags);
});

router.get('/game/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const tags = db
    .prepare(
      `SELECT t.* FROM tags t
       INNER JOIN game_tags gt ON t.id = gt.tag_id
       WHERE gt.game_id = ?
       ORDER BY t.name ASC`
    )
    .all(gameId);
  res.json(tags);
});

router.put('/game/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const tagIds = Array.isArray(req.body?.tag_ids) ? req.body.tag_ids : [];

  const game = db.prepare('SELECT id FROM games WHERE id = ?').get(gameId);
  if (!game) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }

  const validTagIds = tagIds
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);

  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM game_tags WHERE game_id = ?').run(gameId);
    if (validTagIds.length > 0) {
      const insert = db.prepare('INSERT OR IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)');
      for (const tagId of validTagIds) {
        insert.run(gameId, tagId);
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: '保存标签失败' });
    return;
  }

  const tags = db
    .prepare(
      `SELECT t.* FROM tags t
       INNER JOIN game_tags gt ON t.id = gt.tag_id
       WHERE gt.game_id = ?
       ORDER BY t.name ASC`
    )
    .all(gameId);

  res.json(tags);
});

export default router;
