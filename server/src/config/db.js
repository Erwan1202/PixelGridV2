const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// On active SSL dès qu'on n'est pas en localhost
const useSSL = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

// PostgreSQL Pool Setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: useSSL
    ? { rejectUnauthorized: false } // Render / hébergeurs managés
    : false,                        // localhost → pas de SSL
});

// Connect to both PostgreSQL and MongoDB
const connectDB = async () => {
  try {
    // 1. Connexion PostgreSQL
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

    // 2. Connexion MongoDB (NON BLOQUANTE)
    if (process.env.MONGO_URI) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
      } catch (mongoErr) {
        const maskMongoUri = (uri) =>
          uri ? uri.replace(/^(mongodb(?:\+srv)?:\/\/)(?:[^@]+@)?/, '$1') : 'N/A';

        console.error('Connexion MongoDB échouée.');
        console.error('MONGO_URI (masqué) :', maskMongoUri(process.env.MONGO_URI));
        console.error('Type d\'erreur :', mongoErr.name);
        console.error('Message :', mongoErr.message);
        if (mongoErr.stack) {
          // Affiche seulement les premières lignes de la stack pour rester lisible
          console.error('Stack (premières lignes) :', mongoErr.stack.split('\n').slice(0, 6).join('\n'));
        }
        console.error('Vérifiez la valeur de MONGO_URI, les identifiants et la connectivité réseau.');
      }
    } else {
      console.log('MONGO_URI not set, skipping MongoDB connection.');
    }
  } catch (err) {
    // Ici on ne gère QUE les erreurs Postgres
    console.error('DB connection error (Postgres):', err);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
