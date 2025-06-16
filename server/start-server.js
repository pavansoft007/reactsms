const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

console.log("🚀 Starting School Management System Server...");

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000", 
    "http://127.0.0.1:3001"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-access-token',
    'Origin',
    'X-Requested-With',
    'Accept'
  ]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get("/", (req, res) => {
  res.json({ 
    message: "School Management System API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Test database connection before starting full server
async function startServer() {
  try {
    console.log("📊 Testing database connection...");
    
    // Try to initialize database
    const db = require("./models");
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection successful");
    
    // Sync database
    await db.sequelize.sync();
    console.log("✅ Database synchronized");
    
    // Load routes only after database is ready
    console.log("📋 Loading API routes...");
    require("./routes/auth.routes")(app);
    require("./routes/branch.routes")(app);
    // Add other routes as needed
    
    console.log("✅ API routes loaded");
    
  } catch (error) {
    console.warn("⚠️  Database connection failed:", error.message);
    console.log("🔄 Starting server without database (limited functionality)");
    
    // Add basic auth route for testing without database
    app.post("/api/auth/login", (req, res) => {
      res.status(500).json({
        success: false,
        message: "Database not available. Please check database configuration.",
        error: "DB_CONNECTION_FAILED"
      });
    });
  }
  
  const PORT = process.env.PORT || 8080;
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log("🎯 Ready to accept requests!");
  });
}

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Start the server
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error.message);
  process.exit(1);
});
