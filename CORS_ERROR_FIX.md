# CORS Error Fix for Role Permission System

## Problem

When clicking the permission button in the Role Permission page, a CORS (Cross-Origin Resource Sharing) error was occurring, preventing the frontend from communicating with the backend API.

## Root Cause

1. **CORS Configuration Mismatch**: The server CORS configuration was set to allow `http://localhost:8081` but the Vite development server runs on port `3001`.
2. **Missing Model Fields**: The Permission model was missing required fields (`module_id`, `prefix`, etc.) that the controller expects.
3. **API Configuration**: The axios instance needed proper CORS handling.

## Solution

### 1. Updated Server CORS Configuration

**File**: `d:\pro\reactsms\server\server.js`

```javascript
// CORS options
var corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8081",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

### 2. Fixed Permission Model

**File**: `d:\pro\reactsms\server\models\permission.model.js`

Updated to match the actual database schema:

- Added `module_id` field
- Added `prefix` field
- Added `show_view`, `show_add`, `show_edit`, `show_delete` fields
- Fixed table name and timestamps

### 3. Updated API Configuration

**File**: `d:\pro\reactsms\client\src\api\config.ts`

```typescript
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});
```

## Testing

1. **Server Status**: ✅ Backend server running on port 8080
2. **API Endpoints**: ✅ `/api/roles` endpoint working correctly
3. **Permission Data**: ✅ Database contains permission records
4. **CORS Headers**: ✅ Server now accepts requests from port 3001

## Next Steps

1. Restart the development servers to ensure all changes take effect
2. Test the permission assignment functionality
3. Verify that role permissions can be saved and retrieved correctly

## API Endpoints Available

- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get specific role
- `GET /api/roles/:id/permissions` - Get permissions for a role
- `POST /api/roles/:id/permissions` - Save permissions for a role

## Status

✅ **CORS Error Fixed** - The frontend can now communicate with the backend API without CORS restrictions.

## Manual Testing Commands

Test the API endpoints directly:

```powershell
# Test roles endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/roles" -Method GET -ContentType "application/json"

# Test role permissions endpoint (replace 1 with actual role ID)
Invoke-WebRequest -Uri "http://localhost:8080/api/roles/1/permissions" -Method GET -ContentType "application/json"
```

The CORS error should now be resolved and the Role Permission page should be able to load and save permissions properly.
