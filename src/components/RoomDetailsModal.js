import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

const RoomDetailsModal = ({ tournament, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        `/api/tournaments/${tournament.slug}/room-details`,
        {
          round: data.round,
          matchTime: data.matchTime,
          roomId: data.roomId,
          password: data.password || null
        }
      );

      if (response.data.success) {
        toast.success('Room details added successfully! Players will see this information when they refresh the brackets page.');
        reset();
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to add room details');
      }
    } catch (error) {
      console.error('Room details error:', error);
      const message = error.response?.data?.detail || error.message || 'Failed to add room details';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-door-open"></i> Room Details: {tournament?.title}
          </h3>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleClose}
            title="Close"
          >
            &times;
          </button>
        </div>

        <div className="mb-3" style={{
          padding: '1rem',
          background: 'rgba(40, 167, 69, 0.1)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: '#28a745' }}></i>
            Add room details for each round. Players will see this information when they refresh the brackets page.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="round" className="form-label">Round/Match Name</label>
            <input
              type="text"
              id="round"
              className="form-input"
              placeholder="e.g., Round 1, Quarterfinals, Group A Match, etc."
              {...register('round', { 
                required: 'Round name is required',
                minLength: { value: 1, message: 'Round name cannot be empty' }
              })}
            />
            {errors.round && (
              <div className="text-danger mt-1">{errors.round.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="matchTime" className="form-label">Match Time</label>
            <input
              type="datetime-local"
              id="matchTime"
              className="form-input"
              {...register('matchTime', { 
                required: 'Match time is required'
              })}
            />
            {errors.matchTime && (
              <div className="text-danger mt-1">{errors.matchTime.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="roomId" className="form-label">Room ID</label>
            <input
              type="text"
              id="roomId"
              className="form-input"
              placeholder="e.g., 123456789, ABCD-EFGH-IJKL"
              {...register('roomId', { 
                required: 'Room ID is required',
                minLength: { value: 1, message: 'Room ID cannot be empty' }
              })}
            />
            {errors.roomId && (
              <div className="text-danger mt-1">{errors.roomId.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password (Optional)</label>
            <input
              type="text"
              id="password"
              className="form-input"
              placeholder="Room/Match password"
              {...register('password')}
            />
          </div>

          <div className="d-flex gap-2 mt-3">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Adding...
                </>
              ) : (
                'Add Room Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomDetailsModal;