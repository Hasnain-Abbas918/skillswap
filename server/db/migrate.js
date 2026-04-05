const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
require('dotenv').config();

const runMigrations = async () => {
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('⏳ Running migrations...');
  try {
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
};

runMigrations();