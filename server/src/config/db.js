const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// PostgreSQL Pool Setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to both PostgreSQL and MongoDB
const connectDB = async () => {
  try {
  // Acquire and immediately release a client to verify connection without
  // keeping a dedicated client checked out (prevents a leftover open handle).
  const client = await pool.connect();
  client.release();
  console.log('PostgreSQL Connected...');

    // Ensure required tables exist for tests and runtime. Creating here
    // avoids needing the server startup to run model setup when tests call
    // connectDB directly.
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    `;

    const createPixelTable = `
    CREATE TABLE IF NOT EXISTS pixel (
      id SERIAL PRIMARY KEY,
      x_coord INT NOT NULL,
      y_coord INT NOT NULL,
      color VARCHAR(7) DEFAULT '#FFFFFF',
      user_id INT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(x_coord, y_coord)
    );
    `;

    await pool.query(createUsersTable);
    await pool.query(createPixelTable);
    console.log('Ensured users and pixel tables exist.');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };