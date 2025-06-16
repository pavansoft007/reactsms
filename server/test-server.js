const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

console.log("Starting server test...");
console.log("Environment variables:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- DB_NAME:", process.env.DB_NAME);

const app = express();

// Basic CORS for testing
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
});

// Test auth route (without database)
app.post("/api/auth/test-login", (req, res) => {
  res.json({
    success: true,
    message: "Login endpoint is reachable",
    body: req.body
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Test server is running on http://localhost:${PORT}`);
  console.log(`Test the following URLs:`);
  console.log(`- http://localhost:${PORT}/`);
  console.log(`- http://localhost:${PORT}/api/test`);
  console.log(`- POST http://localhost:${PORT}/api/auth/test-login`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
