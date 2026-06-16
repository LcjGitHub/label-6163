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

function setGameTags(gameId, tagIds) {
  const validTagIds = (tagIds || [])
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);

  db.prepare('DELETE FROM game_tags WHERE game_id = ?').run(gameId);
  if (validTagIds.length > 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)');
    for (const tagId of validTagIds) {
      insert.run(gameId, tagId);
    }
  }
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ ok: true; data: object; tagIds: number[] } | { ok: false; error: string }}
 */
function validateGameBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const platform_url = typeof body.platform_url === 'string' ? body.platform_url.trim() : '';
  const play_status = typeof body.play_status === 'string' ? body.play_status.trim() : '未开始';
  const review = typeof body.review === 'string' ? body.review.trim() : '';
  const tag_ids = Array.isArray(body.tag_ids) ? body.tag_ids : [];

  if (!name) {
    return { ok: false, error: '游戏名不能为空' };
  }

  if (!PLAY_STATUSES.includes(play_status)) {
    return { ok: false, error: `试玩状态必须是：${PLAY_STATUSES.join('、')}` };
  }

  const validTagIds = tag_ids
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);

  return {
    ok: true,
    data: { name, author, platform_url, play_status, review },
    tagIds: validTagIds
  };
}

router.get('/statuses', (_req, res) => {
  res.json(PLAY_STATUSES);
});

router.get('/', (_req, res) => {
  const games = db
    .prepare('SELECT * FROM games ORDER BY updated_at DESC, id DESC')
    .all();
  const gamesWithTags = attachTagsToGames(games);
  res.json(gamesWithTags);
});

router.get('/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);

  if (!game) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }

  const gameWithTags = {
    ...game,
    tags: getTagsForGame(game.id)
  };
  res.json(gameWithTags);
});

router.post('/', (req, res) => {
  const validated = validateGameBody(req.body);

  if (!validated.ok) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const { name, author, platform_url, play_status, review } = validated.data;

  db.exec('BEGIN');
  try {
    const result = db
      .prepare(`
        INSERT INTO games (name, author, platform_url, play_status, review, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `)
      .run(name, author, platform_url, play_status, review);

    const gameId = result.lastInsertRowid;
    setGameTags(gameId, validated.tagIds);
    db.exec('COMMIT');

    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    const gameWithTags = {
      ...game,
      tags: getTagsForGame(gameId)
    };
    res.status(201).json(gameWithTags);
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: '创建游戏失败' });
  }
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }

  const validated = validateGameBody(req.body);

  if (!validated.ok) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const { name, author, platform_url, play_status, review } = validated.data;
  const gameId = req.params.id;

  db.exec('BEGIN');
  try {
    db.prepare(`
      UPDATE games
      SET name = ?,
          author = ?,
          platform_url = ?,
          play_status = ?,
          review = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(name, author, platform_url, play_status, review, gameId);

    setGameTags(gameId, validated.tagIds);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: '更新游戏失败' });
    return;
  }

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  const gameWithTags = {
    ...game,
    tags: getTagsForGame(gameId)
  };
  res.json(gameWithTags);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }

  res.status(204).send();
});

export default router;
