const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS to allow credentials and specify allowed origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Session middleware with improved settings
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'ubereats_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax' // Allows cookies in same-site context and following links from external sites
  }
};

// Use session middleware
app.use(session(sessionConfig));

// Add session debugging middleware
app.use((req, res, next) => {
  // Debug session info on each request
  const sessionInfo = req.session ? {
    id: req.session.id,
    userId: req.session.userId,
    userRole: req.session.userRole,
    cookie: req.session.cookie
  } : 'No session';
  
  console.log(`[${req.method}] ${req.url} - Session:`, sessionInfo);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);


// Home route
app.get('/', (req, res) => {
  res.send('UberEATS API is running');
});

// Debug route to check session state
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionExists: !!req.session,
    userId: req.session?.userId || null,
    userRole: req.session?.userRole || null
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api-docs for API documentation`);
});