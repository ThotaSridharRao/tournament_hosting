import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeamDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load tournaments
      const tournamentsResponse = await axios.get('/api/tournaments');
      if (tournamentsResponse.data.success) {
        setTournaments(tournamentsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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

      <div className="main-content">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="page-title">Team Dashboard</h1>
          <p className="page-subtitle">Manage your teams and tournament registrations</p>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="main-column">
            {/* Team Overview */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-users"></i>
                  My Teams
                </h2>
                <Link to="/team/management" className="btn btn-primary">
                  <i className="fas fa-plus"></i>
                  Create Team
                </Link>
              </div>
              
              {teams.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <h3>No Teams Created</h3>
                  <p>Create your first team to start participating in tournaments</p>
                  <Link to="/team/management" className="btn btn-primary">
                    <i className="fas fa-plus"></i>
                    Create Your First Team
                  </Link>
                </div>
              ) : (
                <div className="teams-grid">
                  {teams.map((team, index) => (
                    <div key={index} className="team-card">
                      <div className="team-header">
                        <div className="team-avatar">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="team-info">
                          <h3>{team.name}</h3>
                          <p>{team.game}</p>
                        </div>
                      </div>
                      
                      <div className="team-stats">
                        <div className="stat">
                          <span className="stat-label">Members</span>
                          <span className="stat-value">{team.members?.length || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Tournaments</span>
                          <span className="stat-value">{team.tournaments || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Wins</span>
                          <span className="stat-value">{team.wins || 0}</span>
                        </div>
                      </div>
                      
                      <div className="team-actions">
                        <Link to={`/team/${team.id}`} className="btn btn-primary">
                          <i className="fas fa-cog"></i>
                          Manage
                        </Link>
                        <button className="btn btn-secondary">
                          <i className="fas fa-chart-line"></i>
                          Stats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournament Registrations */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-trophy"></i>
                  Tournament Registrations
                </h2>
              </div>
              
              <div className="empty-state">
                <i className="fas fa-trophy"></i>
                <h3>No Tournament Registrations</h3>
                <p>Register your teams for tournaments to see them here</p>
                <Link to="/tournaments" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                  Browse Tournaments
                </Link>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-gamepad"></i>
                  Recent Matches
                </h2>
              </div>
              
              <div className="empty-state">
                <i className="fas fa-gamepad"></i>
                <h3>No Recent Matches</h3>
                <p>Your team's match history will appear here</p>
              </div>
            </div>
          </div>

          <div className="sidebar-column">
            {/* Quick Actions */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-bolt"></i>
                  Quick Actions
                </h2>
              </div>
              
              <div className="quick-actions">
                <Link to="/team/management" className="action-item">
                  <i className="fas fa-plus"></i>
                  <span>Create New Team</span>
                </Link>
                <Link to="/tournaments" className="action-item">
                  <i className="fas fa-trophy"></i>
                  <span>Browse Tournaments</span>
                </Link>
                <Link to="/dashboard" className="action-item">
                  <i className="fas fa-user"></i>
                  <span>Player Dashboard</span>
                </Link>
                <Link to="/dispute-support" className="action-item">
                  <i className="fas fa-headset"></i>
                  <span>Support</span>
                </Link>
              </div>
            </div>

            {/* Team Statistics */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-chart-bar"></i>
                  Team Statistics
                </h2>
              </div>
              
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Total Teams</span>
                  <span className="stat-value">{teams.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Registrations</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Matches Played</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Win Rate</span>
                  <span className="stat-value">0%</span>
                </div>
              </div>
            </div>

            {/* Available Tournaments */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-trophy"></i>
                  Open Tournaments
                </h2>
              </div>
              
              {tournaments.filter(t => t.status === 'registration_open').length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-trophy"></i>
                  <h4>No Open Tournaments</h4>
                  <p>Check back soon for new tournaments</p>
                </div>
              ) : (
                <div className="tournament-list">
                  {tournaments
                    .filter(t => t.status === 'registration_open')
                    .slice(0, 3)
                    .map((tournament) => (
                      <div key={tournament.slug} className="tournament-item">
                        <div className="tournament-info">
                          <h4>{tournament.title}</h4>
                          <p className="tournament-game">
                            <i className="fas fa-gamepad"></i>
                            {tournament.game}
                          </p>
                          <div className="tournament-meta">
                            <span className="prize">
                              <i className="fas fa-trophy"></i>
                              ₹{tournament.prizePool?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="tournament-actions">
                          <Link 
                            to={`/tournaments/${tournament.slug}/register`}
                            className="btn btn-primary btn-sm"
                          >
                            Register
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeamDashboard;