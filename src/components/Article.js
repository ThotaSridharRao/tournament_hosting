import { useParams, Link } from 'react-router-dom';
import Layout from './Layout';

const Article = () => {
  const { id } = useParams();

  const articles = {
    'a1': {
      title: 'The Rise of Esports: How Gaming Became a Global Phenomenon',
      category: 'ESPORTS',
      date: '15 DEC 2024',
      author: 'Uni Games Editorial Team',
      image: 'https://placehold.co/1200x600/161329/F0F0F0?text=Esports+Rise',
      content: `
        <p>The world of competitive gaming has undergone a remarkable transformation over the past two decades. What began as small gatherings of passionate gamers in basements and internet cafes has evolved into a billion-dollar industry that rivals traditional sports in viewership and revenue.</p>
        
        <h3>The Early Days</h3>
        <p>Esports traces its roots back to the 1970s and 1980s, with early competitions centered around arcade games like Space Invaders and Pac-Man. However, it wasn't until the rise of personal computers and the internet that competitive gaming truly began to flourish.</p>
        
        <h3>The Internet Revolution</h3>
        <p>The widespread adoption of high-speed internet in the late 1990s and early 2000s marked a turning point for esports. Games like StarCraft, Counter-Strike, and Warcraft III became the foundation for organized competitive play, with tournaments offering substantial prize pools and attracting thousands of spectators.</p>
        
        <h3>Mainstream Recognition</h3>
        <p>Today, esports events fill massive arenas, with millions more watching online. Major brands sponsor teams and tournaments, and professional players have become household names. The industry has created entire ecosystems of coaches, analysts, broadcasters, and support staff.</p>
        
        <h3>The Future of Esports</h3>
        <p>As technology continues to advance and new generations of gamers emerge, the future of esports looks brighter than ever. Virtual reality, augmented reality, and mobile gaming are opening new frontiers for competitive play, ensuring that esports will continue to evolve and grow.</p>
      `
    },
    'a2': {
      title: 'Welcome to Uni Games: Revolutionizing Esports Competition',
      category: 'ABOUT US',
      date: '15 DEC 2024',
      author: 'Uni Games Team',
      image: '/assets/a2.png',
      content: `
        <p>Welcome to Uni Games, where competitive gaming meets innovation. Our platform is designed to provide the ultimate esports experience for players, hosts, and spectators alike.</p>
        
        <h3>Our Mission</h3>
        <p>At Uni Games, we believe that everyone deserves the opportunity to compete at the highest level. Our mission is to democratize esports by providing accessible, fair, and exciting tournament experiences for gamers of all skill levels.</p>
        
        <h3>What Sets Us Apart</h3>
        <p>Our platform offers unique features that enhance the competitive gaming experience:</p>
        <ul>
          <li>Advanced matchmaking algorithms for fair competition</li>
          <li>Real-time tournament management tools</li>
          <li>Comprehensive analytics and performance tracking</li>
          <li>Secure payment processing for prizes and entry fees</li>
          <li>24/7 customer support and dispute resolution</li>
        </ul>
        
        <h3>Community First</h3>
        <p>We're more than just a tournament platform – we're a community. Our goal is to foster connections between gamers, create opportunities for growth, and celebrate the achievements of our players.</p>
        
        <h3>Join the Revolution</h3>
        <p>Whether you're a casual gamer looking to test your skills or a seasoned pro seeking new challenges, Uni Games has something for you. Join us today and be part of the esports revolution.</p>
      `
    },
    'a3': {
      title: 'How to Register as a Host on Uni Games',
      category: 'GUIDE',
      date: '14 DEC 2024',
      author: 'Uni Games Support',
      image: '/assets/host_reg.png',
      content: `
        <p>Interested in hosting your own tournaments on Uni Games? This comprehensive guide will walk you through the registration process and help you get started as a tournament host.</p>
        
        <h3>Step 1: Create Your Account</h3>
        <p>If you don't already have a Uni Games account, start by creating one. Click on "Join Us" in the top navigation and fill out the registration form with your details.</p>
        
        <h3>Step 2: Apply for Host Status</h3>
        <p>Once you have an account, navigate to the Host Registration page and complete the host application form. You'll need to provide:</p>
        <ul>
          <li>Personal identification information</li>
          <li>Experience with tournament organization</li>
          <li>Preferred games and tournament formats</li>
          <li>Banking information for prize distribution</li>
        </ul>
        
        <h3>Step 3: Verification Process</h3>
        <p>Our team will review your application within 2-3 business days. We may contact you for additional information or clarification during this process.</p>
        
        <h3>Step 4: Host Dashboard Access</h3>
        <p>Once approved, you'll gain access to the Host Dashboard where you can:</p>
        <ul>
          <li>Create and manage tournaments</li>
          <li>Set up prize pools and entry fees</li>
          <li>Monitor participant registrations</li>
          <li>Access analytics and reporting tools</li>
        </ul>
        
        <h3>Best Practices for Hosts</h3>
        <p>To ensure successful tournaments, we recommend:</p>
        <ul>
          <li>Clearly communicate tournament rules and schedules</li>
          <li>Respond promptly to participant questions</li>
          <li>Use our dispute resolution system fairly</li>
          <li>Promote your tournaments through social media</li>
        </ul>
        
        <h3>Support and Resources</h3>
        <p>As a host, you'll have access to our dedicated support team and comprehensive resources to help you run successful tournaments. Don't hesitate to reach out if you need assistance!</p>
      `
    }
  };

  const article = articles[id];

  if (!article) {
    return (
      <Layout>
        <div className="container" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
            <h2>Article Not Found</h2>
            <p>The requested article could not be found.</p>
            <Link to="/news" className="btn btn-primary">
              <i className="fas fa-arrow-left"></i>
              Back to News
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main>
        {/* Article Header */}
        <section className="article-header">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/news">News</Link>
              <span>/</span>
              <span>{article.title}</span>
            </div>
            
            <div className="article-meta">
              <span className="category">{article.category}</span>
              <span className="date">{article.date}</span>
              <span className="author">By {article.author}</span>
            </div>
            
            <h1 className="article-title">{article.title}</h1>
          </div>
        </section>

        {/* Article Image */}
        <section className="article-image-section">
          <div className="container">
            <img src={article.image} alt={article.title} className="article-featured-image" />
          </div>
        </section>

        {/* Article Content */}
        <section className="article-content-section">
          <div className="container">
            <div className="article-layout">
              <div className="article-main">
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Article Actions */}
                <div className="article-actions">
                  <div className="share-buttons">
                    <span>Share this article:</span>
                    <button className="share-btn twitter">
                      <i className="fab fa-twitter"></i>
                    </button>
                    <button className="share-btn facebook">
                      <i className="fab fa-facebook"></i>
                    </button>
                    <button className="share-btn linkedin">
                      <i className="fab fa-linkedin"></i>
                    </button>
                  </div>
                  
                  <Link to="/news" className="btn btn-secondary">
                    <i className="fas fa-arrow-left"></i>
                    Back to News
                  </Link>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="article-sidebar">
                <div className="sidebar-section">
                  <h3>Related Articles</h3>
                  <div className="related-articles">
                    {Object.entries(articles)
                      .filter(([key]) => key !== id)
                      .slice(0, 3)
                      .map(([key, relatedArticle]) => (
                        <Link key={key} to={`/article/${key}`} className="related-article">
                          <img src={relatedArticle.image} alt={relatedArticle.title} />
                          <div className="related-content">
                            <h4>{relatedArticle.title}</h4>
                            <span className="related-date">{relatedArticle.date}</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
                
                <div className="sidebar-section">
                  <h3>Categories</h3>
                  <div className="category-list">
                    <Link to="/news" className="category-link">All News</Link>
                    <Link to="/news" className="category-link">Esports</Link>
                    <Link to="/news" className="category-link">Guides</Link>
                    <Link to="/news" className="category-link">Updates</Link>
                    <Link to="/news" className="category-link">Community</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Article;