import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoomDetailsModal from './RoomDetailsModal';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomDetailsMode, setRoomDetailsMode] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Load tournaments
  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tournaments');
      
      if (response.data.success) {
        setTournaments(response.data.data || []);
      } else {
        throw new Error('Failed to load tournaments');
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast.error('Failed to load tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomDetailsMode = () => {
    setRoomDetailsMode(!roomDetailsMode);
  };

  const handleManageRoomDetails = (tournament) => {
    setSelectedTournament(tournament);
    setShowRoomDetailsModal(true);
  };

  const handleRoomDetailsSuccess = () => {
    // Optionally reload tournaments or update state
    toast.success('Room details updated successfully!');
  };

  const handleDeleteTournament = async (tournament) => {
    if (!window.confirm(`Are you sure you want to delete "${tournament.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/tournaments/${tournament.slug}`);
      
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        loadTournaments(); // Reload the list
      } else {
        throw new Error('Failed to delete tournament');
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      const message = error.response?.data?.detail || 'Failed to delete tournament';
      toast.error(message);
    }
  };

  const handleViewBrackets = (tournament) => {
    navigate(`/tournaments/${tournament.slug}/brackets`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || !isAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage tournaments and room details</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="user-info">
              <span className="user-name">Welcome, {user.username}</span>
              <span className="text-muted">({user.role})</span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Management */}
      <div className="tournament-management">
        <div className="section-header">
          <h2 className="section-title">Tournament Management</h2>
          <div className="section-actions">
            <button
              className={`action-btn room-details ${roomDetailsMode ? 'active' : ''}`}
              onClick={handleRoomDetailsMode}
              title={roomDetailsMode ? 'Cancel Room Details' : 'Manage Room Details'}
            >
              <i className={roomDetailsMode ? 'fas fa-times' : 'fas fa-door-open'}></i>
            </button>
          </div>
        </div>

        {/* Tournament List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-trophy"></i>
            <h3>No Tournaments Found</h3>
            <p>Create your first tournament to get started.</p>
          </div>
        ) : (
          <div className="tournament-list">
            {tournaments.map((tournament) => (
              <div 
                key={tournament.slug} 
                className={`tournament-item ${roomDetailsMode ? 'room-details-mode' : ''}`}
              >
                <div className="tournament-info">
                  <div className="tournament-name">{tournament.title}</div>
                  <div className="tournament-game">{tournament.game}</div>
                </div>
                
                <div className="tournament-participants">
                  {tournament.participants?.length || 0} teams
                </div>
                
                <div className="tournament-prize">
                  ₹{tournament.prizePool?.toLocaleString() || 0}
                </div>
                
                <div className="tournament-actions">
                  {roomDetailsMode && (
                    <button
                      className="tournament-action-btn room-details"
                      onClick={() => handleManageRoomDetails(tournament)}
                      title={`Manage Room Details for ${tournament.title}`}
                    >
                      <i className="fas fa-door-open"></i>
                    </button>
                  )}
                  
                  <button
                    className="tournament-action-btn brackets"
                    onClick={() => handleViewBrackets(tournament)}
                    title={`View Brackets for ${tournament.title}`}
                  >
                    <i className="fas fa-sitemap"></i>
                  </button>
                  
                  <button
                    className="tournament-action-btn delete"
                    onClick={() => handleDeleteTournament(tournament)}
                    title={`Delete ${tournament.title}`}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      <RoomDetailsModal
        tournament={selectedTournament}
        isOpen={showRoomDetailsModal}
        onClose={() => setShowRoomDetailsModal(false)}
        onSuccess={handleRoomDetailsSuccess}
      />
    </div>
  );
};

export default AdminDashboard;