# Backend Setup Guide for Testing

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd earena_Backend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Create .env file (if not exists):**
   Create a `.env` file in the `earena_Backend` directory with:
   ```
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/earena
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=http://localhost:5500
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Verify server is running:**
   - You should see: `✅ Server is running on port: 8000`
   - Test API: Open `http://localhost:8000/api/tournaments` in browser

## Frontend Configuration

The frontend (`team-registration.html`) is now configured to:
- **Auto-detect** if running locally and use `http://localhost:8000`
- **Fallback** to deployed backend if not local

## CORS Configuration

Updated CORS to allow:
- All local development origins
- File:// protocol for local HTML files
- Development mode allows all origins

## Troubleshooting

### 1. CORS Errors
- Make sure backend is running on port 8000
- Check browser console for specific CORS error messages
- Verify the API_BASE_URL in frontend matches backend port

### 2. Connection Refused
- Backend server not running
- Wrong port number
- Firewall blocking connection

### 3. MongoDB Connection Issues
- Make sure MongoDB is installed and running
- Check MONGODB_URI in .env file
- For local development, install MongoDB Community Edition

### 4. Authentication Errors
- Make sure JWT_SECRET is set in .env
- Check if user is logged in
- Verify token is being sent in Authorization header

## Testing the Registration Flow

1. Start backend server (`npm run dev`)
2. Open `team-registration.html` in browser
3. Add tournament slug to URL: `?slug=your-tournament-slug`
4. Fill out registration form
5. Click "Register Team (Testing Mode)"
6. Should see success message and redirect to dashboard

## API Endpoints for Testing

- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/slug/{slug}` - Get tournament by slug
- `POST /api/tournaments/{slug}/register` - Register team
- `PATCH /api/teams/{teamId}/approve-testing` - Auto-approve team (testing)