import React, { useState, useEffect } from 'react';
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
      setPixels(prevPixels => [
        ...prevPixels.filter(p => !(p.x_coord === newPixel.x_coord && p.y_coord === newPixel.y_coord)),
        { x_coord: newPixel.x_coord, y_coord: newPixel.y_coord, color: newPixel.color }
      ]);
    });

    return () => {
      socket.off('pixel_updated');
      socket.disconnect();
    };
  }, []); 

  const handlePlacePixel = async (x, y) => {
    const pixelData = { x, y, color: currentColor };
    setError(null);

    // Send request to place pixel
    try {
      await api.post('/grid/pixel', pixelData);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setError(error.response.data.message); 
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