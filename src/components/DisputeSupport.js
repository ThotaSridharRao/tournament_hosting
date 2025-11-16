import { useState } from 'react';
import Layout from './Layout';

const DisputeSupport = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    priority: '',
    subject: '',
    description: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate a random ticket ID
    const newTicketId = `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setTicketId(newTicketId);
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      issueType: '',
      priority: '',
      subject: '',
      description: ''
    });
  };

  const resetForm = () => {
    setShowSuccess(false);
    setTicketId('');
  };

  return (
    <Layout>
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <i className="fas fa-headset"></i>
            </div>
            <h1 className="hero-title">Dispute Support Center</h1>
            <p className="hero-subtitle">
              Having issues with a tournament or need assistance? Our tech support team is here to help you resolve any problems quickly and efficiently.
            </p>
          </div>
        </section>

        {/* Complaint Form Section */}
        <section className="complaint-section">
          <div className="container">
            <div className="section-header">
              <h2>Submit a Support Ticket</h2>
              <p>Describe your issue in detail and we'll get back to you as soon as possible.</p>
            </div>

            <div className="complaint-form-wrapper">
              {!showSuccess ? (
                <form className="complaint-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="issueType">Issue Type</label>
                    <select 
                      id="issueType" 
                      name="issueType" 
                      value={formData.issueType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select issue type</option>
                      <option value="tournament">Tournament Related</option>
                      <option value="payment">Payment Issues</option>
                      <option value="technical">Technical Problems</option>
                      <option value="account">Account Issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority Level</label>
                    <select 
                      id="priority" 
                      name="priority" 
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Moderate issue</option>
                      <option value="high">High - Urgent problem</option>
                      <option value="critical">Critical - System down</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Detailed Description</label>
                    <textarea 
                      id="description" 
                      name="description"
                      placeholder="Please provide as much detail as possible about your issue..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="attachments">Attachments (Optional)</label>
                    <input 
                      type="file" 
                      id="attachments" 
                      name="attachments" 
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt" 
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="file-upload-btn" 
                      onClick={() => document.getElementById('attachments').click()}
                    >
                      <i className="fas fa-paperclip"></i>
                      Choose Files
                    </button>
                    <small className="file-help-text">Supported: Images, PDF, DOC, DOCX, TXT (Max 5MB each)</small>
                  </div>

                  <button type="submit" className="submit-btn">
                    <i className="fas fa-paper-plane"></i>
                    Submit Ticket
                  </button>
                </form>
              ) : (
                <div className="ticket-success">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Ticket Submitted Successfully!</h3>
                  <p>Your support ticket has been created with ID: <span className="ticket-id">#{ticketId}</span></p>
                  <p>Our support team will review your request and respond within 2 hours.</p>
                  <button className="btn-secondary" onClick={resetForm}>Submit Another Ticket</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Replies Section */}
        <section className="replies-section">
          <div className="tickets-container">
            <div className="section-header">
              <h2>Your Support Tickets</h2>
              <p>Track the status of your submitted tickets and view responses from our support team.</p>
            </div>

            <div className="search-bar">
              <input type="text" placeholder="Search tickets by ID or subject..." />
              <button>
                <i className="fas fa-search"></i>
              </button>
            </div>

            <div className="tickets-grid">
              <div className="empty-state">
                <i className="fas fa-ticket-alt"></i>
                <h3>No Support Tickets</h3>
                <p>You haven't submitted any support tickets yet. Submit your first ticket above if you need assistance.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default DisputeSupport;