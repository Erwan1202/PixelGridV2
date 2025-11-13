const cors = require('cors');

// Configuration CORS options
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true, 
};

module.exports = cors(corsOptions);