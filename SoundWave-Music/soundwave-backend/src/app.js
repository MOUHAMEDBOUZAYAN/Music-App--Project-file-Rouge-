const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import middleware
const {
  corsConfig,
  securityHeaders,
  requestLogger,
  performanceLogger,
  generalLimiter,
  errorHandler,
  notFound
} = require('./middleware');

// Load environment variables
dotenv.config();

// Set default environment variables if not provided
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soundwave';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'Mouhamed12@';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

console.log('🔧 Configuration JWT dans app.js:', {
  JWT_SECRET: process.env.JWT_SECRET.substring(0, 10) + '...',
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  NODE_ENV: process.env.NODE_ENV
});


// Connect to database (optional for now)
try {
  connectDB();
} catch (error) {
  console.log('⚠️  Database connection failed, continuing without database...');
  console.log('💡 To fix: Install MongoDB and set MONGODB_URI in .env file');
}

const app = express();

// Middleware de sécurité et CORS
app.use(securityHeaders);
app.use(corsConfig);

// Middleware de limitation de taux général
app.use(generalLimiter);

// Middleware de logging
app.use(requestLogger);
app.use(performanceLogger);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static serving for uploads (audio/images)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SoundWave API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/auth/spotify', require('./routes/spotify.routes'));
app.use('/api/spotify', require('./routes/spotify.routes')); // Routes Spotify publiques
// app.use('/api/deezer', require('./routes/deezer.routes')); // Routes Deezer proxy (removed)
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/songs', require('./routes/song.routes'));
app.use('/api/playlists', require('./routes/playlist.routes'));
app.use('/api/albums', require('./routes/album.routes'));
app.use('/api/artists', require('./routes/artist.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/social', require('./routes/social.routes'));
app.use('/api/favorites', require('./routes/favorites.routes'));


// Routes 404 - doit être placé avant le middleware d'erreur
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.listen(PORT, () => {
  console.log('\n🚀 SoundWave Music Server Status:');
  console.log('✅ Server is running on PORT', PORT);
  console.log('📡 API available at http://localhost:' + PORT);
  console.log('🔗 CORS enabled for:', CORS_ORIGIN);
  console.log('🌍 Environment:', NODE_ENV);
  console.log('⏰ Started at:', new Date().toLocaleString());
  console.log('🎵 SoundWave Music API Ready!\n');
}); 