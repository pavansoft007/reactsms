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
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8081"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Security middleware
app.use(helmet());

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
