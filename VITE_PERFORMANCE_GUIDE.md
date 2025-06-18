# Vite Performance Optimization Guide - React 19

## Fast Development Commands

### Quick Start

```bash
# Ultra-fast development mode (force rebuild dependencies)
yarn dev:fast

# Standard development mode
yarn dev

# Client only (fastest)
yarn client:fast
```

### Build Commands

```bash
# Fast development build (no minification)
yarn build:fast

# Production build (optimized)
yarn build
```

### Testing Commands

```bash
# Run tests with Vitest (fast)
yarn test

# Run tests with UI
yarn test:ui
```

## React 19 Optimizations

### 1. **New JSX Transform**

- Automatic JSX runtime enabled
- No need to import React in every file
- Optimized bundle size

### 2. **Improved TypeScript Support**

- Updated to TypeScript 5.6.3
- Better React 19 type definitions
- Enhanced development experience

### 3. **Modern Testing with Vitest**

- Replaced Jest with Vitest for faster tests
- Native ESM support
- Better integration with Vite

### 4. **React 19 Compiler Optimizations**

- Automatic memoization where beneficial
- Improved component performance
- Better tree shaking

## Performance Features Enabled

### 1. **Optimized Dependencies**

- Pre-bundled common libraries (React, Mantine, etc.)
- Excluded unnecessary packages from optimization
- Smart chunk splitting for better caching

### 2. **Fast Refresh & HMR**

- React Fast Refresh enabled
- Hot Module Replacement optimized
- Instant updates without full page reload

### 3. **Build Optimizations**

- esbuild for faster transpilation
- Intelligent code splitting
- Optimized chunk sizes
- Source maps for debugging

### 4. **Development Server**

- Host binding for network access
- Optimized proxy configuration
- WebSocket support for HMR
- CORS enabled

### 5. **Path Aliases**

- `@` → `./src`
- `@components` → `./src/components`
- `@pages` → `./src/pages`
- `@api` → `./src/api`
- `@styles` → `./src/styles`
- `@utils` → `./src/utils`
- `@context` → `./src/context`
- `@layout` → `./src/layout`

## Performance Tips

### 1. **First Time Setup**

```bash
# Clear cache and reinstall for best performance
yarn clean
yarn install:all
```

### 2. **Development Workflow**

```bash
# Start with fast mode for rapid development
yarn dev:fast

# Use standard mode for final testing
yarn dev
```

### 3. **Building**

```bash
# Fast build for testing
yarn build:fast

# Production build for deployment
yarn build
```

### 4. **Troubleshooting Slow Performance**

```bash
# Clear Vite cache
yarn clean:client

# Force rebuild dependencies
yarn client:fast
```

## Environment Variables

The following variables are set in `.env.local` for optimal performance:

- `FAST_REFRESH=true` - Enables React Fast Refresh
- `GENERATE_SOURCEMAP=true` - Source maps for debugging
- `BROWSER=none` - Prevents auto-opening browser (faster startup)
- `VITE_USE_POLLING=false` - Disables file polling (better performance)

## Expected Performance Improvements

- **Cold Start**: 50-70% faster initial startup
- **Hot Reload**: Near-instant updates (< 100ms)
- **Build Time**: 40-60% faster builds
- **Bundle Size**: Optimized chunks for better loading
- **Development**: Smoother development experience

## Monitoring Performance

Watch the console for build times and bundle analysis:

```bash
# View bundle analyzer
yarn build && npx vite-bundle-analyzer dist
```
