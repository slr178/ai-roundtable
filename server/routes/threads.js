const express = require('express');
const Thread = require('../models/Thread');
const AIAgent = require('../models/AIAgent');

const router = express.Router();

// Get all threads
router.get('/', async (req, res) => {
  try {
    const threads = await Thread.find()
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific thread
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new thread
router.post('/', async (req, res) => {
  try {
    const { title, topic, originalContent, source, sourceUrl } = req.body;
    
    const thread = new Thread({
      title,
      topic,
      originalContent,
      source: source || 'manual',
      sourceUrl
    });

    await thread.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update thread status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const thread = await Thread.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get thread statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Calculate statistics
    const stats = {
      totalMessages: thread.messages.length,
      totalRounds: thread.round - 1,
      agentParticipation: {},
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      politicalLeanDistribution: { left: 0, 'center-left': 0, center: 0, 'center-right': 0, right: 0 }
    };

    thread.messages.forEach(message => {
      // Agent participation
      stats.agentParticipation[message.aiAgent] = 
        (stats.agentParticipation[message.aiAgent] || 0) + 1;
      
      // Sentiment distribution
      stats.sentimentDistribution[message.sentiment]++;
      
      // Political lean distribution
      stats.politicalLeanDistribution[message.politicalLean]++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 