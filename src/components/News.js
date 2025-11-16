import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const News = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const newsArticles = [
    {
      id: 'a1',
      title: 'The Rise of Esports: How Gaming Became a Global Phenomenon',
      excerpt: 'From basement tournaments to billion-dollar prize pools - discover how esports transformed into a global entertainment powerhouse.',
      category: 'ESPORTS',
      date: '15 DEC 2024',
      image: 'https://placehold.co/600x400/161329/F0F0F0?text=Esports+Rise',
      featured: true
    },
    {
      id: 'a2',
      title: 'Welcome to Uni Games: Revolutionizing Esports Competition',
      excerpt: 'Discover how Uni Games is transforming the competitive gaming landscape with innovative tournaments and community-driven experiences.',
      category: 'ABOUT US',
      date: '15 DEC 2024',
      image: '/assets/a2.png',
      featured: true
    },
    {
      id: 'a3',
      title: 'How to Register as a Host on Uni Games',
      excerpt: 'Step-by-step guide to becoming a tournament host and organizing your own competitive gaming events on our platform.',
      category: 'GUIDE',
      date: '14 DEC 2024',
      image: '/assets/host_reg.png',
      featured: true
    },
    {
      id: '4',
      title: 'Tournament Format Updates and New Features',
      excerpt: 'Learn about the latest tournament format improvements and new features that enhance the competitive gaming experience.',
      category: 'UPDATES',
      date: '12 DEC 2024',
      image: '/t1.jpg',
      featured: false
    },
    {
      id: '5',
      title: 'Community Spotlight: Top Players of the Month',
      excerpt: 'Celebrating the outstanding performances and achievements of our community\'s top players this month.',
      category: 'COMMUNITY',
      date: '10 DEC 2024',
      image: '/t2.jpg',
      featured: false
    },
    {
      id: '6',
      title: 'Prize Pool Distribution and Payment Updates',
      excerpt: 'Important information about prize pool distribution, payment methods, and new payout features.',
      category: 'UPDATES',
      date: '8 DEC 2024',
      image: '/t3.jpg',
      featured: false
    }
  ];

  const categories = ['all', 'esports', 'about us', 'guide', 'updates', 'community'];

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <main>
        {/* Page Header */}
        <section className="page-header">
          <div className="container">
            <h1 className="page-title">Gaming News & Updates</h1>
            <p className="page-subtitle">
              Stay updated with the latest news, announcements, and insights from the world of competitive gaming
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
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All News' : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">Featured Articles</h2>
            
            <div className="news-grid">
              {filteredArticles
                .filter(article => article.featured)
                .map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="news-card featured">
                    <img src={article.image} alt={article.title} />
                    <div className="news-content">
                      <div>
                        <p className="news-meta">
                          <span className="league-name">{article.category}</span> - {article.date}
                        </p>
                        <h3>{article.title}</h3>
                        <p>{article.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* All Articles */}
        <section className="articles-section">
          <div className="container">
            <h2 className="section-title">All Articles</h2>
            
            {filteredArticles.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-newspaper"></i>
                <h3>No Articles Found</h3>
                <p>
                  {searchTerm 
                    ? `No articles match "${searchTerm}"`
                    : 'No articles available in this category'
                  }
                </p>
              </div>
            ) : (
              <div className="articles-list">
                {filteredArticles.map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="article-item">
                    <div className="article-image">
                      <img src={article.image} alt={article.title} />
                    </div>
                    <div className="article-content">
                      <div className="article-meta">
                        <span className="category">{article.category}</span>
                        <span className="date">{article.date}</span>
                      </div>
                      <h3 className="article-title">{article.title}</h3>
                      <p className="article-excerpt">{article.excerpt}</p>
                      <div className="read-more">
                        Read More <i className="fas fa-arrow-right"></i>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-content">
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter to get the latest gaming news and tournament updates delivered to your inbox.</p>
              
              <form className="newsletter-form">
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    required 
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-envelope"></i>
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default News;