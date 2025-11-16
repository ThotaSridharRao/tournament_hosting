# Tournament Platform - React Version

A modern React-based admin dashboard for managing tournaments with room details functionality.

## 🚀 Features

- **Admin Dashboard**: Manage tournaments with a clean, modern interface
- **Room Details Management**: Add room IDs, passwords, and match times for tournaments
- **Tournament Brackets**: View tournament information and room details
- **Real-time Updates**: Automatic refresh and real-time data updates
- **Responsive Design**: Works on desktop and mobile devices
- **Authentication**: Secure admin login system

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the React version folder:**
   ```bash
   cd react_version
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - The app will automatically connect to the backend at `https://t2-237c.onrender.com`

## 🔐 Login Credentials

Use these admin credentials to access the dashboard:
- **Email:** `t.shridher@gmail.com`
- **Password:** `SridharS24`

## 📱 How to Use

### Admin Dashboard

1. **Login** with admin credentials
2. **View Tournaments** - See all tournaments with participant counts and prize pools
3. **Manage Room Details:**
   - Click the green door icon to enter room details mode
   - Click on individual tournament room detail buttons
   - Fill out the room details form (round, match time, room ID, password)
   - Submit to save room details

### Tournament Brackets

1. **View Brackets** - Click the brackets icon on any tournament
2. **See Room Details** - Room details automatically appear if they exist
3. **Refresh** - Use the refresh button to check for new room details

## 🏗️ Project Structure

```
react_version/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AdminDashboard.js     # Main admin dashboard
│   │   ├── RoomDetailsModal.js   # Room details form modal
│   │   ├── TournamentBrackets.js # Tournament brackets view
│   │   └── Login.js              # Admin login page
│   ├── contexts/
│   │   └── AuthContext.js        # Authentication context
│   ├── App.js                    # Main app component
│   ├── App.css                   # App-specific styles
│   ├── index.js                  # React entry point
│   └── index.css                 # Global styles
├── package.json
└── README.md
```

## 🎯 Key Components

### AdminDashboard
- Main dashboard interface
- Tournament list with management actions
- Room details mode toggle
- Delete and view brackets functionality

### RoomDetailsModal
- Form for adding room details
- Validation and error handling
- Success notifications
- Integration with backend API

### TournamentBrackets
- Tournament information display
- Room details viewer
- Participant list
- Auto-refresh functionality

### AuthContext
- Authentication state management
- API configuration
- Token handling
- User session management

## 🔧 API Integration

The React app integrates with the backend API:

- **Authentication:** `/api/auth/login`
- **Tournaments:** `/api/tournaments`
- **Room Details:** `/api/tournaments/{slug}/room-details`

All API calls are handled through Axios with automatic token management.

## 🎨 Styling

- **CSS Variables** for consistent theming
- **Responsive Design** with mobile-first approach
- **Modern UI** with glassmorphism effects
- **Consistent Color Scheme** matching the original design

## 🚀 Production Build

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🔄 Development vs Production

- **Development:** Connects to `https://t2-237c.onrender.com`
- **Production:** Uses the same backend URL
- **Proxy:** Configured in package.json for development

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎉 Success!

The React version provides a modern, maintainable alternative to the HTML/CSS/JS version with:

- ✅ Component-based architecture
- ✅ State management with React hooks
- ✅ Form validation with react-hook-form
- ✅ Toast notifications
- ✅ Responsive design
- ✅ TypeScript-ready structure
- ✅ Production-ready build process

## 🔗 Backend Integration

This React app works seamlessly with the existing backend API that we tested earlier. All room details functionality is fully operational!