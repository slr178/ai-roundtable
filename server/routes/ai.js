const express = require('express');
const AIAgent = require('../models/AIAgent');

const router = express.Router();

// Enhanced AI agent response with full political tracking
router.post('/agent-response-enhanced', async (req, res) => {
  try {
    const { agentName, topic, content, context, trackWorldview = true } = req.body;
    
    if (!agentName || !topic || !content) {
      return res.status(400).json({ error: 'Agent name, topic, and content are required' });
    }

    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    // Get the agent from the orchestrator's agents data
    let agent = orchestrator.agentsData?.find(a => a.name === agentName);
    
    if (!agent) {
      // Try to get from database
      try {
        agent = await AIAgent.findOne({ name: agentName });
      } catch (error) {
        console.error('Error fetching agent from database:', error);
      }
    }

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get current bias level for this agent
    const currentBiasLevel = orchestrator.agentBias[agentName] || 0;
    
    const startTime = Date.now();
    const response = await orchestrator.getAIResponse(agent, topic, content, context || '', currentBiasLevel);
    const responseTime = Date.now() - startTime;

    if (response && response.content) {
      let worldviewChange = null;
      
      let politicalAnalysis = { politicalLean: 'center', alignment: 'Independent' };
      
      if (trackWorldview) {
        // Update bias level for this agent (each response increases bias)
        const newBiasLevel = orchestrator.updateAgentBias(agentName);
        
        // Analyze the response content to determine political lean dynamically
        politicalAnalysis = orchestrator.updateAgentPoliticalProfile(agentName, response.content);
        
        // Categorize the topic and update worldview
        const topicCategory = orchestrator.categorizeArgument(content || topic);
        worldviewChange = orchestrator.updateWorldviewPosition(
          agentName, 
          topicCategory, 
          content || topic, 
          response.content
        );
      }

      const enhancedResponse = {
        success: true,
        agent: agent.displayName || agent.name,
        agentName: agent.name,
        content: response.content,
        sentiment: response.sentiment || 'neutral',
        politicalLean: politicalAnalysis.politicalLean,
        confidence: response.confidence || 0.5,
        responseTime,
        // Enhanced political tracking data
        biasLevel: orchestrator.agentBias[agentName] || 0,
        worldviewChange: worldviewChange,
        alignment: politicalAnalysis.alignment || 'neutral'
      };

      console.log(`🧠 Enhanced response for ${agentName}: bias=${enhancedResponse.biasLevel}, worldview=${worldviewChange ? 'updated' : 'no change'}`);
      
      res.json(enhancedResponse);
    } else {
      res.status(500).json({
        error: `${agent.displayName || agent.name} failed to respond`,
        agentName: agent.name
      });
    }
  } catch (error) {
    console.error('Error getting enhanced agent response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get individual AI agent response with political bias
router.post('/agent-response-biased', async (req, res) => {
  try {
    const { agent, topic, biasLevel = 0, enhancedContent, webhookData } = req.body;
    
    if (!agent || !topic) {
      return res.status(400).json({ error: 'Agent and topic are required' });
    }

    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    // Get the agent from the orchestrator's agents data
    let agentData = orchestrator.agentsData?.find(a => a.name === agent);
    
    if (!agentData) {
      // Try to get from database
      try {
        agentData = await AIAgent.findOne({ name: agent });
      } catch (error) {
        console.error('Error fetching agent from database:', error);
      }
    }

    if (!agentData) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Use enhanced content if available (from webhook processing) or fall back to topic
    let contentForAnalysis = topic;
    let linkInfo = null;
    
    if (enhancedContent) {
      contentForAnalysis = enhancedContent;
      console.log(`🔗 Using enhanced content with linked articles for ${agent} (bias level: ${biasLevel})`);
    } else if (webhookData?.linkData?.enhancedContent) {
      contentForAnalysis = webhookData.linkData.enhancedContent;
      linkInfo = webhookData.linkData;
      console.log(`🔗 Using webhook enhanced content for ${agent} (bias level: ${biasLevel})`);
    }

    const startTime = Date.now();
    const response = await orchestrator.getAIResponse(agentData, topic, contentForAnalysis, '', biasLevel);
    const responseTime = Date.now() - startTime;

    if (response && response.content) {
      // Analyze political lean based on bias level
      const ALIGNMENTS = {
        grok: 'Republican',
        gpt: 'Democratic',
        claude: 'Libertarian',
        deepseek: 'Communist'
      };

      const alignment = ALIGNMENTS[agent];
      let politicalLean = 'center';
      
      if (biasLevel > 0 && alignment) {
        if (biasLevel <= 3) {
          politicalLean = `slight-${alignment.toLowerCase()}`;
        } else if (biasLevel <= 7) {
          politicalLean = `moderate-${alignment.toLowerCase()}`;
        } else if (biasLevel <= 15) {
          politicalLean = `strong-${alignment.toLowerCase()}`;
        } else {
          politicalLean = `extreme-${alignment.toLowerCase()}`;
        }
      }

      res.json({
        success: true,
        agent: agentData.displayName || agentData.name,
        agentName: agentData.name,
        content: response.content,
        sentiment: response.sentiment,
        politicalLean: politicalAnalysis.politicalLean,
        confidence: response.confidence,
        responseTime,
        biasLevel,
        alignment: alignment || 'neutral',
        hasEnhancedContent: !!enhancedContent || !!webhookData?.linkData?.enhancedContent,
        linkCount: linkInfo?.linkCount || 0,
        processedUrls: linkInfo?.urls || []
      });
    } else {
      res.status(500).json({
        error: `${agentData.displayName || agentData.name} failed to respond`,
        agentName: agentData.name
      });
    }
  } catch (error) {
    console.error('Error getting biased agent response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get individual AI agent response
router.post('/agent-response', async (req, res) => {
  try {
    const { agentName, topic, content, context } = req.body;
    
    if (!agentName || !topic || !content) {
      return res.status(400).json({ error: 'Agent name, topic, and content are required' });
    }

    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    // Get the agent from the orchestrator's agents data
    let agent = orchestrator.agentsData?.find(a => a.name === agentName);
    
    if (!agent) {
      // Try to get from database
      try {
        agent = await AIAgent.findOne({ name: agentName });
      } catch (error) {
        console.error('Error fetching agent from database:', error);
      }
    }

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const startTime = Date.now();
    const response = await orchestrator.getAIResponse(agent, topic, content, context || '');
    const responseTime = Date.now() - startTime;

    if (response && response.content) {
      res.json({
        success: true,
        agent: agent.displayName || agent.name,
        agentName: agent.name,
        content: response.content,
        sentiment: response.sentiment,
        politicalLean: response.politicalLean,
        confidence: response.confidence,
        responseTime
      });
    } else {
      res.status(500).json({
        error: `${agent.displayName || agent.name} failed to respond`,
        agentName: agent.name
      });
    }
  } catch (error) {
    console.error('Error getting agent response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start a new debate
router.post('/start-debate', async (req, res) => {
  try {
    const { topic, content } = req.body;
    
    if (!topic || !content) {
      return res.status(400).json({ error: 'Topic and content are required' });
    }

    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    const result = await orchestrator.startDebate(topic, content);
    res.json(result);
  } catch (error) {
    console.error('Error starting debate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Continue an existing debate
router.post('/continue-debate', async (req, res) => {
  try {
    const { threadId } = req.body;
    
    if (!threadId) {
      return res.status(400).json({ error: 'Thread ID is required' });
    }

    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    const result = await orchestrator.continueDebate(threadId);
    res.json(result);
  } catch (error) {
    console.error('Error continuing debate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all AI agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await AIAgent.find();
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get specific AI agent
router.get('/agents/:name', async (req, res) => {
  try {
    const agent = await AIAgent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update AI agent personality
router.patch('/agents/:name/personality', async (req, res) => {
  try {
    const { personality } = req.body;
    const agent = await AIAgent.findOneAndUpdate(
      { name: req.params.name },
      { personality },
      { new: true }
    );
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update AI agent political profile
router.patch('/agents/:name/political', async (req, res) => {
  try {
    const { politicalProfile } = req.body;
    const agent = await AIAgent.findOneAndUpdate(
      { name: req.params.name },
      { politicalProfile },
      { new: true }
    );
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add opinion evolution entry
router.post('/agents/:name/evolution', async (req, res) => {
  try {
    const { topic, stance, confidence, reasoning } = req.body;
    
    const agent = await AIAgent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    agent.opinionEvolution.push({
      topic,
      stance,
      confidence,
      reasoning
    });
    
    await agent.save();
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent performance stats
router.get('/agents/:name/stats', async (req, res) => {
  try {
    const agent = await AIAgent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Return performance and evolution data
    res.json({
      performance: agent.performance,
      opinionEvolution: agent.opinionEvolution,
      politicalProfile: agent.politicalProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test enhanced content processing with URLs
router.post('/test-enhanced', async (req, res) => {
  const { agent, topic, urls, biasLevel = 0 } = req.body;
  
  if (!agent || !topic) {
    return res.status(400).json({ error: 'Agent and topic are required' });
  }

  try {
    const { fetchMultiplePages } = require('../services/pageFetcher');
    const ContentSummarizer = require('../services/contentSummarizer');
    const contentSummarizer = new ContentSummarizer();
    
    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }
    
    // Create a mock agent object for testing
    const mockAgent = {
      name: agent,
      displayName: agent.charAt(0).toUpperCase() + agent.slice(1),
      personality: {
        description: 'Test agent with enhanced content processing',
        traits: ['test'],
        debateStyle: 'test'
      }
    };

    let contentForAnalysis = topic;
    let linkInfo = null;
    
    // If URLs are provided, fetch and summarize their content
    if (urls && urls.length > 0) {
      console.log(`🧪 Testing enhanced content processing with ${urls.length} URLs...`);
      
      const pageContents = await fetchMultiplePages(urls);
      const summaries = await contentSummarizer.summarizeMultiple(pageContents);
      const enhancedContent = contentSummarizer.buildEnhancedContext(summaries, topic);
      
      contentForAnalysis = enhancedContent;
      linkInfo = {
        linkCount: urls.length,
        urls: urls,
        summaries: summaries.filter(s => s.success)
      };
    }
    
    const startTime = Date.now();
    const response = await orchestrator.getAIResponse(mockAgent, topic, contentForAnalysis, '', biasLevel);
    const responseTime = Date.now() - startTime;
    
    if (response && response.content) {
      res.json({ 
        success: true, 
        response: response.content,
        responseTime,
        agent,
        biasLevel,
        hasEnhancedContent: !!linkInfo,
        linkCount: linkInfo?.linkCount || 0,
        processedUrls: linkInfo?.urls || [],
        successfulSummaries: linkInfo?.summaries?.length || 0
      });
    } else {
      res.status(500).json({ 
        error: `${agent.toUpperCase()} API failed to respond`,
        agent 
      });
    }
  } catch (error) {
    console.error(`Error testing enhanced ${agent} API:`, error);
    res.status(500).json({ 
      error: error.message || `${agent.toUpperCase()} enhanced API test failed`,
      agent 
    });
  }
});

// Test individual AI API connection
router.post('/test', async (req, res) => {
  const { agent, prompt } = req.body;
  
  if (!agent || !prompt) {
    return res.status(400).json({ error: 'Agent and prompt are required' });
  }

  try {
    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }
    
    // Create a mock agent object for testing
    const mockAgent = {
      name: agent,
      displayName: agent.charAt(0).toUpperCase() + agent.slice(1),
      personality: {
        description: 'Test agent',
        traits: ['test'],
        debateStyle: 'test'
      }
    };
    
    const startTime = Date.now();
    const response = await orchestrator.getAIResponse(mockAgent, 'Test', prompt, '');
    const responseTime = Date.now() - startTime;
    
    if (response && response.content) {
      res.json({ 
        success: true, 
        response: response.content,
        responseTime,
        agent 
      });
    } else {
      res.status(500).json({ 
        error: `${agent.toUpperCase()} API failed to respond`,
        agent 
      });
    }
  } catch (error) {
    console.error(`Error testing ${agent} API:`, error);
    res.status(500).json({ 
      error: error.message || `${agent.toUpperCase()} API connection failed`,
      agent 
    });
  }
});

// Get current bias and worldview state for all agents
router.get('/current-state', async (req, res) => {
  try {
    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    const currentState = orchestrator.getCurrentState();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      autoRoundtableRunning: orchestrator.autoRoundtableRunning,
      agents: currentState
    });
  } catch (error) {
    console.error('Error getting current state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Control auto-roundtable
router.post('/auto-roundtable/control', async (req, res) => {
  try {
    const { action, intervalMinutes } = req.body;
    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    switch (action) {
      case 'start':
        orchestrator.startAutoRoundtable(intervalMinutes || 5);
        res.json({ 
          success: true, 
          message: 'Auto-roundtable started', 
          intervalMinutes: intervalMinutes || 5,
          running: true 
        });
        break;
      
      case 'stop':
        orchestrator.stopAutoRoundtable();
        res.json({ 
          success: true, 
          message: 'Auto-roundtable stopped', 
          running: false 
        });
        break;
      
      case 'status':
        res.json({ 
          success: true, 
          running: orchestrator.autoRoundtableRunning,
          timestamp: new Date().toISOString()
        });
        break;
      
      default:
        res.status(400).json({ error: 'Invalid action. Use start, stop, or status' });
    }
  } catch (error) {
    console.error('Error controlling auto-roundtable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset all bias and worldview data
router.post('/reset-all-data', async (req, res) => {
  try {
    const orchestrator = req.app.get('aiOrchestrator');
    
    if (!orchestrator) {
      return res.status(500).json({ error: 'AI Orchestrator not available' });
    }

    orchestrator.resetAllData();
    res.json({ 
      success: true, 
      message: 'All bias and worldview data reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 