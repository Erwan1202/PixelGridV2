import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { socket } from '../services/socket';

const GRID_SIZE = 50;
const COOLDOWN_MS = 30 * 1000; // 30s (aligné avec serveur)

// Grid component
const Grid = () => {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [error, setError] = useState(null);
  const [lastPlacedAt, setLastPlacedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [hoverCell, setHoverCell] = useState(null); // {x,y}
  const [placing, setPlacing] = useState(false);
  const [recentKeys, setRecentKeys] = useState(new Set()); // pour animation

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
  const updatePixelState = (pixel, animate = false) => {
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
    if (animate) {
      const key = `${pixel.x_coord}-${pixel.y_coord}`;
      setRecentKeys((prev) => new Set(prev).add(key));
      setTimeout(() => {
        setRecentKeys((prev) => {
          const copy = new Set(prev);
          copy.delete(key);
          return copy;
        });
      }, 650); // durée anim
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
      }
      updatePixelState(newPixel, true);
    });

    return () => {
      socket.off('pixel_updated');
      socket.disconnect();
    };
  }, []);

  // Handle placing a pixel
  // Mise à jour du timestamp courant pour cooldown affichage
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cooldownRemaining = lastPlacedAt
    ? Math.max(0, COOLDOWN_MS - (now - lastPlacedAt))
    : 0;
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
  const isCooldown = cooldownRemaining > 0;

  const handlePlacePixel = async (x, y) => {
    if (placing) return; // éviter spam
    if (isCooldown) return; // cooldown actif

    const pixelData = { x: x, y: y, color: currentColor };
    const key = `${x}-${y}`;
    setError(null);
    setPlacing(true);

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
      setLastPlacedAt(Date.now());
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
    setPlacing(false);
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
            onMouseEnter={() => setHoverCell({ x, y })}
            onMouseLeave={() => setHoverCell((prev) => (prev && prev.x === x && prev.y === y ? null : prev))}
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
      <div className="toolbar" aria-label="contrôles de placement">
        <div className="color-picker">
          <label style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Couleur</label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            aria-label="Choisir la couleur"
          />
        </div>
        <div className="cooldown-badge" aria-live="polite">
          {isCooldown ? `Cooldown: ${cooldownSeconds}s` : 'Prêt à placer'}
        </div>
        {placing && <div className="hint" style={{ minWidth: '90px' }}>Placement...</div>}
      </div>

      {error && <p style={{ color: 'var(--danger)', fontWeight: 500 }}>{error}</p>}

      <div
        className="pixel-grid-container"
        onMouseLeave={() => setHoverCell(null)}
        role="grid"
        aria-label="Grille de pixels"
      >
        {renderGridCells()}
        {hoverCell && !isCooldown && (
          <div
            className="pixel-preview"
            style={{ '--x': hoverCell.x, '--y': hoverCell.y, '--color': currentColor }}
          ></div>
        )}
        {pixels.map((pixel, index) => {
          const key = `${pixel.x_coord}-${pixel.y_coord}`;
          const cls = `pixel${recentKeys.has(key) ? ' updating' : ''}`;
          return (
            <div
              key={index}
              className={cls}
              style={{
                '--x': pixel.x_coord,
                '--y': pixel.y_coord,
                '--color': pixel.color,
              }}
            ></div>
          );
        })}
      </div>
      <p className="hint">Cliquez sur une case pour placer un pixel. Un pixel toutes les 30s.</p>
    </div>
  );
};

export default Grid;
