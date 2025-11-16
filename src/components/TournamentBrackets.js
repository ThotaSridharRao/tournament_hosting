import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TournamentBrackets = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState(null);
  const [roomDetails, setRoomDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  useEffect(() => {
    loadTournamentData();
    loadRoomDetails();
  }, [slug]);

  const loadTournamentData = async () => {
    try {
      const response = await axios.get(`/api/tournaments/slug/${slug}`);
      
      if (response.data.success || response.data.data) {
        setTournament(response.data.data);
      } else {
        throw new Error('Tournament not found');
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      toast.error('Tournament not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadRoomDetails = async () => {
    try {
      const response = await axios.get(`/api/tournaments/${slug}/room-details`);
      
      if (response.data.success) {
        const details = response.data.data || [];
        setRoomDetails(details);
        
        // Auto-show room details if they exist
        if (details.length > 0) {
          setShowRoomDetails(true);
        }
      }
    } catch (error) {
      console.error('Error loading room details:', error);
      // Don't show error for room details as they might not exist
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
        <p>Loading tournament brackets...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="empty-state" style={{ minHeight: '100vh' }}>
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Tournament Not Found</h3>
        <p>The requested tournament could not be found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-3">
        <button 
          className="btn btn-secondary mb-2"
          onClick={() => navigate('/')}
          style={{ alignSelf: 'flex-start' }}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-secondary))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {tournament.title}
        </h1>
        <p className="text-muted">Tournament Brackets & Match Schedule</p>
      </div>

      {/* Tournament Info */}
      <div className="card mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3>Tournament Information</h3>
            <p className="text-muted mb-2">Game: {tournament.game}</p>
            <p className="text-muted mb-2">Participants: {tournament.participants?.length || 0} teams</p>
            <p className="text-muted">Prize Pool: ₹{tournament.prizePool?.toLocaleString() || 0}</p>
          </div>
          
          {roomDetails.length > 0 && (
            <button
              className="btn btn-success"
              onClick={() => setShowRoomDetails(!showRoomDetails)}
            >
              <i className="fas fa-door-open"></i>
              {showRoomDetails ? 'Hide' : 'Show'} Room Details
            </button>
          )}
        </div>
      </div>

      {/* Room Details */}
      {showRoomDetails && roomDetails.length > 0 && (
        <div className="card mb-3" style={{
          background: 'rgba(40, 167, 69, 0.1)',
          border: '1px solid var(--color-success)'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 style={{ color: 'var(--color-success)' }}>
              <i className="fas fa-door-open"></i>
              Room Details
            </h3>
            <button
              className="close-btn"
              onClick={() => setShowRoomDetails(false)}
              title="Close"
            >
              &times;
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {roomDetails.map((detail, index) => (
              <div
                key={detail.id || index}
                style={{
                  padding: '1rem',
                  background: 'rgba(15, 133, 211, 0.1)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--primary-color)'
                }}
              >
                <h5 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--primary-color)', 
                  fontSize: '1rem' 
                }}>
                  {detail.round}
                </h5>
                <p style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  <i className="fas fa-clock"></i> {formatDateTime(detail.matchTime)}
                </p>
                <p style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  <i className="fas fa-door-open"></i> Room ID: <strong>{detail.roomId}</strong>
                </p>
                {detail.password && (
                  <p style={{ 
                    margin: '0', 
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <i className="fas fa-key"></i> Password: <strong>{detail.password}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brackets Section */}
      <div className="card">
        <h3 className="mb-3">Tournament Brackets</h3>
        
        {tournament.participants?.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users-slash"></i>
            <h4>No Teams Registered</h4>
            <p>Brackets will be generated once teams register for this tournament.</p>
          </div>
        ) : (
          <div>
            <h4 className="mb-3">Registered Teams ({tournament.participants?.length || 0})</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {tournament.participants?.map((participant, index) => (
                <div
                  key={index}
                  className="card"
                  style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                >
                  <h5 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    {participant.teamName}
                  </h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                    {participant.players?.length || 0} players
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh room details */}
      <div className="text-center mt-3">
        <button
          className="btn btn-secondary"
          onClick={loadRoomDetails}
        >
          <i className="fas fa-sync-alt"></i>
          Refresh Room Details
        </button>
      </div>
    </div>
  );
};

export default TournamentBrackets;