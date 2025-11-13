const Pixel = require('../models/pixel.model');
const PixelLog = require('../models/pixelLog.model');

// Service to handle grid operations
class GridService {
  async getGridState() {
    try {
      const gridState = await Pixel.getState();
      return gridState;
    } catch (error) {
      console.error('Error getting grid state:', error);
      throw new Error('Failed to retrieve grid state');
    }
  }

  // Place a pixel on the grid
  async placePixel(x, y, color, userId, io) { // Accepter io
    if (userId === undefined) {
      throw new Error('User ID is required to place a pixel');
    }
      
    // Log the pixel placement
    try {
      const placedPixel = await Pixel.place(x, y, color, userId);

      const logEntry = new PixelLog({
        x: placedPixel.x_coord,
        y: placedPixel.y_coord,
        color: placedPixel.color,
        user_id: placedPixel.user_id.toString(),
      });

      await logEntry.save();

      // Emit the pixel update event via Socket.io
      io.emit('pixel_updated', placedPixel);

      return placedPixel;
    } catch (error) {
      console.error('Error placing pixel:', error);
      throw new Error('Failed to place pixel');
    }
  }
}

module.exports = new GridService();