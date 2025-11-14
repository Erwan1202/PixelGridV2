const { pool } = require('../config/db'); 
const PixelLog = require('../models/pixelLog.model'); 

class GridService {

  static async getGridState() {
    try {
      const result = await pool.query(
        'SELECT x_coord, y_coord, color FROM pixel'
      );
      return result.rows;
    } catch (error) {
      console.error('[GridService] Error in getGridState:', error);
      throw error;
    }
  }

  // 
  static async placePixel(x, y, color, userId) {
    if (userId == null) {
      throw new Error('UserId is required to place a pixel');
    }

    try {
      const pixelQuery = `
        INSERT INTO pixel (x_coord, y_coord, color, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (x_coord, y_coord)
        DO UPDATE SET
          color = EXCLUDED.color,
          user_id = EXCLUDED.user_id
        RETURNING x_coord, y_coord, color, user_id;
      `;

      const pixelResult = await pool.query(pixelQuery, [
        x,
        y,
        color,
        userId,
      ]);

      if (pixelResult.rowCount === 0) {
        throw new Error('Failed to upsert pixel in PostgreSQL');
      }

      const placedPixel = pixelResult.rows[0];


      try {
        await PixelLog.create({
          x,
          y,
          color,
          user_id: userId,
          createdAt: new Date(),
        });
      } catch (logError) {
        console.error(
          '[GridService] Failed to log pixel in MongoDB:',
          logError
        );
      }

      return placedPixel;
    } catch (error) {
      console.error('[GridService] Error in placePixel:', error);
      throw error;
    }
  }
}

module.exports = GridService;
