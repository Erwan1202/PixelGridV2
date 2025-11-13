import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { socket } from '../services/socket';
import './Grid.css';

const GRID_SIZE = 50;

// Grid component
const Grid = () => {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [error, setError] = useState(null);

  const optimisticPixels = useRef(new Map());

  // Fetch the grid pixels from the server
  const fetchGrid = async () => {
    try {
      const response = await api.get('/grid');
      const validPixels = response.data.filter(
        (p) =>
          p.x_coord >= 1 &&
          p.x_coord <= GRID_SIZE &&
          p.y_coord >= 1 &&
          p.y_coord <= GRID_SIZE
      );
      setPixels(validPixels);
    } catch (error) {
      console.error('Erreur fetchGrid:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update pixel state from a "server" or "socket" pixel
  const updatePixelState = (pixel) => {
    setPixels((prevPixels) => {
      const filtered = prevPixels.filter(
        (p) => !(p.x_coord === pixel.x_coord && p.y_coord === pixel.y_coord)
      );
      return [
        ...filtered,
        {
          x_coord: pixel.x_coord,
          y_coord: pixel.y_coord,
          color: pixel.color,
        },
      ];
    });
  };

  // Setup Socket.IO listeners
  useEffect(() => {
    fetchGrid();
    socket.connect();
    socket.on('pixel_updated', (newPixel) => {
      const key = `${newPixel.x_coord}-${newPixel.y_coord}`;

      if (optimisticPixels.current.has(key)) {
        optimisticPixels.current.delete(key);
      }

      updatePixelState(newPixel);
    });

    return () => {
      socket.off('pixel_updated');
      socket.disconnect();
    };
  }, []);

  // Handle placing a pixel
  const handlePlacePixel = async (x, y) => {
    const pixelData = { x: x, y: y, color: currentColor };
    const key = `${x}-${y}`;
    setError(null);

    // Optimistic UI: update locally BEFORE server response
    setPixels((prevPixels) => {
      const oldPixel =
        prevPixels.find(
          (p) => p.x_coord === x && p.y_coord === y
        ) || null;

      optimisticPixels.current.set(key, oldPixel);

      const filtered = prevPixels.filter(
        (p) => !(p.x_coord === x && p.y_coord === y)
      );

      return [
        ...filtered,
        {
          x_coord: x,
          y_coord: y,
          color: currentColor,
        },
      ];
    });

    try {
      await api.post('/grid/pixel', pixelData);
    } catch (error) {
      console.error('Erreur placePixel:', error);

      const originalPixel = optimisticPixels.current.get(key);

      // Rollback: restore the original pixel (or remove if there wasn't one)
      setPixels((prevPixels) => {
        const filtered = prevPixels.filter(
          (p) => !(p.x_coord === x && p.y_coord === y)
        );
        if (originalPixel) {
          return [...filtered, originalPixel];
        }
        return filtered;
      });

      optimisticPixels.current.delete(key);

      // Handle rate limit error specifically
      if (error.response && error.response.status === 429) {
        const errorMsg =
          error.response.data?.message?.message ||
          error.response.data?.message ||
          'Rate limit exceeded';
        setError(errorMsg);
      } else {
        setError('Erreur lors du placement du pixel.');
      }
    }
  };

  // Render grid cells
  const renderGridCells = () => {
    const cells = [];
    for (let y = 1; y <= GRID_SIZE; y++) {
      for (let x = 1; x <= GRID_SIZE; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            className="grid-cell"
            style={{ '--x': x, '--y': y }}
            onClick={() => handlePlacePixel(x, y)}
          ></div>
        );
      }
    }
    return cells;
  };

  if (loading) {
    return <div>Chargement de la grille...</div>;
  }

  // Main render
  return (
    <div className="App">
      <div className="color-picker">
        <label>Couleur :</label>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="pixel-grid-container">
        {renderGridCells()}
        {pixels.map((pixel, index) => (
          <div
            key={index}
            className="pixel"
            style={{
              '--x': pixel.x_coord,
              '--y': pixel.y_coord,
              '--color': pixel.color,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
