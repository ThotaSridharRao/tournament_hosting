import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [userTournaments, setUserTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load all tournaments
      const tournamentsResponse = await axios.get('/api/tournaments');
      if (tournamentsResponse.data.success) {
        setTournaments(tournamentsResponse.data.data);
      }

      // Load user's tournaments (if endpoint exists)
      try {
        const userTournamentsResponse = await axios.get('/api/user/tournaments');
        if (userTournamentsResponse.data.success) {
          setUserTournaments(userTournamentsResponse.data.data);
        }
      } catch (error) {
        // User tournaments endpoint might not exist, that's okay
        console.log('User tournaments not available');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const openTournaments = tournaments.filter(t => t.status === 'registration_open');
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing');

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

      <div className="main-content">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="page-title">Player Dashboard</h1>
          <p className="page-subtitle">Track your tournaments, teams, and gaming achievements</p>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="main-column">
            {/* Quick Stats */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-chart-line"></i>
                  Quick Stats
                </h2>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{userTournaments.length}</div>
                    <div className="stat-label">Tournaments Joined</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Teams</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Wins</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">₹0</div>
                    <div className="stat-label">Earnings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-clock"></i>
                  Recent Activity
                </h2>
              </div>
              
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="activity-content">
                    <h4>Welcome to Uni Games!</h4>
                    <p>Your account has been created successfully. Start exploring tournaments!</p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
                
                {userTournaments.length === 0 && (
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="activity-content">
                      <h4>No recent activity</h4>
                      <p>Join your first tournament to see activity here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Available Tournaments */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-trophy"></i>
                  Available Tournaments
                </h2>
                <Link to="/tournaments" className="btn btn-primary">
                  View All
                </Link>
              </div>
              
              {tournaments.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-trophy"></i>
                  <h3>No Tournaments Available</h3>
                  <p>Check back soon for exciting tournaments!</p>
                </div>
              ) : (
                <div className="tournament-list">
                  {tournaments.slice(0, 3).map((tournament) => (
                    <div key={tournament.slug} className="tournament-item">
                      <div className="tournament-image">
                        <img 
                          src={tournament.posterImage || '/t1.jpg'} 
                          alt={tournament.title}
                          onError={(e) => { e.target.src = '/t1.jpg'; }}
                        />
                      </div>
                      <div className="tournament-info">
                        <h3>{tournament.title}</h3>
                        <p className="tournament-game">
                          <i className="fas fa-gamepad"></i>
                          {tournament.game}
                        </p>
                        <div className="tournament-meta">
                          <span className="prize">
                            <i className="fas fa-trophy"></i>
                            ₹{tournament.prizePool?.toLocaleString()}
                          </span>
                          <span className="entry-fee">
                            <i className="fas fa-ticket-alt"></i>
                            ₹{tournament.entryFee || 0}
                          </span>
                        </div>
                      </div>
                      <div className="tournament-status">
                        <span className={`status-badge status-${tournament.status?.replace('_', '-') || 'upcoming'}`}>
                          {tournament.status?.replace('_', ' ') || 'Upcoming'}
                        </span>
                      </div>
                      <div className="tournament-actions">
                        <Link 
                          to={`/tournaments/${tournament.slug}`}
                          className="btn btn-secondary"
                        >
                          View Details
                        </Link>
                        {tournament.status === 'registration_open' && (
                          <Link 
                            to={`/tournaments/${tournament.slug}/register`}
                            className="btn btn-primary"
                          >
                            Register
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-column">
            {/* User Profile Card */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-user"></i>
                  Profile
                </h2>
              </div>
              
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="user-avatar">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="profile-info">
                  <h3>{user.username}</h3>
                  <p className="user-email">{user.email}</p>
                  <span className="user-role">{user.role}</span>
                </div>
                <div className="profile-actions">
                  <Link to="/team" className="btn btn-primary">
                    <i className="fas fa-users"></i>
                    Manage Teams
                  </Link>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-bolt"></i>
                  Quick Actions
                </h2>
              </div>
              
              <div className="quick-actions">
                <Link to="/tournaments" className="action-item">
                  <i className="fas fa-trophy"></i>
                  <span>Browse Tournaments</span>
                </Link>
                <Link to="/team/management" className="action-item">
                  <i className="fas fa-users"></i>
                  <span>Create Team</span>
                </Link>
                <Link to="/team" className="action-item">
                  <i className="fas fa-cog"></i>
                  <span>Team Dashboard</span>
                </Link>
                <Link to="/dispute-support" className="action-item">
                  <i className="fas fa-headset"></i>
                  <span>Support</span>
                </Link>
              </div>
            </div>

            {/* Tournament Tips */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-lightbulb"></i>
                  Tips & Guides
                </h2>
              </div>
              
              <div className="tips-list">
                <div className="tip-item">
                  <h4>Getting Started</h4>
                  <p>Create or join a team to participate in tournaments</p>
                </div>
                <div className="tip-item">
                  <h4>Team Strategy</h4>
                  <p>Practice with your team before tournament matches</p>
                </div>
                <div className="tip-item">
                  <h4>Tournament Rules</h4>
                  <p>Always read tournament rules before registering</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;