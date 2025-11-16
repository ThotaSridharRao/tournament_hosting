import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';

// Custom hook for typewriter effect with cycling
const useTypewriter = (text, speed = 100, pauseTime = 2000) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && currentIndex < text.length) {
        // Typing forward
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else if (!isDeleting && currentIndex === text.length) {
        // Pause at end before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentIndex > 0) {
        // Deleting backward
        setDisplayText(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      } else if (isDeleting && currentIndex === 0) {
        // Start typing again
        setIsDeleting(false);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, text, speed, pauseTime]);

  return displayText;
};

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [faqOpen, setFaqOpen] = useState({});
  
  // Typewriter effect for hero title
  const typewriterText = useTypewriter("Challenge your game!", 150, 2000);

  useEffect(() => {
    loadFeaturedTournaments();
    
    // Auto-advance carousel every 4 seconds
    const autoAdvance = setInterval(() => {
      const visibleCards = getVisibleCards();
      const totalCards = 6;
      const maxSlide = totalCards - visibleCards;
      
      setCurrentSlide(prev => {
        if (prev >= maxSlide) {
          return 0; // Reset to beginning
        }
        return prev + 1;
      });
    }, 4000);

    // Handle window resize for carousel
    const handleResize = () => {
      // Reset slide if needed when window resizes
      const visibleCards = getVisibleCards();
      const totalCards = 6;
      if (currentSlide >= totalCards - visibleCards) {
        setCurrentSlide(Math.max(0, totalCards - visibleCards));
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(autoAdvance);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSlide]);

  const loadFeaturedTournaments = async () => {
    try {
      const response = await axios.get('/api/tournaments');
      if (response.data.success) {
        // Get first 3 tournaments for featured section
        setTournaments(response.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 3; // Default for SSR
    if (window.innerWidth >= 1024) return 3; // Always show 3 cards on desktop
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1; // Show only 1 card on mobile screens
  };

  const getProgressPercentage = () => {
    const visibleCards = getVisibleCards();
    const totalCards = 6; // Total number of game cards
    const totalScrollableItems = totalCards - visibleCards;
    return totalScrollableItems > 0 ? (currentSlide / totalScrollableItems) * 100 : 0;
  };

  const nextSlide = () => {
    const visibleCards = getVisibleCards();
    const totalCards = 6;
    if (currentSlide < totalCards - visibleCards) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-video-bg">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            onError={(e) => console.error('Video error:', e)}
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1
            }}
          >
            <source src="/35506-405897842_small.webm" type="video/webm" />
            <source src="/35506-405897842_small.mp4" type="video/mp4" />
            <source src="/assets/35506-405897842_small.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="hero-content-wrapper">
          <div className="hero__content" role="region" aria-label="Hero">
            <h1 id="hero-title" className="tournament-name typewriter">
              {typewriterText}<span className="typewriter-cursor"></span>
            </h1>
            <div id="prize-pool" className="prize-pool">
              Level up your game, win real prizes, and join the ultimate competitive gaming community where champions are made.
            </div>
            
            <div className="hero-buttons">
              <a href="#tournaments" className="btn-primary" id="cta-learn-more">Start Playing Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section fade-in-element">
        <div className="features-grid">
          <div className="feature-item" role="listitem">
            <img src="/assets/gameIcon.png" alt="Play Icon" />
            <h3>Play</h3>
            <p>Compete at your level in the best games. Join ranked matches, climb the leaderboards, and test your skills against top players.</p>
          </div>
          <div className="feature-item" role="listitem">
            <img src="/assets/videoIcon.png" alt="Watch Icon" />
            <h3>Watch</h3>
            <p>Experience the action live. Follow top matches, learn from the best, and stay connected to the competitive scene.</p>
          </div>
          <div className="feature-item" role="listitem">
            <img src="/assets/trophyIcon.png" alt="Win Icon" />
            <h3>Win</h3>
            <p>Earn rewards for your grind. Complete missions, climb the ranks, and get prizes for your performance.</p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="section games-section fade-in-element">
        <div className="games-header">
          <h2 className="games-title">Explore your favourite games on Uni Games</h2>
          <p className="games-subtitle">
            From CS2 and Overwatch 2 to other competitive titles, Uni Games brings players the best gaming experience across supported games.
          </p>
        </div>
        <div className="games-carousel-wrapper">
          <div className="games-carousel">
            <div className="games-track" style={{ transform: `translateX(-${currentSlide * (100 / getVisibleCards())}%)` }}>
              <div className="game-card"><img src="/assets/dota2.webp" alt="Dota 2" /></div>
              <div className="game-card"><img src="/assets/leagueoflegends.webp" alt="League of Legends" /></div>
              <div className="game-card"><img src="/assets/brawlstar.webp" alt="Brawl Stars" /></div>
              <div className="game-card"><img src="/assets/bgmi.webp" alt="PUBG Mobile" /></div>
              <div className="game-card"><img src="/assets/callofduty.webp" alt="Call of Duty" /></div>
              <div className="game-card"><img src="/assets/valorant.webp" alt="Valorant" /></div>
            </div>
          </div>
          <button className="carousel-nav-btn prev-btn" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="carousel-nav-btn next-btn" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <div className="carousel-progress-bar">
          <div id="carousel-progress" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="section container fade-in-element" aria-labelledby="tournaments-heading">
        <h2 id="tournaments-heading">Tournaments</h2>

        {/* Tournament Action Buttons */}
        <div className="tournament-actions">
          <Link to="/tournaments" className="btn btn-secondary tournament-btn">
            <i className="fas fa-trophy"></i>
            See All Tournaments
          </Link>
        </div>

        <div id="tournaments-grid" className={`tournaments-grid ${
          tournaments.length === 1 ? 'single-card' : 
          tournaments.length === 2 ? 'two-cards' : 
          'three-cards'
        }`}>
          {loading ? (
            <div className="section-loader">
              <div className="spinner"></div>
              <p>Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%' }}>No tournaments available.</p>
          ) : (
            tournaments.slice(0, 3).map((tournament) => {
              const finalPoster = tournament.posterImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000';
              const status = tournament.status || 'upcoming';
              const statusText = status.replace(/_/g, ' ').toUpperCase();
              const prizePool = tournament.prizePool ? `₹${tournament.prizePool.toLocaleString()}` : 'TBD';
              const teams = `${tournament.participants?.length || 0}/${tournament.maxTeams}`;
              const startDate = new Date(tournament.tournamentStart);
              const endDate = new Date(tournament.tournamentEnd);
              const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
              const duration = durationDays === 1 ? '1 Day' : `${durationDays} Days`;

              return (
                <Link 
                  key={tournament.slug}
                  to={`/tournaments/${tournament.slug}`}
                  className="tournament-card"
                >
                  <div className={`tournament-status-badge status-${status}`}>{statusText}</div>
                  <div 
                    className="tournament-image" 
                    style={{ backgroundImage: `url('${finalPoster}')` }}
                  ></div>
                  <div className="tournament-content">
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                      {tournament.title}
                    </h3>
                    <div className="tournament-stats">
                      <div className="stat">
                        <span className="stat-value">{prizePool}</span>
                        <span className="stat-label">Prize Pool</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{teams}</span>
                        <span className="stat-label">Teams</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{duration}</span>
                        <span className="stat-label">Duration</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="section news-section fade-in-element">
        <h2 className="news-title">News</h2>
        <div className="news-grid">
          <Link to="/article/a1" className="news-card">
            <img src="https://placehold.co/600x400/161329/F0F0F0?text=Esports+Rise" alt="The Rise of Esports" />
            <div className="news-content">
              <div>
                <p className="news-meta"><span className="league-name">ESPORTS</span> - 15 DEC 2024</p>
                <h3>The Rise of Esports: How Gaming Became a Global Phenomenon</h3>
                <p>From basement tournaments to billion-dollar prize pools - discover how esports transformed into a global entertainment powerhouse.</p>
              </div>
            </div>
          </Link>
          <Link to="/article/a2" className="news-card">
            <img src="/assets/a2.png" alt="About Uni Games" />
            <div className="news-content">
              <div>
                <p className="news-meta"><span className="league-name">ABOUT US</span> - 15 DEC 2024</p>
                <h3>Welcome to Uni Games: Revolutionizing Esports Competition</h3>
                <p>Discover how Uni Games is transforming the competitive gaming landscape with innovative tournaments and community-driven experiences.</p>
              </div>
            </div>
          </Link>
          <Link to="/article/a3" className="news-card">
            <img src="/assets/host_reg.png" alt="Host Registration Guide" />
            <div className="news-content">
              <div>
                <p className="news-meta"><span className="league-name">GUIDE</span> - 14 DEC 2024</p>
                <h3>How to Register as a Host on Uni Games</h3>
                <p>Step-by-step guide to becoming a tournament host and organizing your own competitive gaming events on our platform.</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section faq-section fade-in-element">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          {[
            {
              question: "What do I need to get started?",
              answer: "All you need is an account and the game you want to compete in! Check the specific tournament rules for any additional requirements, but generally, it's that simple to start your competitive journey."
            },
            {
              question: "How are prizes awarded?",
              answer: "Prizes are typically awarded within 7-14 business days after a tournament concludes and results are verified. Winnings are sent via the payment method you have on file in your user account."
            },
            {
              question: "What is the fair play policy?",
              answer: "We have a zero-tolerance policy for cheating, hacking, or any form of unsportsmanlike conduct. All players must adhere to our code of conduct, and we use advanced anti-cheat software to ensure a fair playing field."
            },
            {
              question: "Can I stream my matches?",
              answer: "Absolutely! We encourage players to stream their matches. Just be sure to check the specific tournament rules, as some events may have restrictions or require a stream delay."
            }
          ].map((faq, index) => (
            <div key={index} className={`faq-item ${faqOpen[index] ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.question}</span>
                <i className="fas fa-plus"></i>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;