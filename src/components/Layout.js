import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, showNavbar = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for styling
      setIsScrolled(currentScrollY > 50);
      
      // Smart navbar logic
      if (currentScrollY < 10) {
        // Always show navbar at the top
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navbar
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!showNavbar) {
    return <>{children}</>;
  }

  return (
    <div>
      {/* Navigation */}
      <nav className={`nav-normal ${isScrolled ? 'nav-scrolled' : ''} ${!isNavVisible ? 'nav-hidden' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo">
            <img src="/assets/ug.png" alt="Uni Games" style={{ height: '60px' }} />
          </Link>
          
          <div className={`nav-center ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
              <li><Link to="/dispute-support">Support</Link></li>
              <li><Link to="/news">News</Link></li>
            </ul>
            
            <div className="auth-buttons">
              {user ? (
                <div id="user-menu" className="d-flex align-items-center gap-3">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">{user.username}</span>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-primary">
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'host' && (
                    <Link to="/host" className="btn btn-primary">
                      Host Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'user' && (
                    <Link to="/dashboard" className="btn btn-primary">
                      Dashboard
                    </Link>
                  )}
                  
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <div id="guest-menu">
                  <Link to="/auth" className="btn btn-primary">Join Us</Link>
                </div>
              )}
            </div>
          </div>
          
          <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: showNavbar ? '80px' : '0' }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column footer-brand">
              <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/assets/ug.png" alt="Uni Games" style={{ height: '80px', width: 'auto' }} />
                Uni Games
              </Link>
              <p>The ultimate destination for competitive gaming.</p>
              <div className="social-links">
                <button type="button" aria-label="Twitter"><i className="fab fa-twitter"></i></button>
                <button type="button" aria-label="Discord"><i className="fab fa-discord"></i></button>
                <button type="button" aria-label="Instagram"><i className="fab fa-instagram"></i></button>
                <button type="button" aria-label="Youtube"><i className="fab fa-youtube"></i></button>
              </div>
            </div>
            <div className="footer-column">
              <h4>Tournaments</h4>
              <ul>
                <li><Link to="/tournaments">Browse All</Link></li>
                <li><Link to="/tournaments?filter=live">Live Matches</Link></li>
                <li><Link to="/tournaments?filter=upcoming">Upcoming</Link></li>
                <li><Link to="/tournaments?filter=completed">Past Results</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Community</h4>
              <ul>
                <li><button type="button">Discord</button></li>
                <li><button type="button">Forums</button></li>
                <li><Link to="/dispute-support">Support</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><button type="button">About</button></li>
                <li><button type="button">Contact</button></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Uni Games. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;