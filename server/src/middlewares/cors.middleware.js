const cors = require('cors');

// Configuration CORS options
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true, 
};

module.exports = cors(corsOptions);