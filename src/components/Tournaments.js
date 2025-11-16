import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      // Mock tournament data for development
      const mockTournaments = [
        {
          id: 1,
          slug: 'valorant-champions-2024',
          title: 'Valorant Champions 2024',
          game: 'Valorant',
          status: 'registration_open',
          prizePool: 50000,
          maxTeams: 32,
          participants: [
            { id: 1, name: 'Team Alpha' },
            { id: 2, name: 'Team Beta' },
            { id: 3, name: 'Team Gamma' }
          ],
          tournamentStart: '2024-12-25T10:00:00Z',
          tournamentEnd: '2024-12-27T18:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000'
        },
        {
          id: 2,
          slug: 'cs2-winter-championship',
          title: 'CS2 Winter Championship',
          game: 'Counter-Strike 2',
          status: 'live',
          prizePool: 75000,
          maxTeams: 16,
          participants: [
            { id: 1, name: 'Pro Esports' },
            { id: 2, name: 'Elite Gaming' },
            { id: 3, name: 'Victory Squad' },
            { id: 4, name: 'Thunder Bolts' }
          ],
          tournamentStart: '2024-12-20T09:00:00Z',
          tournamentEnd: '2024-12-22T20:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000'
        },
        {
          id: 3,
          slug: 'dota2-masters-cup',
          title: 'Dota 2 Masters Cup',
          game: 'Dota 2',
          status: 'upcoming',
          prizePool: 100000,
          maxTeams: 24,
          participants: [
            { id: 1, name: 'Immortal Legends' },
            { id: 2, name: 'Divine Warriors' }
          ],
          tournamentStart: '2025-01-15T12:00:00Z',
          tournamentEnd: '2025-01-18T22:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1000'
        },
        {
          id: 4,
          slug: 'league-of-legends-spring-split',
          title: 'League of Legends Spring Split',
          game: 'League of Legends',
          status: 'registration_closed',
          prizePool: 80000,
          maxTeams: 20,
          participants: [
            { id: 1, name: 'Nexus Destroyers' },
            { id: 2, name: 'Rift Masters' },
            { id: 3, name: 'Baron Slayers' },
            { id: 4, name: 'Dragon Hunters' },
            { id: 5, name: 'Minion Crushers' }
          ],
          tournamentStart: '2025-01-05T14:00:00Z',
          tournamentEnd: '2025-01-08T19:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000'
        },
        {
          id: 5,
          slug: 'overwatch-2-grand-prix',
          title: 'Overwatch 2 Grand Prix',
          game: 'Overwatch 2',
          status: 'completed',
          prizePool: 60000,
          maxTeams: 16,
          participants: [
            { id: 1, name: 'Payload Pushers' },
            { id: 2, name: 'Ultimate Heroes' },
            { id: 3, name: 'Point Captains' },
            { id: 4, name: 'Shield Breakers' }
          ],
          tournamentStart: '2024-12-10T11:00:00Z',
          tournamentEnd: '2024-12-12T17:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1000'
        },
        {
          id: 6,
          slug: 'apex-legends-battle-royale',
          title: 'Apex Legends Battle Royale',
          game: 'Apex Legends',
          status: 'registration_open',
          prizePool: 45000,
          maxTeams: 40,
          participants: [
            { id: 1, name: 'Legends United' },
            { id: 2, name: 'Ring Runners' },
            { id: 3, name: 'Third Party Kings' }
          ],
          tournamentStart: '2025-01-20T13:00:00Z',
          tournamentEnd: '2025-01-22T21:00:00Z',
          posterImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1000'
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setTournaments(mockTournaments);
        setLoading(false);
      }, 500);

      // Uncomment below for real API call
      // const response = await axios.get('/api/tournaments');
      // if (response.data.success) {
      //   setTournaments(response.data.data);
      // }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && tournament.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration_open': return 'registration';
      case 'registration_closed': return 'upcoming';
      case 'ongoing': return 'live';
      case 'ended': return 'completed';
      default: return 'upcoming';
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Layout>
      <main>
        {/* Page Header */}
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Browse All Tournaments</h1>
            <p className="page-subtitle">
              Discover and join exciting esports tournaments. Compete with the best players and win amazing prizes.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="filters-section">
          <div className="container">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  id="tournament-search"
                  placeholder="Search tournaments by name or game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Tournaments
              </button>
              <button
                className={`filter-btn ${filter === 'registration_open' ? 'active' : ''}`}
                onClick={() => setFilter('registration_open')}
              >
                Open Registration
              </button>
              <button
                className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
                onClick={() => setFilter('ongoing')}
              >
                Live Now
              </button>
              <button
                className={`filter-btn ${filter === 'ended' ? 'active' : ''}`}
                onClick={() => setFilter('ended')}
              >
                Completed
              </button>
            </div>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="tournaments-section">
          <div className="container">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-trophy"></i>
                <h3>No Tournaments Found</h3>
                <p>
                  {searchTerm 
                    ? `No tournaments match "${searchTerm}"`
                    : 'No tournaments available at the moment'
                  }
                </p>
              </div>
            ) : (
              <div className={`tournaments-grid ${
                filteredTournaments.length === 1 ? 'single-card' : 
                filteredTournaments.length === 2 ? 'two-cards' : 
                'multi-cards'
              }`}>
                {filteredTournaments.map((tournament) => (
                  <Link 
                    key={tournament.slug} 
                    to={`/tournaments/${tournament.slug}`}
                    className="tournament-card"
                  >
                    <div 
                      className="tournament-image"
                      style={{ backgroundImage: `url(${tournament.posterImage || '/t1.jpg'})` }}
                    >
                      <div className={`tournament-status-badge status-${getStatusColor(tournament.status)}`}>
                        {tournament.status?.replace('_', ' ') || 'Upcoming'}
                      </div>
                    </div>
                    
                    <div className="tournament-content">
                      <h3 className="tournament-title">{tournament.title}</h3>
                      <p className="tournament-description">
                        {tournament.description || `Join the ${tournament.game} tournament and compete for amazing prizes!`}
                      </p>
                      
                      <div className="tournament-stats">
                        <div className="stat">
                          <span className="stat-value">₹{tournament.prizePool?.toLocaleString() || '0'}</span>
                          <span className="stat-label">Prize Pool</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{tournament.participants?.length || 0}</span>
                          <span className="stat-label">Teams</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">₹{tournament.entryFee || 0}</span>
                          <span className="stat-label">Entry Fee</span>
                        </div>
                      </div>
                      
                      <div className="tournament-actions">
                        <div className="tournament-button-group">
                          {tournament.status === 'registration_open' && (
                            <button className="btn btn-primary">
                              Register Now
                            </button>
                          )}
                          
                          <button className="btn btn-secondary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Rules Section */}
        <section className="rules-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Tournament Rules & Guidelines</h2>
              <p className="section-subtitle">
                Essential rules and guidelines for fair play and competitive integrity
              </p>
            </div>
            
            <div className="rules-grid">
              <div className="rule-category">
                <div className="rule-header">
                  <div className="rule-icon">
                    <i className="fas fa-gamepad"></i>
                  </div>
                  <h3>Fair Play</h3>
                </div>
                <div className="rule-content">
                  <ul>
                    <li><strong>Anti-Cheat:</strong> Zero tolerance for cheats, hacks, or exploits</li>
                    <li><strong>Match Reporting:</strong> Results must be reported within 30 minutes</li>
                    <li><strong>Disputes:</strong> Report issues within 24 hours of match completion</li>
                  </ul>
                </div>
              </div>
              
              <div className="rule-category">
                <div className="rule-header">
                  <div className="rule-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <h3>Schedule</h3>
                </div>
                <div className="rule-content">
                  <ul>
                    <li><strong>Punctuality:</strong> Be ready 15 minutes before match time</li>
                    <li><strong>No-Show:</strong> 15-minute grace period, then forfeit</li>
                    <li><strong>Roster Lock:</strong> Teams lock 24 hours before tournament</li>
                  </ul>
                </div>
              </div>
              
              <div className="rule-category">
                <div className="rule-header">
                  <div className="rule-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h3>Prizes</h3>
                </div>
                <div className="rule-content">
                  <ul>
                    <li><strong>Distribution:</strong> Payouts within 7-14 business days</li>
                    <li><strong>Eligibility:</strong> Must complete tournament for prizes</li>
                    <li><strong>Tax Responsibility:</strong> Winners handle their own taxes</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="rules-footer">
              <div className="rules-notice">
                <i className="fas fa-info-circle"></i>
                <div>
                  <h4>Important Notice</h4>
                  <p>Tournament rules may vary by specific tournament. Always check individual tournament pages for game-specific rules and additional requirements. Uni Games reserves the right to modify rules and make final decisions on all tournament matters.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            
            <div className="faq-grid">
              {[
                {
                  question: "How do I register for a tournament?",
                  answer: "Click on any tournament card, then click the 'Register' button. You'll need to create or join a team that meets the tournament requirements."
                },
                {
                  question: "What happens if my team doesn't show up for a match?",
                  answer: "Teams that don't show up within 15 minutes of the scheduled match time will forfeit the match. Repeated no-shows may result in tournament bans."
                },
                {
                  question: "Can I substitute players during a tournament?",
                  answer: "Player substitutions are allowed before the tournament starts. Once matches begin, roster changes are not permitted unless approved by tournament administrators."
                },
                {
                  question: "How are tournament brackets determined?",
                  answer: "Brackets are generated based on team registration order and seeding (if applicable). Single elimination and double elimination formats are used depending on the tournament."
                },
                {
                  question: "What if there's a technical issue during my match?",
                  answer: "Report technical issues immediately to tournament administrators. Matches may be paused or rescheduled depending on the severity of the issue."
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
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Tournaments;