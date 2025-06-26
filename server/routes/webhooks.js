const express = require('express');
const crypto = require('crypto');
const { extractUrlsFromWebhook } = require('../utils/extractUrls');
const { fetchMultiplePages, getCleanText } = require('../services/pageFetcher');
const ContentSummarizer = require('../services/contentSummarizer');

const router = express.Router();
const contentSummarizer = new ContentSummarizer();

// Store recent webhook data (in production, use a database)
let recentWebhooks = [];

// Twitter/Social Media webhook endpoint
router.post('/twitter', async (req, res) => {
  try {
    const webhookData = req.body;
    const io = req.app.get('io');
    
    // Log the full payload structure for debugging
    console.log('📧 Twitter webhook payload:', JSON.stringify(webhookData, null, 2));

    // Extract tweet data - Tweet Catcher sends data nested under 'data' property
    const tweetData = webhookData.data || webhookData;
    const taskData = webhookData.task || {};
    
    // Process the webhook data - handle Tweet Catcher format
    const tweetContent = tweetData.full_text || tweetData.text || webhookData.content || 'New post received';
    
    // Extract URLs from the tweet using our enhanced URL extraction
    console.log('🔍 Processing links in tweet...');
    const urls = extractUrlsFromWebhook(webhookData);
    
    let linkProcessingResult = {
      hasLinks: urls.length > 0,
      linkCount: urls.length,
      urls: urls,
      summaries: [],
      combinedSummary: '',
      enhancedContent: tweetContent
    };

    // If we found URLs, fetch and summarize their content
    if (urls.length > 0) {
      try {
        // Fetch page content in parallel
        const pageContents = await fetchMultiplePages(urls);
        
        // Summarize all content in parallel
        const summaries = await contentSummarizer.summarizeMultiple(pageContents);
        
        // Build enhanced context for AI agents
        const enhancedContent = contentSummarizer.buildEnhancedContext(summaries, tweetContent);
        
        linkProcessingResult = {
          hasLinks: true,
          linkCount: urls.length,
          urls: urls,
          pageContents: pageContents,
          summaries: summaries,
          combinedSummary: contentSummarizer.createBiasAnalysisContext(summaries),
          enhancedContent: enhancedContent
        };
        
        console.log(`📚 Successfully processed ${summaries.filter(s => s.success).length}/${urls.length} URLs`);
        
      } catch (error) {
        console.error('❌ Error processing URLs:', error);
        linkProcessingResult.error = error.message;
      }
    }
    
    const processedData = {
      id: tweetData.id_str || tweetData.id || Date.now().toString(),
      type: 'twitter',
      timestamp: tweetData.created_at || new Date().toISOString(),
      content: tweetContent,
      enhancedContent: linkProcessingResult.enhancedContent,
      author: tweetData.user?.screen_name || tweetData.user?.name || webhookData.user?.screen_name || webhookData.author || taskData.user || 'Unknown',
      retweet_count: tweetData.retweet_count || 0,
      favorite_count: tweetData.favorite_count || 0,
      is_retweet: tweetData.is_retweet || false,
      is_reply: tweetData.is_reply || false,
      linkData: linkProcessingResult,
      // Preserve user profile information for TweetDisplay component
      user: {
        name: tweetData.user?.name || 'Unknown User',
        screen_name: tweetData.user?.screen_name || 'unknown',
        image: tweetData.user?.image || tweetData.user?.profile_image_url_https || tweetData.user?.profile_image_url || '/default-avatar.png',
        followers: tweetData.user?.followers_count || tweetData.user?.followers || 0,
        following: tweetData.user?.friends_count || tweetData.user?.following || 0,
        verification: {
          is_blue_verified: tweetData.user?.verification?.is_blue_verified || false,
          verified_type: tweetData.user?.verification?.verified_type || ''
        }
      },
      originalData: webhookData
    };

    // Store in memory (use database in production)
    recentWebhooks.unshift(processedData);
    if (recentWebhooks.length > 100) {
      recentWebhooks = recentWebhooks.slice(0, 100);
    }

    // Add tweet to server-side debate queue
    const aiOrchestrator = req.app.get('aiOrchestrator');
    if (aiOrchestrator) {
      aiOrchestrator.addTweetToQueue(processedData);
    }

    // Broadcast to all connected clients
    const connectedClients = io.sockets.sockets.size;
    io.emit('newWebhookData', processedData);
    
    console.log(`📡 Broadcasted Twitter webhook to ${connectedClients} connected clients:`, {
      id: processedData.id,
      author: processedData.author,
      content: processedData.content.substring(0, 50) + (processedData.content.length > 50 ? '...' : ''),
      hasLinks: linkProcessingResult.hasLinks,
      linkCount: linkProcessingResult.linkCount,
      timestamp: processedData.timestamp
    });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Webhook processed successfully',
      id: processedData.id,
      linksProcessed: linkProcessingResult.linkCount
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

// Generic webhook endpoint for other services
router.post('/generic', (req, res) => {
  try {
    const webhookData = req.body;
    const io = req.app.get('io');
    
    console.log('📧 Generic webhook received:', webhookData);

    const processedData = {
      id: Date.now().toString(),
      type: 'generic',
      timestamp: new Date().toISOString(),
      content: JSON.stringify(webhookData),
      author: 'System',
      originalData: webhookData
    };

    recentWebhooks.unshift(processedData);
    if (recentWebhooks.length > 100) {
      recentWebhooks = recentWebhooks.slice(0, 100);
    }

    const connectedClients = io.sockets.sockets.size;
    io.emit('newWebhookData', processedData);
    
    console.log(`📡 Broadcasted generic webhook to ${connectedClients} connected clients:`, {
      id: processedData.id,
      type: processedData.type
    });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Generic webhook processed successfully',
      id: processedData.id
    });
  } catch (error) {
    console.error('❌ Generic webhook processing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process generic webhook',
      error: error.message
    });
  }
});

// Webhook with HMAC verification (for secure webhooks)
router.post('/secure', (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-twitter-signature'];
    const secret = process.env.WEBHOOK_SECRET;
    
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      const receivedSignature = signature.replace('sha256=', '');
      
      if (expectedSignature !== receivedSignature) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Invalid signature' 
        });
      }
    }

    const webhookData = req.body;
    const io = req.app.get('io');
    
    console.log('🔒 Secure webhook received:', webhookData);

    const processedData = {
      id: Date.now().toString(),
      type: 'secure',
      timestamp: new Date().toISOString(),
      content: webhookData.text || webhookData.content || 'Secure webhook received',
      author: webhookData.user?.screen_name || webhookData.author || 'Verified Source',
      originalData: webhookData
    };

    recentWebhooks.unshift(processedData);
    if (recentWebhooks.length > 100) {
      recentWebhooks = recentWebhooks.slice(0, 100);
    }

    io.emit('newWebhookData', processedData);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Secure webhook processed successfully',
      id: processedData.id
    });
  } catch (error) {
    console.error('❌ Secure webhook processing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process secure webhook',
      error: error.message
    });
  }
});

// Get recent webhook data
router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
      status: 'success',
      data: recentWebhooks.slice(0, limit),
      count: recentWebhooks.length
    });
  } catch (error) {
    console.error('❌ Error fetching recent webhooks:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch recent webhooks',
      error: error.message
    });
  }
});

// Test endpoint to simulate webhook data
router.post('/test', (req, res) => {
  try {
    const io = req.app.get('io');
    
    const testData = {
      id: Date.now().toString(),
      type: 'test',
      timestamp: new Date().toISOString(),
      content: req.body.message || 'Test webhook message',
      author: 'Test User',
      originalData: req.body
    };

    recentWebhooks.unshift(testData);
    if (recentWebhooks.length > 100) {
      recentWebhooks = recentWebhooks.slice(0, 100);
    }

    const connectedClients = io.sockets.sockets.size;
    io.emit('newWebhookData', testData);
    
    console.log(`🧪 Test webhook broadcasted to ${connectedClients} connected clients:`, {
      id: testData.id,
      content: testData.content
    });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Test webhook sent successfully',
      data: testData
    });
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to send test webhook',
      error: error.message
    });
  }
});

module.exports = router; 