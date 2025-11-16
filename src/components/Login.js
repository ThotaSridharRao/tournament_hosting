import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && isAdmin()) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        if (result.user.role === 'admin') {
          toast.success('Welcome back, Admin!');
          navigate('/admin');
        } else {
          toast.error('Admin access required');
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-3">
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-secondary))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Login
          </h1>
          <p className="text-muted">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <div className="text-danger mt-1">{errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.password && (
              <div className="text-danger mt-1">{errors.password.message}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Demo Credentials:<br />
            Email: t.shridher@gmail.com<br />
            Password: SridharS24
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;