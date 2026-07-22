import app from './app';
import dotenv from 'dotenv';
import { seedContent } from './utils/seedContent';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`[SERVER] The Gift of Chess backend running on port ${PORT}`);
  console.log('[SERVER] Starting content seed check...');
  await seedContent();
});

process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('[SERVER] Closed remaining connections.');
    process.exit(0);
  });
});
