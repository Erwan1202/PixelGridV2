const { pool } = require('../config/db');

// Pixel Model for managing pixel data in PostgreSQL
class Pixel {
  static async getState() {
  const result = await pool.query(
    'SELECT x_coord, y_coord, color FROM pixel'
  );
  return result.rows;
}


  // Place or update a pixel
  static async place(x, y, color, userId) {
    const result = await pool.query(
      `INSERT INTO pixel (x_coord, y_coord, color, user_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (x_coord, y_coord) DO UPDATE
       SET color = $3, user_id = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [x, y, color, userId]
    );
    return result.rows[0];
  }

  // Initialize the pixels table
  static async setupTable() {
    const query = `
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
    await pool.query(query);
  }
}

module.exports = Pixel;