import { Router } from 'express';
import db from '../db.js';

const router = Router();

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
  const authors = db
    .prepare(
      `SELECT 
        author as name,
        COUNT(*) as game_count
       FROM games
       WHERE author IS NOT NULL AND author != ''
       GROUP BY author
       ORDER BY game_count DESC, author ASC`
    )
    .all();

  const authorsWithGames = authors.map(author => {
    const games = db
      .prepare(
        `SELECT * FROM games 
         WHERE author = ?
         ORDER BY updated_at DESC, id DESC`
      )
      .all(author.name);
    return {
      ...author,
      games: attachTagsToGames(games)
    };
  });

  res.json(authorsWithGames);
});

router.get('/:name/games', (req, res) => {
  const authorName = decodeURIComponent(req.params.name);

  const games = db
    .prepare(
      `SELECT * FROM games
       WHERE author = ?
       ORDER BY updated_at DESC, id DESC`
    )
    .all(authorName);

  if (games.length === 0) {
    const existingAuthor = db
      .prepare(
        `SELECT 1 FROM games WHERE author = ? LIMIT 1`
      )
      .get(authorName);

    if (!existingAuthor) {
      res.status(404).json({ error: '作者不存在' });
      return;
    }
  }

  const gamesWithTags = attachTagsToGames(games);
  res.json(gamesWithTags);
});

export default router;
