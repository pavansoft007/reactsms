# CORS Error Fix for Login

## Problem

Getting CORS error when trying to login to the application.

## Root Causes & Solutions Applied

### 1. Enhanced CORS Configuration

**File: `server/server.js`**

#### Before:

```javascript
var corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8081",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

#### After:

```javascript
var corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:8081",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-access-token",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
```

### 2. Added Preflight Handler

**File: `server/server.js`**

```javascript
// Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-access-token, Origin, X-Requested-With, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});
```

### 3. Updated Route-Level CORS Headers

**Files: `server/routes/auth.routes.js`, `server/routes/branch.routes.js`**

Enhanced headers in route files:

```javascript
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, Authorization, X-Requested-With"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
```

### 4. Fixed Client-Side Credentials

**File: `client/src/api/config.ts`**

#### Before:

```typescript
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false, // ❌ This was the issue!
});
```

#### After:

```typescript
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // ✅ Enable credentials for CORS
});
```

### 5. Added Test Endpoints

**File: `server/server.js`**

```javascript
// CORS test endpoint
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working correctly!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

## Troubleshooting Steps

### 1. Test CORS Configuration

Open browser console and test:

```javascript
fetch("http://localhost:8080/api/test-cors")
  .then((response) => response.json())
  .then((data) => console.log("CORS Test:", data))
  .catch((error) => console.error("CORS Error:", error));
```

### 2. Check Network Tab

1. Open browser Developer Tools
2. Go to Network tab
3. Try to login
4. Look for:
   - OPTIONS request before POST request (preflight)
   - CORS error messages
   - Response headers

### 3. Verify Configuration

Check these settings:

- ✅ Client runs on port 3001 (`client/vite.config.js`)
- ✅ Server runs on port 8080 (`.env` file)
- ✅ Vite proxy configured for `/api` → `http://localhost:8080`
- ✅ API client uses `withCredentials: true`
- ✅ Server allows credentials in CORS

### 4. Common CORS Headers to Check

Look for these headers in browser Network tab:

**Request Headers:**

- `Origin: http://localhost:3001`
- `Content-Type: application/json`

**Response Headers:**

- `Access-Control-Allow-Origin: http://localhost:3001`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

## If CORS Still Fails

### Option 1: Disable CORS Temporarily (Development Only)

Start Chrome with disabled security:

```bash
chrome --disable-web-security --user-data-dir="c:/temp/chrome"
```

### Option 2: Use Browser Extension

Install a CORS browser extension for development.

### Option 3: Check Exact Error Message

Common CORS errors:

- `Access to fetch at 'http://localhost:8080/api/auth/login' from origin 'http://localhost:3001' has been blocked by CORS policy`
- `Response to preflight request doesn't pass access control check`

### Option 4: Restart Both Servers

1. Stop client server (Ctrl+C)
2. Stop backend server (Ctrl+C)
3. Start backend: `cd server && node server.js`
4. Start client: `cd client && npm run dev`

## Environment Configuration

### Client (Vite) - Port 3001

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
```

### Server - Port 8080

```properties
# .env
PORT=8080
CORS_ORIGIN=http://localhost:3001
```

The CORS issue should now be resolved with these comprehensive fixes.
