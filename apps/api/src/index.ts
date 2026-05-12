import app from './app.js';
import { prisma } from '@repo/database';

const PORT = Number(process.env['API_PORT'] ?? 3001);

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
