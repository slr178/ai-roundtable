import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
  author: string;
}

const NewsFeeds: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'general', name: 'General', icon: '📰' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'politics', name: 'Politics', icon: '🏛️' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' }
  ];

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/news/articles`, {
        params: {
          category: selectedCategory,
          pageSize: 20
        }
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Show mock data if API fails
      setArticles([
        {
          title: "AI Technology Advances in 2024",
          description: "Major breakthroughs in artificial intelligence continue to reshape industries worldwide.",
          url: "https://example.com/ai-advances-2024",
          urlToImage: "https://via.placeholder.com/400x200",
          publishedAt: new Date().toISOString(),
          source: "Tech News",
          author: "Jane Smith"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const searchArticles = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/news/search`, {
        params: {
          q: searchQuery,
          pageSize: 20
        }
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDebateFromArticle = async (article: Article) => {
    try {
      const response = await axios.post(`${API_URL}/api/news/create-debate`, {
        articleUrl: article.url,
        title: article.title,
        description: article.description
      });
      
      alert(`Debate topic created: "${response.data.title}". Go to the Roundtable to start the debate!`);
    } catch (error) {
      console.error('Error creating debate:', error);
      alert('Error creating debate from article');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchArticles();
  };

  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
    color: 'white'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const formStyle = {
    marginBottom: '1.5rem'
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '1rem'
  };

  const inputStyle = {
    flex: 1,
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '1rem'
  };

  const buttonStyle = {
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const categoriesStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '2rem'
  };

  const categoryButtonStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.2s'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const
  };

  const cardContentStyle = {
    padding: '1.5rem'
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  };

  const descriptionStyle = {
    opacity: 0.7,
    fontSize: '0.875rem',
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  };

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    opacity: 0.6,
    marginBottom: '1rem'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '0.75rem'
  };

  const linkButtonStyle = {
    flex: 1,
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6b7280',
    color: 'white',
    textAlign: 'center' as const,
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s'
  };

  const debateButtonStyle = {
    flex: 1,
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#22c55e',
    color: 'white',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          📰 News Feeds
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={formStyle}>
          <div style={searchContainerStyle}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news articles..."
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Search
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div style={categoriesStyle}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={categoryButtonStyle(selectedCategory === category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '1.25rem' }}>Loading articles...</div>
        ) : (
          <div style={gridStyle}>
            {articles.map((article, index) => (
              <div key={index} style={cardStyle}>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    style={imageStyle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=News';
                    }}
                  />
                )}
                
                <div style={cardContentStyle}>
                  <h3 style={titleStyle}>
                    {article.title}
                  </h3>
                  
                  <p style={descriptionStyle}>
                    {article.description}
                  </p>
                  
                  <div style={metaStyle}>
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div style={actionsStyle}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkButtonStyle}
                    >
                      Read Article
                    </a>
                    <button
                      onClick={() => createDebateFromArticle(article)}
                      style={debateButtonStyle}
                    >
                      🎯 Debate This
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {articles.length === 0 && !loading && (
          <div style={{ textAlign: 'center', opacity: 0.7, padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📰</div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No articles found</div>
            <div style={{ fontSize: '0.875rem' }}>Try a different category or search term</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeeds; 