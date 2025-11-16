import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Import all components
import Home from './components/Home';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import HostDashboard from './components/HostDashboard';
import UserDashboard from './components/UserDashboard';
import Tournaments from './components/Tournaments';
import TournamentDetails from './components/TournamentDetails';
import TournamentBrackets from './components/TournamentBrackets';
import TournamentBracketsView from './components/TournamentBracketsView';
import CreateTournament from './components/CreateTournament';
import TeamRegistration from './components/TeamRegistration';
import TeamDashboard from './components/TeamDashboard';
import TeamManagement from './components/TeamManagement';
import TournamentPayment from './components/TournamentPayment';
import DisputeSupport from './components/DisputeSupport';
import AdminDisputeManagement from './components/AdminDisputeManagement';
import HostRegistration from './components/HostRegistration';
import VenueManagement from './components/VenueManagement';
import TournamentAnalytics from './components/TournamentAnalytics';
import News from './components/News';
import Article from './components/Article';
import UnderConstruction from './components/UnderConstruction';
import Login from './components/Login';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:slug" element={<TournamentDetails />} />
            <Route path="/tournaments/:slug/brackets" element={<TournamentBrackets />} />
            <Route path="/tournaments/:slug/brackets-view" element={<TournamentBracketsView />} />
            <Route path="/tournaments/:slug/register" element={<TeamRegistration />} />
            <Route path="/tournaments/:slug/payment" element={<TournamentPayment />} />
            <Route path="/dispute-support" element={<DisputeSupport />} />
            <Route path="/news" element={<News />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/host-registration" element={<HostRegistration />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/disputes" element={<AdminDisputeManagement />} />
            
            {/* Host Routes */}
            <Route path="/host" element={<HostDashboard />} />
            <Route path="/host/create-tournament" element={<CreateTournament />} />
            <Route path="/host/venues" element={<VenueManagement />} />
            <Route path="/host/analytics" element={<TournamentAnalytics />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/team" element={<TeamDashboard />} />
            <Route path="/team/management" element={<TeamManagement />} />
            
            {/* Utility Routes */}
            <Route path="/under-construction" element={<UnderConstruction />} />
            
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#161329',
                color: '#F0F0F0',
                border: '1px solid rgba(10, 250, 217, 0.2)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;