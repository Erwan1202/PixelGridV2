import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import api from '../../services/api';
import './Grid.css';

const GRID_SIZE = 50;

// Grid component to display and interact with the pixel grid
const Grid = () => {
  const [grid, setGrid] = useState(
    Array(GRID_SIZE * GRID_SIZE).fill('#FFFFFF')
  );
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [error, setError] = useState(null);

  const updatePixelState = (pixel) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const index = pixel.y_coord * GRID_SIZE + pixel.x_coord;
      if (index >= 0 && index < newGrid.length) {
        newGrid[index] = pixel.color;
      }
      return newGrid;
    });
  };

  // Fetch initial grid and set up socket listeners
  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const response = await api.get('/grid');
        const initialGrid = Array(GRID_SIZE * GRID_SIZE).fill('#FFFFFF');
        response.data.forEach((pixel) => {
          const index = pixel.y_coord * GRID_SIZE + pixel.x_coord;
          initialGrid[index] = pixel.color;
        });
        setGrid(initialGrid);
      } catch (err) {
        console.error('Failed to fetch grid', err);
      }
    };

    fetchGrid();

    // Set up Socket.IO connection and listeners
    socket.connect();
    socket.on('pixel_updated', (pixel) => {
      updatePixelState(pixel);
    });

    return () => {
      socket.off('pixel_updated');
      socket.disconnect();
    };
  }, []);

  // Handle pixel click to place a pixel
  const handlePixelClick = async (index) => {
    setError(null);
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);

    // Send request to place pixel
    try {
      await api.post('/grid/pixel', { x, y, color: selectedColor });
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError('Rate limit: Please wait before placing another pixel.');
      } else {
        setError('Failed to place pixel.');
      }
    }
  };

  return (
    <div>
      <div className="grid-container">
        {grid.map((color, index) => (
          <div
            key={index}
            className="pixel"
            style={{ backgroundColor: color }}
            onClick={() => handlePixelClick(index)}
          />
        ))}
      </div>
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="color-picker"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Grid;