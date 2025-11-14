const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();


const useSSL = process.env.DB_SSL === 'true';

// PostgreSQL Pool Setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: useSSL
    ? { rejectUnauthorized: false }
    : false,                       
});

// Connect to both PostgreSQL and MongoDB
const connectDB = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('PostgreSQL Connected...');

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

    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB Connected...');
    } else {
      console.log('MONGO_URI not set, skipping MongoDB connection.');
    }
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };