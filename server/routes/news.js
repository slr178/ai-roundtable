const express = require('express');
const NewsService = require('../services/newsService');

const router = express.Router();
const newsService = new NewsService();

// Get latest news articles
router.get('/articles', async (req, res) => {
  try {
    const { category, country, pageSize } = req.query;
    const articles = await newsService.getTopHeadlines({
      category: category || 'general',
      country: country || 'us',
      pageSize: parseInt(pageSize) || 20
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search news articles
router.get('/search', async (req, res) => {
  try {
    const { q, sortBy, pageSize, language } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const articles = await newsService.searchArticles({
      q,
      sortBy: sortBy || 'publishedAt',
      pageSize: parseInt(pageSize) || 20,
      language: language || 'en'
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending topics
router.get('/trending', async (req, res) => {
  try {
    const trendingTopics = await newsService.getTrendingTopics();
    res.json(trendingTopics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create debate thread from news article
router.post('/create-debate', async (req, res) => {
  try {
    const { articleUrl, title, description } = req.body;
    
    if (!articleUrl || !title) {
      return res.status(400).json({ error: 'Article URL and title are required' });
    }
    
    // This would typically integrate with the AI orchestrator
    // For now, just return the formatted data
    const debateData = {
      title: title,
      topic: title,
      originalContent: description || title,
      source: 'news',
      sourceUrl: articleUrl
    };
    
    res.json(debateData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 