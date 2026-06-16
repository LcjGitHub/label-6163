import cors from 'cors';
import express from 'express';
import gamesRouter from './routes/games.js';
import statsRouter from './routes/stats.js';
import { seedIfEmpty } from './seed.js';

const app = express();
const PORT = 5000;

app.use(cors({ origin: ['http://localhost:5101', 'http://127.0.0.1:5101'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/games', gamesRouter);
app.use('/api/stats', statsRouter);

const seeded = seedIfEmpty();
if (seeded > 0) {
  console.log(`已写入 ${seeded} 条 seed 数据`);
}

app.listen(PORT, () => {
  console.log(`后端服务运行于 http://localhost:${PORT}`);
});
