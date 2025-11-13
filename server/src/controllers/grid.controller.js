const GridService = require('../services/grid.service');

// Controller for grid operations
class GridController {
  // Get the current state of the grid  
  async getGrid(req, res) {
    try {
      const gridState = await GridService.getGridState();
      res.status(200).json(gridState);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Place a pixel on the grid
  async placePixel(req, res) {
    try {
      const { x, y, color } = req.body;
      const userId = req.user?.id;
      const io = req.app.get('io'); 

      // Check authenticated user
      const user = req.user;

      if (!user || !user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = user.id;

      if (x === undefined || y === undefined || color === undefined) {
        return res.status(400).json({ message: 'x, y, and color are required' });
      }

      const placedPixel = await GridService.placePixel(x, y, color, userId, io);
      res.status(201).json(placedPixel);
    } catch (error) {
      console.error('Error in placePixel controller:', error);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new GridController();
