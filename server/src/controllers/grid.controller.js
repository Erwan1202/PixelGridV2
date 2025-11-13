const GridService = require('../services/grid.service');

// Controller for grid operations
class GridController {
  // GET /api/grid
  async getGrid(req, res) {
    try {
      const gridState = await GridService.getGridState();
      return res.status(200).json(gridState);
    } catch (error) {
      console.error('Error in getGrid:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/grid/pixel
  async placePixel(req, res) {
    try {
      const { x, y, color } = req.body;

      // User injected by checkJwt
      const user = req.user;

      if (!user || !user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = user.id;

      if (x === undefined || y === undefined || color === undefined) {
        return res
          .status(400)
          .json({ message: 'x, y, and color are required' });
      }

      console.log('[GridController] placePixel called with:', {
        x,
        y,
        color,
        userId,
      });

      const placedPixel = await GridService.placePixel(x, y, color, userId);

      console.log('[GridController] placePixel result from service:', placedPixel);

      if (!placedPixel) {
        // Nothing to do if the service did not return a pixel
        return res
          .status(500)
          .json({ message: 'Failed to place pixel (no result from service)' });
      }

      // event emission via Socket.io
      const io = req.app.get('io');
      if (io) {
        const payload = {
          x_coord:
            placedPixel.x_coord ??
            placedPixel.x ??
            placedPixel.xCoord ??
            null,
          y_coord:
            placedPixel.y_coord ??
            placedPixel.y ??
            placedPixel.yCoord ??
            null,
          color: placedPixel.color,
          user_id: placedPixel.user_id ?? placedPixel.userId ?? null,
        };

        console.log('[GridController] Emitting pixel_updated with:', payload);

        io.emit('pixel_updated', payload);
      }

      return res.status(201).json(placedPixel);
    } catch (error) {
      console.error('Error in placePixel:', error);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new GridController();
