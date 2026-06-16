import db from './db.js';

/** @type {Array<{ name: string; author: string; platform_url: string; play_status: string; review: string; tags: string[] }>} */
const SEED_GAMES = [
  {
    name: 'Hollow Knight',
    author: 'Team Cherry',
    platform_url: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
    play_status: '已完成',
    review: '地图探索与战斗手感出色，独立 Metroidvania 标杆。',
    tags: ['横版', '银河恶魔城', '2D']
  },
  {
    name: 'Celeste',
    author: 'Maddy Makes Games',
    platform_url: 'https://store.steampowered.com/app/504230/Celeste/',
    play_status: '试玩中',
    review: '平台跳跃难度曲线清晰，叙事与机制结合紧密。',
    tags: ['平台跳跃', '像素', '独立']
  },
  {
    name: 'Stardew Valley',
    author: 'ConcernedApe',
    platform_url: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
    play_status: '未开始',
    review: '待体验农场经营与社交系统的长期节奏。',
    tags: ['模拟经营', '像素', '休闲']
  },
  {
    name: 'Hades',
    author: 'Supergiant Games',
    platform_url: 'https://store.steampowered.com/app/1145360/Hades/',
    play_status: '试玩中',
    review: 'Roguelike 循环设计成熟，对话与美术风格统一。',
    tags: ['Roguelike', '动作', '独立']
  },
  {
    name: 'Undertale',
    author: 'Toby Fox',
    platform_url: 'https://store.steampowered.com/app/391540/Undertale/',
    play_status: '搁置',
    review: '经典 RPG，计划完整通关后再写详细笔记。',
    tags: ['RPG', '像素', '独立']
  }
];

/** @type {Array<{ name: string; color: string }>} */
const SEED_TAGS = [
  { name: '横版', color: '#0ea5e9' },
  { name: '银河恶魔城', color: '#8b5cf6' },
  { name: '2D', color: '#10b981' },
  { name: '平台跳跃', color: '#f59e0b' },
  { name: '像素', color: '#ec4899' },
  { name: '独立', color: '#6366f1' },
  { name: '模拟经营', color: '#14b8a6' },
  { name: '休闲', color: '#22c55e' },
  { name: 'Roguelike', color: '#ef4444' },
  { name: '动作', color: '#f97316' },
  { name: 'RPG', color: '#a855f7' },
  { name: '解谜', color: '#3b82f6' }
];

function ensureTags() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM tags').get();
  if (count > 0) return;

  const insert = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');
  db.exec('BEGIN');
  try {
    for (const tag of SEED_TAGS) {
      insert.run(tag.name, tag.color);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function seedGamesWithTags() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM games').get();
  if (count > 0) return 0;

  ensureTags();

  const insertGame = db.prepare(`
    INSERT INTO games (name, author, platform_url, play_status, review)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertGameTag = db.prepare(`
    INSERT OR IGNORE INTO game_tags (game_id, tag_id)
    VALUES (?, (SELECT id FROM tags WHERE name = ?))
  `);

  db.exec('BEGIN');
  try {
    for (const game of SEED_GAMES) {
      const result = insertGame.run(
        game.name,
        game.author,
        game.platform_url,
        game.play_status,
        game.review
      );
      const gameId = result.lastInsertRowid;
      for (const tagName of game.tags) {
        insertGameTag.run(gameId, tagName);
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return SEED_GAMES.length;
}

export function seedIfEmpty() {
  ensureTags();
  return seedGamesWithTags();
}
