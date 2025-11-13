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
    await pool.connect();
    console.log('PostgreSQL Connected...');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };