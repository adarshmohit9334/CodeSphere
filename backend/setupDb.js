import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setupDatabase() {
  try {
    // Connect without specifying database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'codesphere_db';
    
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    
    console.log(`Using database ${dbName}...`);
    await connection.query(`USE \`${dbName}\`;`);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(100),
        files JSON,
        customPath VARCHAR(255),
        updatedAt DATETIME
      );
    `;

    console.log('Creating projects table if not exists...');
    await connection.query(createTableQuery);

    console.log('✅ Database setup complete!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
