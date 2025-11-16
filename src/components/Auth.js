import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import toast from 'react-hot-toast';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Handle login
        const result = await login(data.email, data.password);
        
        if (result.success) {
          toast.success('Welcome back!');
          
          // Redirect based on role
          switch (result.user.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'host':
              navigate('/host');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          toast.error(result.error);
        }
      } else {
        // Handle registration
        const registerData = {
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role || 'user',
          firstName: data.firstName,
          lastName: data.lastName,
          contact_phone: data.phone,
          organization_name: data.organizationName,
          aadhaar_number: data.aadhaarNumber
        };

        const response = await axios.post('/api/register', registerData);
        
        if (response.data.success) {
          toast.success('Registration successful! Please login.');
          setIsLogin(true);
          reset();
        } else {
          throw new Error(response.data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      const message = error.response?.data?.detail || error.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Join Uni Games'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account to start gaming'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-input"
                      placeholder="Enter your first name"
                      {...register('firstName', { 
                        required: !isLogin && 'First name is required'
                      })}
                    />
                    {errors.firstName && (
                      <div className="text-danger mt-1">{errors.firstName.message}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-input"
                      placeholder="Enter your last name"
                      {...register('lastName', { 
                        required: !isLogin && 'Last name is required'
                      })}
                    />
                    {errors.lastName && (
                      <div className="text-danger mt-1">{errors.lastName.message}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    placeholder="Choose a username"
                    {...register('username', { 
                      required: !isLogin && 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                  />
                  {errors.username && (
                    <div className="text-danger mt-1">{errors.username.message}</div>
                  )}
                </div>
              </>
            )}

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

            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <div className="text-danger mt-1">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">Account Type</label>
                  <select
                    id="role"
                    className="form-select"
                    {...register('role')}
                  >
                    <option value="user">Player</option>
                    <option value="host">Tournament Host</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="Enter your phone number"
                    {...register('phone')}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                className="auth-toggle-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;