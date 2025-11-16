import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';
import { format } from 'date-fns';

const TournamentDetails = () => {
  const { slug } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    loadTournament();
  }, [slug]);

  const loadTournament = async () => {
    try {
      const response = await axios.get(`/api/tournaments/slug/${slug}`);
      if (response.data.success || response.data.data) {
        setTournament(response.data.data);
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return dateString;
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div id="loader-wrapper">
          <dotlottie-wc 
            src="https://lottie.host/embed/a1eb6e2e-5e8c-4b2e-8b5e-2c5e8b5e2c5e/animation.json" 
            autoplay 
            loop 
            style={{ width: '200px', height: '200px' }}
          ></dotlottie-wc>
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="empty-state" style={{ minHeight: '50vh' }}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Tournament Not Found</h3>
          <p>The requested tournament could not be found.</p>
          <Link to="/tournaments" className="btn btn-primary">
            Back to Tournaments
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main>
        {/* Tournament Hero */}
        <section 
          className="tournament-hero"
          style={{ backgroundImage: `url(${tournament.posterImage || '/t1.jpg'})` }}
        >
          <div className="container">
            <div className="hero-content">
              <h1 className="tournament-title">{tournament.title}</h1>
              
              <div className="hero-actions">
                {tournament.status === 'registration_open' && (
                  <Link 
                    to={`/tournaments/${tournament.slug}/register`}
                    className="btn-primary"
                  >
                    <i className="fas fa-user-plus"></i>
                    Register Now
                  </Link>
                )}
                
                {(tournament.status === 'ongoing' || tournament.status === 'ended') && (
                  <Link 
                    to={`/tournaments/${tournament.slug}/brackets`}
                    className="btn-primary"
                  >
                    <i className="fas fa-sitemap"></i>
                    View Brackets
                  </Link>
                )}
                
                <Link to="/tournaments" className="btn-secondary">
                  <i className="fas fa-arrow-left"></i>
                  Back to Tournaments
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tournament Details */}
        <section className="tournament-details">
          <div className="container">
            <div className="details-grid">
              <div className="details-main">
                <h2>Tournament Overview</h2>
                <div id="tournament-overview">
                  <p>
                    {tournament.description || `Welcome to the ${tournament.title}! This is an exciting ${tournament.game} tournament where teams compete for glory and amazing prizes. Join us for intense matches, skilled gameplay, and unforgettable moments.`}
                  </p>
                  <p>
                    Our tournament features a competitive format designed to showcase the best teams and players. 
                    Whether you're a seasoned pro or an aspiring competitor, this tournament offers an excellent 
                    opportunity to test your skills against top-tier opponents.
                  </p>
                </div>

                <h3>Tournament Format</h3>
                <div id="tournament-format-details">
                  <p>
                    This tournament follows a structured format to ensure fair and exciting competition:
                  </p>
                  <ul>
                    <li><strong>Registration Phase:</strong> Teams register and submit their rosters</li>
                    <li><strong>Group Stage:</strong> Teams compete in round-robin groups</li>
                    <li><strong>Playoffs:</strong> Top teams advance to single-elimination brackets</li>
                    <li><strong>Finals:</strong> Championship match with live streaming</li>
                  </ul>
                  <p>
                    All matches will be played according to official game rules and tournament regulations. 
                    Match schedules will be announced after registration closes.
                  </p>
                </div>
              </div>

              <div className="details-sidebar">
                <div className="info-card">
                  <h3><i className="fas fa-info-circle"></i> Tournament Info</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Game</span>
                      <span className="info-value">{tournament.game}</span>
                    </li>
                    <li>
                      <span className="info-label">Prize Pool</span>
                      <span className="info-value">₹{tournament.prizePool?.toLocaleString()}</span>
                    </li>
                    <li>
                      <span className="info-label">Entry Fee</span>
                      <span className="info-value">₹{tournament.entryFee || 0}</span>
                    </li>
                    <li>
                      <span className="info-label">Max Teams</span>
                      <span className="info-value">{tournament.maxTeams}</span>
                    </li>
                    <li>
                      <span className="info-label">Team Size</span>
                      <span className="info-value">{tournament.maxPlayersPerTeam || 5} players</span>
                    </li>
                    <li>
                      <span className="info-label">Status</span>
                      <span className="info-value">{tournament.status?.replace('_', ' ')}</span>
                    </li>
                  </ul>
                </div>

                <div className="info-card">
                  <h3><i className="fas fa-calendar-alt"></i> Schedule</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Registration Opens</span>
                      <span className="info-value">{formatDate(tournament.registrationStart)}</span>
                    </li>
                    <li>
                      <span className="info-label">Registration Closes</span>
                      <span className="info-value">{formatDate(tournament.registrationEnd)}</span>
                    </li>
                    <li>
                      <span className="info-label">Tournament Starts</span>
                      <span className="info-value">{formatDate(tournament.tournamentStart)}</span>
                    </li>
                    <li>
                      <span className="info-label">Tournament Ends</span>
                      <span className="info-value">{formatDate(tournament.tournamentEnd)}</span>
                    </li>
                  </ul>
                </div>

                <div className="info-card">
                  <h3><i className="fas fa-users"></i> Participants</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Registered Teams</span>
                      <span className="info-value">{tournament.participants?.length || 0}</span>
                    </li>
                    <li>
                      <span className="info-label">Available Spots</span>
                      <span className="info-value">{tournament.maxTeams - (tournament.participants?.length || 0)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard/Finalists Section */}
        <section className="leaderboard-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Tournament Finalists</h2>
              <p className="section-subtitle">
                Top performing teams in this tournament
              </p>
            </div>

            {tournament.status === 'ended' ? (
              <div className="finalists-table-container">
                <table className="finalists-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Rank</th>
                      <th>Team Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1st</td>
                      <td>Champions Team</td>
                      <td>5th</td>
                      <td>Rising Stars</td>
                    </tr>
                    <tr>
                      <td>2nd</td>
                      <td>Runner-ups</td>
                      <td>6th</td>
                      <td>Dark Horses</td>
                    </tr>
                    <tr>
                      <td>3rd</td>
                      <td>Bronze Medalists</td>
                      <td>7th</td>
                      <td>Underdogs</td>
                    </tr>
                    <tr>
                      <td>4th</td>
                      <td>Semi-finalists</td>
                      <td>8th</td>
                      <td>Wildcards</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-finalists">
                <i className="fas fa-trophy"></i>
                <h3>Tournament Results Pending</h3>
                <p>Finalists will be displayed here once the tournament concludes.</p>
              </div>
            )}
          </div>
        </section>

        {/* Schedule Section */}
        <section className="schedule-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Tournament Schedule</h2>
              <p className="section-subtitle">
                Key dates and milestones for this tournament
              </p>
            </div>

            <div className="schedule-table-container">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={tournament.status === 'registration_open' ? 'current-row' : 'completed-row'}>
                    <td>Registration Opens</td>
                    <td>{formatDate(tournament.registrationStart)}</td>
                    <td>
                      {new Date() >= new Date(tournament.registrationStart) ? 'Completed' : 'Upcoming'}
                    </td>
                  </tr>
                  <tr className={tournament.status === 'registration_closed' ? 'current-row' : ''}>
                    <td>Registration Closes</td>
                    <td>{formatDate(tournament.registrationEnd)}</td>
                    <td>
                      {new Date() >= new Date(tournament.registrationEnd) ? 'Completed' : 'Upcoming'}
                    </td>
                  </tr>
                  <tr className={tournament.status === 'ongoing' ? 'current-row' : ''}>
                    <td>Tournament Begins</td>
                    <td>{formatDate(tournament.tournamentStart)}</td>
                    <td>
                      {tournament.status === 'ongoing' ? 'Live Now' : 
                       new Date() >= new Date(tournament.tournamentStart) ? 'Completed' : 'Upcoming'}
                    </td>
                  </tr>
                  <tr>
                    <td>Tournament Ends</td>
                    <td>{formatDate(tournament.tournamentEnd)}</td>
                    <td>
                      {tournament.status === 'ended' ? 'Completed' : 'Upcoming'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Get answers to common questions about this tournament
              </p>
            </div>

            <div className="faq-grid">
              {[
                {
                  question: "What are the system requirements for this tournament?",
                  answer: "Players must have a stable internet connection and meet the minimum system requirements for the game. Specific requirements will be shared with registered teams."
                },
                {
                  question: "How are matches scheduled?",
                  answer: "Match schedules are created after registration closes. Teams will be notified of their match times at least 24 hours in advance through email and the platform."
                },
                {
                  question: "What happens if a player disconnects during a match?",
                  answer: "Teams have a 10-minute window to reconnect disconnected players. If unable to reconnect, the match may continue with fewer players or be rescheduled based on tournament rules."
                },
                {
                  question: "How are prizes distributed?",
                  answer: "Prizes are distributed within 7 business days after tournament completion. Winners must provide valid payment information and may need to complete tax documentation."
                },
                {
                  question: "Can I change my team roster after registration?",
                  answer: "Roster changes are allowed up to 24 hours before the tournament starts. After that, no changes are permitted except in exceptional circumstances approved by administrators."
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

export default TournamentDetails;