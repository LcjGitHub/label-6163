import db from './db.js';

/** @type {Array<{ name: string; author: string; platform_url: string; play_status: string; review: string }>} */
const SEED_GAMES = [
  {
    name: 'Hollow Knight',
    author: 'Team Cherry',
    platform_url: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
    play_status: '已完成',
    review: '地图探索与战斗手感出色，独立 Metroidvania 标杆。'
  },
  {
    name: 'Celeste',
    author: 'Maddy Makes Games',
    platform_url: 'https://store.steampowered.com/app/504230/Celeste/',
    play_status: '试玩中',
    review: '平台跳跃难度曲线清晰，叙事与机制结合紧密。'
  },
  {
    name: 'Stardew Valley',
    author: 'ConcernedApe',
    platform_url: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
    play_status: '未开始',
    review: '待体验农场经营与社交系统的长期节奏。'
  },
  {
    name: 'Hades',
    author: 'Supergiant Games',
    platform_url: 'https://store.steampowered.com/app/1145360/Hades/',
    play_status: '试玩中',
    review: 'Roguelike 循环设计成熟，对话与美术风格统一。'
  },
  {
    name: 'Undertale',
    author: 'Toby Fox',
    platform_url: 'https://store.steampowered.com/app/391540/Undertale/',
    play_status: '搁置',
    review: '经典 RPG，计划完整通关后再写详细笔记。'
  }
];

/**
 * 若数据库为空则写入 seed 数据
 * @returns {number} 插入条数
 */
export function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM games').get();

  if (count > 0) {
    return 0;
  }

  const insert = db.prepare(`
    INSERT INTO games (name, author, platform_url, play_status, review)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const game of SEED_GAMES) {
      insert.run(game.name, game.author, game.platform_url, game.play_status, game.review);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return SEED_GAMES.length;
}
