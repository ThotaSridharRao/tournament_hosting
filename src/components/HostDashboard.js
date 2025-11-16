import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const HostDashboard = () => {
  const { user, logout, isHost } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalParticipants: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isHost() && user.role !== 'admin') {
      toast.error('Host access required');
      navigate('/auth');
      return;
    }
    
    loadHostData();
  }, [user, isHost, navigate]);

  const loadHostData = async () => {
    try {
      // Load host tournaments
      const response = await axios.get('/api/host/tournaments');
      if (response.data.success) {
        const hostTournaments = response.data.data;
        setTournaments(hostTournaments);
        
        // Calculate stats
        const totalParticipants = hostTournaments.reduce((sum, t) => sum + (t.participants?.length || 0), 0);
        const totalRevenue = hostTournaments.reduce((sum, t) => sum + ((t.participants?.length || 0) * (t.entryFee || 0)), 0);
        
        setStats({
          totalTournaments: hostTournaments.length,
          activeTournaments: hostTournaments.filter(t => t.status === 'ongoing' || t.status === 'registration_open').length,
          totalParticipants,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error loading host data:', error);
      // If host endpoints don't exist, load regular tournaments
      try {
        const response = await axios.get('/api/tournaments');
        if (response.data.success) {
          setTournaments(response.data.data);
        }
      } catch (fallbackError) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournament) => {
    if (!window.confirm(`Are you sure you want to delete "${tournament.title}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/tournaments/${tournament.slug}`);
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        loadHostData();
      }
    } catch (error) {
      toast.error('Failed to delete tournament');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || (!isHost() && user.role !== 'admin')) {
    return null;
  }

  return (
    <Layout>
      {/* Loader */}
      {loading && (
        <div id="loader-wrapper">
          <dotlottie-wc 
            src="https://lottie.host/embed/a1eb6e2e-5e8c-4b2e-8b5e-2c5e8b5e2c5e/animation.json" 
            autoplay 
            loop 
            style={{ width: '200px', height: '200px' }}
          ></dotlottie-wc>
        </div>
      )}

      <div className="min-h-screen bg-dark-matter text-starlight">
        {/* Header */}
        <header className="bg-dark-panel/80 backdrop-blur-cyber border-b border-cyber-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-2xl font-bold text-cyber-cyan">
                  Uni Games
                </Link>
                <div className="hidden md:block">
                  <span className="text-starlight-muted">Host Dashboard</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/host/create-tournament"
                  className="bg-cyber-cyan text-dark-matter px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Tournament
                </Link>
                
                <div className="flex items-center space-x-2 bg-dark-panel/50 px-3 py-2 rounded-full border border-cyber-border">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyber-cyan to-cyber-indigo rounded-full flex items-center justify-center text-dark-matter font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'H'}
                  </div>
                  <span className="text-starlight font-medium">{user.username}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="text-starlight-muted hover:text-red-400 transition-colors duration-300"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-starlight mb-2">
              Welcome back, {user.username}!
            </h1>
            <p className="text-starlight-muted text-lg">
              Manage your tournaments and track performance from your host dashboard
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass rounded-xl p-6 hover:cyber-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-starlight-muted text-sm font-medium">Total Tournaments</p>
                  <p className="text-3xl font-bold text-cyber-cyan">{stats.totalTournaments}</p>
                </div>
                <div className="w-12 h-12 bg-cyber-cyan/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-trophy text-cyber-cyan text-xl"></i>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 hover:cyber-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-starlight-muted text-sm font-medium">Active Tournaments</p>
                  <p className="text-3xl font-bold text-green-400">{stats.activeTournaments}</p>
                </div>
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-play-circle text-green-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 hover:cyber-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-starlight-muted text-sm font-medium">Total Participants</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 hover:cyber-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-starlight-muted text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-yellow-400">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-coins text-yellow-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Management */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-starlight">My Tournaments</h2>
              <Link 
                to="/host/create-tournament"
                className="bg-cyber-cyan text-dark-matter px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Tournament
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-cyber-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-trophy text-cyber-cyan text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-starlight mb-2">No Tournaments Yet</h3>
                <p className="text-starlight-muted mb-6">Create your first tournament to get started</p>
                <Link 
                  to="/host/create-tournament"
                  className="bg-cyber-cyan text-dark-matter px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Tournament
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tournaments.map((tournament) => (
                  <div key={tournament.slug} className="bg-dark-panel/50 rounded-lg p-4 border border-cyber-border hover:border-cyber-cyan transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-starlight mb-1">{tournament.title}</h3>
                        <p className="text-starlight-muted mb-2">{tournament.game}</p>
                        <div className="flex items-center space-x-4 text-sm text-starlight-muted">
                          <span>
                            <i className="fas fa-users mr-1"></i>
                            {tournament.participants?.length || 0} teams
                          </span>
                          <span>
                            <i className="fas fa-trophy mr-1"></i>
                            ₹{tournament.prizePool?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tournament.status === 'registration_open' ? 'bg-green-400/20 text-green-400' :
                          tournament.status === 'ongoing' ? 'bg-blue-400/20 text-blue-400' :
                          tournament.status === 'ended' ? 'bg-gray-400/20 text-gray-400' :
                          'bg-yellow-400/20 text-yellow-400'
                        }`}>
                          {tournament.status?.replace('_', ' ')}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/tournaments/${tournament.slug}`}
                            className="w-8 h-8 bg-gray-600/50 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors duration-300"
                            title="View Tournament"
                          >
                            <i className="fas fa-eye text-xs"></i>
                          </Link>
                          
                          <Link 
                            to={`/tournaments/${tournament.slug}/brackets`}
                            className="w-8 h-8 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan rounded-lg flex items-center justify-center transition-colors duration-300"
                            title="Manage Brackets"
                          >
                            <i className="fas fa-sitemap text-xs"></i>
                          </Link>
                          
                          <Link 
                            to={`/host/analytics?tournament=${tournament.slug}`}
                            className="w-8 h-8 bg-green-400/20 hover:bg-green-400/30 text-green-400 rounded-lg flex items-center justify-center transition-colors duration-300"
                            title="View Analytics"
                          >
                            <i className="fas fa-chart-line text-xs"></i>
                          </Link>
                          
                          <button
                            className="w-8 h-8 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded-lg flex items-center justify-center transition-colors duration-300"
                            onClick={() => handleDeleteTournament(tournament)}
                            title="Delete Tournament"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-starlight mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/host/create-tournament"
                className="bg-dark-panel/50 rounded-lg p-4 border border-cyber-border hover:border-cyber-cyan hover:bg-dark-panel transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-cyber-cyan/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-cyber-cyan/30 transition-colors duration-300">
                  <i className="fas fa-plus text-cyber-cyan text-xl"></i>
                </div>
                <h3 className="font-semibold text-starlight mb-1">Create Tournament</h3>
                <p className="text-starlight-muted text-sm">Set up a new gaming tournament</p>
              </Link>
              
              <Link 
                to="/host/venues"
                className="bg-dark-panel/50 rounded-lg p-4 border border-cyber-border hover:border-cyber-cyan hover:bg-dark-panel transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-400/30 transition-colors duration-300">
                  <i className="fas fa-map-marker-alt text-blue-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-starlight mb-1">Manage Venues</h3>
                <p className="text-starlight-muted text-sm">Add and manage tournament venues</p>
              </Link>
              
              <Link 
                to="/host/analytics"
                className="bg-dark-panel/50 rounded-lg p-4 border border-cyber-border hover:border-cyber-cyan hover:bg-dark-panel transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-400/30 transition-colors duration-300">
                  <i className="fas fa-chart-bar text-green-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-starlight mb-1">View Analytics</h3>
                <p className="text-starlight-muted text-sm">Track tournament performance</p>
              </Link>
              
              <Link 
                to="/dispute-support"
                className="bg-dark-panel/50 rounded-lg p-4 border border-cyber-border hover:border-cyber-cyan hover:bg-dark-panel transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-400/30 transition-colors duration-300">
                  <i className="fas fa-headset text-yellow-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-starlight mb-1">Support Center</h3>
                <p className="text-starlight-muted text-sm">Get help and manage disputes</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default HostDashboard;