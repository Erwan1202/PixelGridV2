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
      const validPixels = response.data.filter(p => 
        p.x_coord >= 1 && p.x_coord <= GRID_SIZE &&
        p.y_coord >= 1 && p.y_coord <= GRID_SIZE
      );
      setPixels(validPixels);
    } catch (error) {
      console.error("Erreur fetchGrid:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup Socket.IO listeners
  useEffect(() => {
    fetchGrid();
    socket.connect();

    socket.on('pixel_updated', (newPixel) => {
      const key = `${newPixel.x_coord}-${newPixel.y_coord}`;
      if (optimisticPixels.current.has(key)) {
        optimisticPixels.current.delete(key);
        return; 
      }
      updatePixelState(newPixel);
    });

    return () => {
      socket.off('pixel_updated');
      socket.disconnect();
    };
  }, []); 

  const updatePixelState = (pixel, isOptimistic = false) => {
    const key = `${pixel.x_coord}-${pixel.y_coord}`;

    if (isOptimistic) {
      const originalPixel = pixels.find(p => p.x_coord === pixel.x_coord && p.y_coord === pixel.y_coord);
      optimisticPixels.current.set(key, originalPixel || { ...pixel, color: '#FFFFFF' });
    }

    setPixels(prevPixels => [
      ...prevPixels.filter(p => !(p.x_coord === pixel.x_coord && p.y_coord === pixel.y_coord)),
      { x_coord: pixel.x_coord, y_coord: pixel.y_coord, color: pixel.color }
    ]);
  };

  const handlePlacePixel = async (x, y) => {
    const pixelData = { x: x, y: y, color: currentColor };
    const key = `${x}-${y}`;
    setError(null);

    updatePixelState({ x_coord: x, y_coord: y, color: currentColor }, true);

    try {
      await api.post('/grid/pixel', pixelData);
    } catch (error) {
      const originalPixel = optimisticPixels.current.get(key);
      if (originalPixel) {
        setPixels(prevPixels => [
          ...prevPixels.filter(p => !(p.x_coord === originalPixel.x_coord && p.y_coord === originalPixel.y_coord)),
          originalPixel
        ]);
        optimisticPixels.current.delete(key);
      }

      if (error.response && error.response.status === 429) {
        setError(error.response.data.message.message); 
      } else {
        console.error("Erreur placePixel:", error);
        setError("Erreur lors du placement du pixel.");
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
              '--color': pixel.color
            }}
          >
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;