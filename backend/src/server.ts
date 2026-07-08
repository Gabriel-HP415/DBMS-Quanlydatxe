import app from './app';
import { getPool, closePool } from './config/database';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await getPool();

    app.listen(PORT, () => {
      console.log(`[API] Server chạy tại http://localhost:${PORT}`);
      console.log(`[API] Health check: http://localhost:${PORT}/health`);
      console.log(`[API] Trips:        http://localhost:${PORT}/api/trips`);
    });
  } catch (err) {
    console.error('[API] Không thể khởi động server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

start();