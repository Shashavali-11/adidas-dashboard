require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const { seed, seedDemoUser } = require('./seed');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy backend/.env.example to backend/.env and set it.');
  process.exit(1);
}

async function start() {
  try {
    await connectDB();
    await seed();
    await seedDemoUser();

    const server = app.listen(PORT, () => {
      console.log(`API ready on http://localhost:${PORT}/api`);
    });

    const shutdown = async () => {
      server.close();
      await closeDB();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
