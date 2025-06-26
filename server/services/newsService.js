const axios = require('axios');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async getTopHeadlines(options = {}) {
    try {
      if (!this.newsApiKey) {
        // Return mock data if no API key is provided
        return this.getMockArticles();
      }

      const params = {
        apiKey: this.newsApiKey,
        country: options.country || 'us',
        category: options.category || 'general',
        pageSize: options.pageSize || 20
      };

      const response = await axios.get(`${this.baseUrl}/top-headlines`, { params });
      return this.formatArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching top headlines:', error.message);
      return this.getMockArticles();
    }
  }

  async searchArticles(options = {}) {
    try {
      if (!this.newsApiKey) {
        return this.getMockArticles();
      }

      const params = {
        apiKey: this.newsApiKey,
        q: options.q,
        sortBy: options.sortBy || 'publishedAt',
        pageSize: options.pageSize || 20,
        language: options.language || 'en'
      };

      const response = await axios.get(`${this.baseUrl}/everything`, { params });
      return this.formatArticles(response.data.articles);
    } catch (error) {
      console.error('Error searching articles:', error.message);
      return this.getMockArticles();
    }
  }

  async getTrendingTopics() {
    try {
      // Get articles from multiple categories to identify trending topics
      const categories = ['business', 'technology', 'politics', 'health'];
      const allArticles = [];

      for (const category of categories) {
        const articles = await this.getTopHeadlines({ category, pageSize: 10 });
        allArticles.push(...articles);
      }

      // Extract keywords and count frequency
      const topicFrequency = {};
      allArticles.forEach(article => {
        const keywords = this.extractKeywords(article.title + ' ' + (article.description || ''));
        keywords.forEach(keyword => {
          topicFrequency[keyword] = (topicFrequency[keyword] || 0) + 1;
        });
      });

      // Sort by frequency and return top topics
      const trending = Object.entries(topicFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }));

      return trending;
    } catch (error) {
      console.error('Error getting trending topics:', error.message);
      return [];
    }
  }

  formatArticles(articles) {
    return articles
      .filter(article => article.title && article.title !== '[Removed]')
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Unknown',
        author: article.author
      }));
  }

  extractKeywords(text) {
    // Simple keyword extraction - remove common words and split
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5); // Top 5 keywords per article
  }

  getMockArticles() {
    return [
      {
        title: "AI Technology Advances in 2024",
        description: "Major breakthroughs in artificial intelligence continue to reshape industries worldwide.",
        url: "https://example.com/ai-advances-2024",
        urlToImage: "https://via.placeholder.com/400x200",
        publishedAt: new Date().toISOString(),
        source: "Tech News",
        author: "Jane Smith"
      },
      {
        title: "Global Climate Summit Reaches New Agreements",
        description: "World leaders agree on ambitious new targets for carbon emission reductions.",
        url: "https://example.com/climate-summit-2024",
        urlToImage: "https://via.placeholder.com/400x200",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: "World News",
        author: "John Doe"
      },
      {
        title: "Economic Markets Show Strong Recovery",
        description: "Stock markets reach new highs as economic indicators show positive trends.",
        url: "https://example.com/market-recovery-2024",
        urlToImage: "https://via.placeholder.com/400x200",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: "Financial Times",
        author: "Robert Johnson"
      }
    ];
  }
}

module.exports = NewsService; 