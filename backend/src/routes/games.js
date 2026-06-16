import { Router } from 'express';
import db from '../db.js';

const router = Router();

const PLAY_STATUSES = ['未开始', '试玩中', '已完成', '搁置'];

/**
 * @param {Record<string, unknown>} body
 * @returns {{ ok: true; data: object } | { ok: false; error: string }}
 */
function validateGameBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const platform_url = typeof body.platform_url === 'string' ? body.platform_url.trim() : '';
  const play_status = typeof body.play_status === 'string' ? body.play_status.trim() : '未开始';
  const review = typeof body.review === 'string' ? body.review.trim() : '';

  if (!name) {
    return { ok: false, error: '游戏名不能为空' };
  }

  if (!PLAY_STATUSES.includes(play_status)) {
    return { ok: false, error: `试玩状态必须是：${PLAY_STATUSES.join('、')}` };
  }

  return {
    ok: true,
    data: { name, author, platform_url, play_status, review }
  };
}

router.get('/statuses', (_req, res) => {
  res.json(PLAY_STATUSES);
});

router.get('/', (_req, res) => {
  const games = db
    .prepare('SELECT * FROM games ORDER BY updated_at DESC, id DESC')
    .all();
  res.json(games);
});

router.get('/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);

  if (!game) {
    res.status(404).json({ error: '游戏不存在' });
    return;
  }

  res.json(game);
});

router.post('/', (req, res) => {
  const validated = validateGameBody(req.body);

  if (!validated.ok) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const { name, author, platform_url, play_status, review } = validated.data;
  const result = db
    .prepare(`
      INSERT INTO games (name, author, platform_url, play_status, review, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `)
    .run(name, author, platform_url, play_status, review);

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(game);
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

  db.prepare(`
    UPDATE games
    SET name = ?,
        author = ?,
        platform_url = ?,
        play_status = ?,
        review = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(name, author, platform_url, play_status, review, req.params.id);

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  res.json(game);
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
