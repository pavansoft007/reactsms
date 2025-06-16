const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { errorHandler, notFoundHandler, auditLogger } = require("./middleware");
const logger = require("./utils/logger");

// Load environment variables
dotenv.config();

const app = express();

// CORS options
var corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8081",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for development - change to false in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-access-token',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Security middleware
app.use(helmet());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Standard middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Audit logging for all requests
app.use(auditLogger);

// Database
const db = require("./models");

// Development: Force sync (drop tables if they exist)
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
//   initial();
// });

// Production: Normal sync
db.sequelize.sync();

// Simple route
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the Multi SMS API.",
    documentation: "/api-docs"
  });
});

// CORS test endpoint
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working correctly!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint  
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "School Management System API Documentation"
}));

// Import routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/student.routes")(app);
require("./routes/branch.routes")(app);
require("./routes/class.routes")(app);
require("./routes/section.routes")(app);
require("./routes/fee.routes")(app);
require("./routes/feeType.routes")(app);
require("./routes/roleGroup.routes")(app);
require("./routes/role.routes")(app);
require("./routes/subject.routes")(app);
const admissionRoutes = require('./routes/admission.routes');
app.use('/api/admission', admissionRoutes);
require("./routes/studentCategory.routes")(app); // Add this line
require("./routes/schoolyear.routes")(app); // Registering schoolyear.routes.js
require("./routes/attachment.routes")(app); // Registering attachment.routes.js

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res, next) {
    if (req.url.startsWith('/api') || req.url.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Set port and listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize roles function
function initial() {
  db.role.create({
    id: 1,
    name: "user",
    prefix: "user",
    is_system: "1"
  });
 
  db.role.create({
    id: 2,
    name: "admin",
    prefix: "admin",
    is_system: "1"
  });
  
  db.role.create({
    id: 3,
    name: "teacher",
    prefix: "teacher",
    is_system: "1"
  });
}
