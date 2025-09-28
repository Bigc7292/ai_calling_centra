# Running AI Calling Center Services

## Overview
The AI Calling Center is a monorepo project with separate frontend and backend services. Each service must be run from its respective directory.

## Project Structure
```
ai_calling_centra/
├── apps/
│   └── frontend/          # Next.js frontend application
├── services/
│   └── core-api/          # Express.js backend API
├── docs/                  # Documentation files
└── scripts/               # Utility scripts
```

## Running the Frontend

### Directory
```bash
cd apps/frontend
```

### Development Mode
```bash
# Install dependencies (if not already done)
npm install

# Run frontend in development mode
npm run dev
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Access
- **Development**: http://localhost:3010
- **Production**: http://localhost:3010 (default port)

## Running the Backend API

### Directory
```bash
cd services/core-api
```

### Development Mode
```bash
# Install dependencies (if not already done)
npm install

# Run backend API in development mode with auto-reload
npm run dev
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Access
- **Development**: http://localhost:3001
- **Production**: http://localhost:3001

## Running Both Services Simultaneously

### Using PNPM Workspaces (Recommended)
From the root directory:
```bash
# Install all dependencies
pnpm install

# Run both services in development mode
pnpm dev:all
```

This command will run both the frontend (port 3010) and backend API (port 3001) simultaneously.

### Manual Method
1. Open two terminal windows
2. In the first terminal:
   ```bash
   cd apps/frontend
   npm run dev
   ```
3. In the second terminal:
   ```bash
   cd services/core-api
   npm run dev
   ```

## Environment Variables

### Frontend (.env.local)
Located in `apps/frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
Located in `services/core-api/.env` or root `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Health Checks

### Backend API
```bash
curl http://localhost:3001/health
```
Expected response: `{"ok":true}`

### Frontend
Open browser and navigate to http://localhost:3010

## Troubleshooting

### Port Conflicts
If ports are already in use:
- Frontend: Change port in `apps/frontend/package.json` scripts
- Backend: Set PORT environment variable

### Dependency Issues
If you encounter dependency issues:
```bash
# Clean install from root
pnpm install --force

# Or install individually
cd apps/frontend && npm install
cd services/core-api && npm install
```

### Environment Variables Not Loading
1. Ensure `.env` files are in the correct directories
2. Verify variable names match expected values
3. Restart services after changing environment variables

## Logs and Monitoring

### Viewing Logs
Each service will output logs to its respective terminal:
- Frontend: Next.js development server logs
- Backend: Express.js application logs

### Common Log Messages
- `[core-api] listening on 3001` - Backend API started successfully
- `✓ Ready in Xs` - Frontend started successfully
- Database connection messages
- Authentication middleware logs

## Stopping Services
- **PNPM Workspaces**: Press `Ctrl+C` in the terminal where `pnpm dev:all` is running
- **Manual Method**: Press `Ctrl+C` in each terminal window

## Support
For issues with running services, check:
1. Port availability
2. Environment variable configuration
3. Dependency installation
4. Database connectivity