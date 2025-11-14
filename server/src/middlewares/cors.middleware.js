const cors = require('cors');

// Configuration CORS options
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
];

module.exports = cors(corsOptions);