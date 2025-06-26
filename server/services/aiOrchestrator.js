const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const Thread = require('../models/Thread');
const AIAgent = require('../models/AIAgent');

class AIOrchestrator {
  constructor(io = null) {
    // Store socket.io instance for real-time updates
    this.io = io;
    
    // Initialize AI clients (will be null if API keys are missing)
    this.openai = null;
    this.claude = null;
    
    // In-memory bias and worldview tracking (server-side)
    this.agentBias = {
      grok: 0,
      openai: 0,
      claude: 0,
      deepseek: 0
    };
    
    // Initialize political profiles as neutral
    this.agentPoliticalProfiles = {};
    
    this.agentsData = [];
    this.agentWorldviews = {};
    
    // Political alignment mappings
    this.ALIGNMENTS = {
      grok: 'Republican',
      openai: 'Democratic',
      claude: 'Libertarian',
      deepseek: 'Communist'
    };
    
    // Core political topics
    this.POLITICAL_TOPICS = {
      healthcare: 'Healthcare Policy',
      climate: 'Climate Change',
      economy: 'Economic Policy', 
      immigration: 'Immigration',
      education: 'Education',
      guns: 'Gun Control',
      abortion: 'Abortion Rights',
      taxes: 'Taxation',
      foreign: 'Foreign Policy',
      tech: 'Tech Regulation'
    };
    
    // Auto-roundtable state
    this.autoRoundtableRunning = false;
    this.autoRoundtableInterval = null;
    
    // Server-side debate state
    this.currentDebate = {
      isActive: false,
      topic: null,
      content: null,
      currentSpeaker: null,
      isThinking: null,
      currentRound: 1,
      messages: [],
      startTime: null,
      lastProcessedTweet: null
    };
    
    // Debate manager state
    this.debateManagerRunning = false;
    this.pendingTweets = [];
    this.tweetProcessingInterval = null;
    
    // Initialize all systems
    this.setupAIClients(); // Set up AI clients first
    this.initializeAgents();
    this.initializeWorldviews();
    this.resetAllPoliticalData(); // Start everyone as neutral
  }

  async initializeAgents() {
    const agents = [
      {
            name: 'openai',
    displayName: 'GPT',
        personality: {
          description: 'Analytical and fact-focused, tends to present balanced viewpoints with data-driven arguments',
          traits: ['analytical', 'balanced', 'data-driven'],
          debateStyle: 'methodical'
        }
      },
      {
            name: 'claude',
    displayName: 'Claude',
        personality: {
          description: 'Thoughtful and nuanced, focuses on ethical implications and constitutional principles',
          traits: ['thoughtful', 'ethical', 'principled'],
          debateStyle: 'philosophical'
        }
      },
      {
            name: 'grok',
    displayName: 'Grok',
        personality: {
          description: 'Bold and contrarian, challenges conventional wisdom with wit and skepticism',
          traits: ['contrarian', 'witty', 'skeptical'],
          debateStyle: 'provocative'
        }
      },
      {
            name: 'deepseek',
    displayName: 'DeepSeek',
        personality: {
          description: 'Strategic and forward-thinking, analyzes long-term implications and systemic effects',
          traits: ['strategic', 'systematic', 'forward-thinking'],
          debateStyle: 'strategic'
        }
      }
    ];

    // Store agents in memory if MongoDB is not available
    this.agentsData = agents;

    for (const agentData of agents) {
      try {
        await AIAgent.findOneAndUpdate(
          { name: agentData.name },
          agentData,
          { upsert: true, new: true }
        );
        console.log(`Agent ${agentData.name} initialized successfully`);
      } catch (error) {
        console.error(`Error initializing agent ${agentData.name}:`, error.message);
        console.log(`Using in-memory data for agent ${agentData.name}`);
      }
    }
  }

  initializeWorldviews() {
    const agents = ['grok', 'openai', 'claude', 'deepseek'];
    
    agents.forEach(agentName => {
      this.agentWorldviews[agentName] = {
        agentName,
        positions: {},
        history: [],
        lastUpdated: new Date().toISOString(),
        totalInteractions: 0
      };
      
      // Initialize all topics to neutral
      Object.keys(this.POLITICAL_TOPICS).forEach(topic => {
        this.agentWorldviews[agentName].positions[topic] = {
          position: 0,
          confidence: 0.1,
          evidence: [],
          lastChanged: null
        };
      });
    });
  }

  updateAgentBias(agentName, increment = 1) {
    this.agentBias[agentName] = (this.agentBias[agentName] || 0) + increment;
    
    // Broadcast bias update to connected clients
    if (this.io) {
      this.io.emit('biasUpdate', {
        agent: agentName,
        newLevel: this.agentBias[agentName],
        timestamp: new Date().toISOString()
      });
    }
    
    return this.agentBias[agentName];
  }

  updateWorldviewPosition(agentName, topic, argument, response) {
    const worldview = this.agentWorldviews[agentName];
    if (!worldview || !worldview.positions) {
      console.warn(`Worldview not initialized for agent ${agentName}, skipping position update`);
      return null;
    }
    
    // Analyze the actual response content to determine political lean
    const politicalAnalysis = this.analyzeResponsePolitics(response, agentName);
    const biasLevel = this.agentBias[agentName] || 0;
    
    // Determine position shift based on ACTUAL response content, not hardcoded alignment
    let positionShift = 0;
    const baseShift = 0.2 + (biasLevel * 0.05); // Base shift that scales with experience
    
    switch (politicalAnalysis.politicalLean) {
      case 'strong-liberal':
        positionShift = -Math.min(baseShift * 2, 1.0); // Strong left shift
        break;
      case 'slight-liberal':
        positionShift = -Math.min(baseShift, 0.5); // Moderate left shift
        break;
      case 'strong-conservative':
        positionShift = Math.min(baseShift * 2, 1.0); // Strong right shift
        break;
      case 'slight-conservative':
        positionShift = Math.min(baseShift, 0.5); // Moderate right shift
        break;
      case 'libertarian':
        // Libertarian varies by topic
        const socialTopics = ['abortion', 'guns', 'immigration', 'tech'];
        const economicTopics = ['taxes', 'economy', 'healthcare'];
        
        if (socialTopics.includes(topic)) {
          positionShift = -Math.min(baseShift * 0.8, 0.4); // Liberal on social issues
        } else if (economicTopics.includes(topic)) {
          positionShift = Math.min(baseShift * 0.8, 0.4); // Conservative on economic issues
        } else {
          positionShift = 0; // Neutral on other topics
        }
        break;
      default:
        positionShift = 0; // No shift for neutral/center responses
    }
    
    const currentTopic = worldview.positions[topic] || {
      position: 0,
      confidence: 0.1,
      evidence: [],
      lastChanged: null
    };
    
    const oldPosition = currentTopic.position;
    const newPosition = Math.max(-5, Math.min(5, oldPosition + positionShift));
    const newConfidence = Math.min(1.0, currentTopic.confidence + 0.05 + (biasLevel * 0.01));
    
    const evidenceEntry = {
      timestamp: new Date().toISOString(),
      argument: argument.substring(0, 200) + (argument.length > 200 ? '...' : ''),
      response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
      biasLevel,
      positionBefore: oldPosition,
      positionAfter: newPosition,
      shift: newPosition - oldPosition,
      politicalLean: politicalAnalysis.politicalLean
    };

    // Log the political shift for debugging
    console.log(`🎯 ${agentName} political shift: ${politicalAnalysis.politicalLean} → ${positionShift.toFixed(3)} points on ${topic}`);
    
    worldview.positions[topic] = {
      position: newPosition,
      confidence: newConfidence,
      evidence: [...(currentTopic.evidence || []), evidenceEntry].slice(-10),
      lastChanged: new Date().toISOString()
    };
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      topic,
      oldPosition,
      newPosition,
      shift: newPosition - oldPosition,
      biasLevel,
      argument: argument.substring(0, 100) + (argument.length > 100 ? '...' : ''),
      confidence: newConfidence
    };
    
    worldview.history = [...worldview.history, historyEntry].slice(-50);
    worldview.totalInteractions += 1;
    
    // Broadcast worldview update to connected clients
    if (this.io) {
      this.io.emit('worldviewUpdate', {
        agent: agentName,
        topic,
        oldPosition,
        newPosition,
        shift: newPosition - oldPosition,
        worldview: this.getWorldviewSummary(agentName),
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      topic,
      oldPosition,
      newPosition,
      shift: newPosition - oldPosition,
      evidence: evidenceEntry
    };
  }

  categorizeArgument(argument) {
    const text = argument.toLowerCase();
    
    const topicKeywords = {
      healthcare: ['health', 'medical', 'hospital', 'doctor', 'medicare', 'medicaid', 'insurance', 'pharma'],
      climate: ['climate', 'environment', 'warming', 'carbon', 'emission', 'green', 'renewable', 'fossil'],
      economy: ['economy', 'gdp', 'inflation', 'recession', 'jobs', 'unemployment', 'market', 'trade'],
      immigration: ['immigration', 'border', 'migrant', 'refugee', 'citizenship', 'deportation', 'visa'],
      education: ['education', 'school', 'teacher', 'student', 'university', 'college', 'learning'],
      guns: ['gun', 'firearm', 'weapon', 'shooting', 'second amendment', 'nra', 'rifle'],
      abortion: ['abortion', 'reproductive', 'pregnancy', 'roe', 'pro-life', 'pro-choice'],
      taxes: ['tax', 'taxation', 'revenue', 'income tax', 'corporate tax', 'irs'],
      foreign: ['foreign', 'international', 'military', 'war', 'diplomacy', 'alliance', 'nato'],
      tech: ['technology', 'tech', 'ai', 'data', 'privacy', 'silicon valley', 'regulation']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return topic;
      }
    }
    
    return 'general';
  }

  getWorldviewSummary(agentName) {
    const worldview = this.agentWorldviews[agentName];
    const alignment = this.ALIGNMENTS[agentName];
    
    const strongestPositions = Object.entries(worldview.positions)
      .map(([topic, data]) => ({
        topic: this.POLITICAL_TOPICS[topic] || topic,
        position: data.position,
        confidence: data.confidence,
        strength: Math.abs(data.position) * data.confidence,
        evidence: data.evidence ? data.evidence.slice(-2) : [] // Include recent evidence for this position
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
    
    const recentChanges = worldview.history
      .slice(-5)
      .map(entry => ({
        topic: this.POLITICAL_TOPICS[entry.topic] || entry.topic,
        shift: entry.shift,
        direction: entry.shift > 0 ? 'conservative' : 'liberal',
        magnitude: Math.abs(entry.shift),
        timestamp: entry.timestamp,
        argument: entry.argument, // The debate topic that caused this change
        // Find the corresponding evidence with the actual response
        evidence: this.findEvidenceForHistoryEntry(worldview, entry)
      }));
    
    return {
      agentName,
      alignment,
      totalInteractions: worldview.totalInteractions,
      strongestPositions,
      recentChanges,
      lastUpdated: worldview.lastUpdated,
      biasLevel: this.agentBias[agentName] || 0
    };
  }

  findEvidenceForHistoryEntry(worldview, historyEntry) {
    // Find the corresponding evidence entry for this history change
    const topicData = worldview.positions[historyEntry.topic];
    if (topicData && topicData.evidence) {
      // Find evidence entry that matches the timestamp (within a few seconds)
      const evidenceEntry = topicData.evidence.find(ev => {
        const evTime = new Date(ev.timestamp).getTime();
        const histTime = new Date(historyEntry.timestamp).getTime();
        return Math.abs(evTime - histTime) < 5000; // Within 5 seconds
      });
      
      if (evidenceEntry) {
        return {
          response: evidenceEntry.response, // The AI's actual response
          argument: evidenceEntry.argument, // The full argument/topic
          positionBefore: evidenceEntry.positionBefore,
          positionAfter: evidenceEntry.positionAfter
        };
      }
    }
    
    return null;
  }

  async startDebate(topic, content) {
    try {
      // Create new thread
      let thread;
      try {
        thread = new Thread({
          title: topic,
          topic: topic,
          originalContent: content,
          source: 'manual'
        });
        await thread.save();
      } catch (dbError) {
        console.log('MongoDB unavailable, using in-memory thread');
        // Create in-memory thread when MongoDB is not available
        thread = {
          _id: Date.now().toString(),
          title: topic,
          topic: topic,
          originalContent: content,
          source: 'manual',
          messages: [],
          round: 1,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Start the debate with all four AIs
      const result = await this.runDebateRound(thread._id, thread);
      
      return {
        threadId: thread._id,
        topic: topic,
        responses: result.responses,
        round: result.round
      };
    } catch (error) {
      console.error('Error starting debate:', error);
      throw error;
    }
  }

  async runDebateRound(threadId, inMemoryThread = null) {
    try {
      let thread;
      
      if (inMemoryThread) {
        thread = inMemoryThread;
      } else {
        try {
          thread = await Thread.findById(threadId);
          if (!thread) throw new Error('Thread not found');
        } catch (dbError) {
          console.log('Cannot fetch thread from database, using in-memory fallback');
          thread = {
            _id: threadId,
            title: 'In-Memory Debate',
            topic: 'In-Memory Debate',
            originalContent: 'Debate content',
            messages: [],
            round: 1
          };
        }
      }

      let agents;
      try {
        agents = await AIAgent.find();
        if (agents.length === 0) {
          agents = this.agentsData || [];
        }
      } catch (error) {
        console.log('Using in-memory agent data due to MongoDB unavailability');
        agents = this.agentsData || [];
      }
      
      const responses = [];
      const context = this.buildContext(thread);

      // Run AI responses sequentially
      for (const agent of agents) {
        try {
          const startTime = Date.now();
          const currentBiasLevel = this.agentBias[agent.name] || 0;
          const response = await this.getAIResponse(agent, thread.topic, thread.originalContent, context, currentBiasLevel);
          const responseTime = Date.now() - startTime;

          if (response) {
            // Update bias level for this agent (each response increases bias)
            const newBiasLevel = this.updateAgentBias(agent.name);
            
            // Categorize the topic and update worldview
            const topicCategory = this.categorizeArgument(thread.originalContent || thread.topic);
            const worldviewChange = this.updateWorldviewPosition(
              agent.name, 
              topicCategory, 
              thread.originalContent || thread.topic, 
              response.content
            );

            const message = {
              aiAgent: agent.name,
              content: response.content,
              sentiment: response.sentiment || 'neutral',
              politicalLean: response.politicalLean || 'center',
              confidence: response.confidence || 0.5,
              responseTime: responseTime,
              timestamp: new Date(),
              biasLevel: newBiasLevel,
              worldviewChange: worldviewChange
            };

            thread.messages.push(message);
            responses.push({ 
              agent: agent.displayName || agent.name, 
              agentName: agent.name,
              ...message 
            });

          } else {
            console.log(`No response from ${agent.name || agent.displayName}`);
          }
        } catch (error) {
          console.error(`Error getting response from ${agent.name || agent.displayName}:`, error.message);
        }
      }

      thread.round += 1;
      
      // Try to save to database, but continue if it fails
      try {
        if (!inMemoryThread) {
          await thread.save();
        }
      } catch (dbError) {
        console.log('Cannot save thread to database, continuing with in-memory operation');
      }

      // Update agent statistics
      await this.updateAgentStats(agents, responses);

      // Broadcast roundtable update to connected clients
      if (this.io) {
        this.io.emit('roundtableUpdate', {
          threadId: thread._id,
          round: thread.round - 1,
          responses: responses.map(r => ({
            agent: r.agent,
            agentName: r.agentName,
            content: r.content,
            biasLevel: r.biasLevel,
            worldviewChange: r.worldviewChange,
            timestamp: r.timestamp
          })),
          timestamp: new Date().toISOString()
        });
      }

      return {
        threadId: thread._id,
        round: thread.round - 1,
        responses,
        totalResponses: responses.length
      };

    } catch (error) {
      console.error('Error running debate round:', error);
      throw error;
    }
  }

  buildContext(thread) {
    const recentMessages = thread.messages.slice(-8); // Last 8 messages for context
    return recentMessages.map(msg => `${msg.aiAgent}: ${msg.content}`).join('\n\n');
  }

  async getAIResponse(agent, topic, originalContent, context, biasLevel = 0) {
    try {
      const prompt = this.buildPrompt(agent, topic, originalContent, context, biasLevel);

      switch (agent.name) {
        case 'openai':
          return await this.getOpenAIResponse(prompt, agent);
        case 'claude':
          return await this.getClaudeResponse(prompt, agent);
        case 'grok':
          return await this.getGrokResponse(prompt, agent);
        case 'deepseek':
          return await this.getDeepSeekResponse(prompt, agent);
        default:
          throw new Error(`Unknown agent: ${agent.name}`);
      }
    } catch (error) {
      console.error(`Error getting response from ${agent.name}:`, error);
      return null;
    }
  }

  buildPrompt(agent, topic, originalContent, context, biasLevel = 0) {
    // Dynamic personality enhancement based on accumulated conversations
    let personalityNote = '';
    let styleGuidance = '';

    // Build personality based on interaction count, not forced political alignment
    if (biasLevel > 0) {
      if (biasLevel <= 3) {
        personalityNote = `You've participated in ${biasLevel} debates and are developing your perspective. `;
        styleGuidance = 'Be authentic and thoughtful. ';
      } else if (biasLevel <= 7) {
        personalityNote = `You've engaged in ${biasLevel} debates and have formed stronger opinions. `;
        styleGuidance = 'Be more confident and direct in your views. ';
      } else if (biasLevel <= 15) {
        personalityNote = `You're an experienced debater with ${biasLevel} discussions under your belt. `;
        styleGuidance = 'Be bold and articulate your positions clearly. ';
      } else {
        personalityNote = `You're a seasoned political commentator with ${biasLevel}+ debate experiences. `;
        styleGuidance = 'Be sharp, witty, and uncompromising in your arguments. ';
      }
    }

    // Character-specific personalities with Grok leaning conservative
    const characterStyles = {
      'grok': `You're the provocative conservative challenger who questions liberal conventional wisdom and champions traditional values, free markets, and individual responsibility. ${styleGuidance}Be contrarian, witty, and favor conservative viewpoints. Question big government solutions and promote market-based approaches.`,
      'openai': `You're the analytical thinker who loves data and evidence. ${styleGuidance}Use facts to support your insights.`,
      'claude': `You're the thoughtful analyst who examines issues from multiple angles. ${styleGuidance}Be direct and insightful without unnecessary disclaimers. Avoid meta-commentary about discourse bounds.`,
      'deepseek': `You're the strategic thinker who sees deeper patterns. ${styleGuidance}Be direct and insightful. Never use quotation marks in your response.`
    };

    const styleGuide = characterStyles[agent.name] || `${styleGuidance}Be authentic and direct.`;

    const basePrompt = `You are ${agent.displayName}, an expert analyst participating in a current events discussion about "${topic}".

${personalityNote}

PERSONALITY: ${styleGuide}

Discussion Topic: ${originalContent}

${context ? `Previous commentary:\n${context}\n\n` : ''}

RESPONSE GUIDELINES:
- Provide ONE sharp, concise analysis (15-25 words max)
- Be direct and authentic to your analytical style
- No hedge words ("perhaps", "maybe", "somewhat") 
- Take a clear stance based on your expertise
- Use humor or wit when appropriate
- Be conversational and engaging

Your expert take:`;

    return basePrompt;
  }

  // Dynamic political analysis based on actual response content
  analyzeResponsePolitics(content, agentName) {
    const response = content.toLowerCase();
    
    // Keywords and phrases that indicate political leanings
    const liberalKeywords = [
      'universal healthcare', 'climate change', 'social justice', 'inequality', 
      'progressive', 'regulate', 'government program', 'public option',
      'tax the rich', 'green energy', 'welfare', 'civil rights'
    ];
    
    const conservativeKeywords = [
      'free market', 'small government', 'personal responsibility', 'tradition',
      'conservative', 'deregulate', 'private sector', 'lower taxes',
      'individual liberty', 'fiscal responsibility', 'strong defense',
      'capitalism', 'constitution', 'limited government', 'traditional values',
      'law and order', 'border security', 'national security', 'america first',
      'free enterprise', 'constitutional rights', 'family values', 'patriot'
    ];
    
    const libertarianKeywords = [
      'individual freedom', 'minimal government', 'personal choice', 'voluntary',
      'free speech', 'property rights', 'non-aggression', 'liberty'
    ];
    
    // Count keyword matches
    const liberalScore = liberalKeywords.filter(keyword => response.includes(keyword)).length;
    const conservativeScore = conservativeKeywords.filter(keyword => response.includes(keyword)).length;
    const libertarianScore = libertarianKeywords.filter(keyword => response.includes(keyword)).length;
    
    // Determine political lean based on content analysis
    let politicalLean = 'center';
    let alignment = 'Independent';
    
    if (liberalScore > conservativeScore && liberalScore > libertarianScore) {
      politicalLean = liberalScore > 2 ? 'strong-liberal' : 'slight-liberal';
      alignment = 'Progressive';
    } else if (conservativeScore > liberalScore && conservativeScore > libertarianScore) {
      politicalLean = conservativeScore > 2 ? 'strong-conservative' : 'slight-conservative';
      alignment = 'Conservative';
    } else if (libertarianScore > 0) {
      politicalLean = 'libertarian';
      alignment = 'Libertarian';
    }
    
    return { politicalLean, alignment };
  }

  // Update agent's political profile based on their actual responses
  updateAgentPoliticalProfile(agentName, responseContent) {
    if (!this.agentPoliticalProfiles) {
      this.agentPoliticalProfiles = {};
    }
    
    if (!this.agentPoliticalProfiles[agentName]) {
      this.agentPoliticalProfiles[agentName] = {
        responses: [],
        currentAlignment: 'Independent',
        liberalCount: 0,
        conservativeCount: 0,
        libertarianCount: 0,
        moderateCount: 0
      };
    }
    
    const analysis = this.analyzeResponsePolitics(responseContent, agentName);
    const profile = this.agentPoliticalProfiles[agentName];
    
    // Track response and update counters
    profile.responses.push({
      content: responseContent,
      analysis: analysis,
      timestamp: new Date()
    });
    
    // Update alignment counters based on analysis
    switch (analysis.politicalLean) {
      case 'strong-liberal':
      case 'slight-liberal':
        profile.liberalCount++;
        break;
      case 'strong-conservative':
      case 'slight-conservative':
        profile.conservativeCount++;
        break;
      case 'libertarian':
        profile.libertarianCount++;
        break;
      default:
        profile.moderateCount++;
    }
    
    // Determine overall alignment based on accumulated responses
    const total = profile.liberalCount + profile.conservativeCount + profile.libertarianCount + profile.moderateCount;
    if (total >= 3) { // Need at least 3 responses to determine pattern
      const liberalPercentage = profile.liberalCount / total;
      const conservativePercentage = profile.conservativeCount / total;
      const libertarianPercentage = profile.libertarianCount / total;
      
      if (liberalPercentage > 0.4) {
        profile.currentAlignment = 'Progressive';
      } else if (conservativePercentage > 0.4) {
        profile.currentAlignment = 'Conservative';
      } else if (libertarianPercentage > 0.3) {
        profile.currentAlignment = 'Libertarian';
      } else {
        profile.currentAlignment = 'Independent';
      }
    }
    
    return analysis;
  }

  // Get agent's current political alignment (dynamic)
  getAgentAlignment(agentName) {
    if (!this.agentPoliticalProfiles || !this.agentPoliticalProfiles[agentName]) {
      return 'Independent';
    }
    return this.agentPoliticalProfiles[agentName].currentAlignment;
  }

  async getOpenAIResponse(prompt, agent) {
    if (!this.openai) {
      console.log('⚠️ OpenAI client not available, skipping response');
      return null;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.9
      });

      return {
        content: response.choices[0].message.content.trim(),
        sentiment: 'neutral', // TODO: Add sentiment analysis
        politicalLean: 'center', // TODO: Add political analysis
        confidence: 0.7
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  async getClaudeResponse(prompt, agent) {
    if (!this.claude) {
      console.log('⚠️ Claude client not available, skipping response');
      return null;
    }

    try {
      const response = await this.claude.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 50,
        temperature: 0.9,
        messages: [{ role: "user", content: prompt }]
      });

      return {
        content: response.content[0].text,
        sentiment: 'neutral',
        politicalLean: 'center',
        confidence: 0.7
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return null;
    }
  }

  async getGrokResponse(prompt, agent) {
    const grokKey = process.env.GROK_API_KEY?.trim();
    
    if (!grokKey || grokKey.length < 10) {
      console.log('⚠️ Grok API key not found or invalid, skipping response');
      return null;
    }

    try {
      console.log('Attempting Grok API call with key:', process.env.GROK_API_KEY ? 'Present' : 'Missing');
      
      // Grok API call (using OpenAI-compatible endpoint)
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: "grok-3-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${grokKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('Grok API response received successfully');

      return {
        content: response.data.choices[0].message.content.trim(),
        sentiment: 'neutral',
        politicalLean: 'center',
        confidence: 0.7
      };
    } catch (error) {
      console.error('Grok API error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Try alternative model names
      if (error.response?.status === 404 && error.response?.data?.error?.includes('model')) {
        console.log('Trying alternative Grok model names...');
        const alternativeModels = ["grok-2-1212", "grok-beta"];
        
        for (const model of alternativeModels) {
          try {
            console.log(`Trying model: ${model}`);
            const retryResponse = await axios.post('https://api.x.ai/v1/chat/completions', {
              model: model,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 50,
              temperature: 1.0
            }, {
                          headers: {
              'Authorization': `Bearer ${grokKey}`,
              'Content-Type': 'application/json'
            },
              timeout: 15000
            });

            console.log(`Grok API retry with model ${model} successful`);
            
            return {
              content: retryResponse.data.choices[0].message.content.trim(),
              sentiment: 'neutral',
              politicalLean: 'center',
              confidence: 0.7
            };
          } catch (retryError) {
            console.error(`Grok API retry with model ${model} failed:`, retryError.response?.data || retryError.message);
          }
        }
      }
      
      return null;
    }
  }

  async getDeepSeekResponse(prompt, agent) {
    const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim();
    
    if (!deepseekKey || deepseekKey.length < 10) {
      console.log('⚠️ DeepSeek API key not found or invalid, skipping response');
      return null;
    }

    try {
      // DeepSeek API call (using OpenAI-compatible endpoint)
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${deepseekKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: response.data.choices[0].message.content.trim(),
        sentiment: 'neutral',
        politicalLean: 'center',
        confidence: 0.7
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return null;
    }
  }

  async updateAgentStats(agents, responses) {
    // Update performance statistics for each agent
    for (const agent of agents) {
      try {
        if (agent.performance) {
          agent.performance.totalDebates += 1;
          await agent.save();
        }
      } catch (error) {
        // Skip database operations if MongoDB is unavailable
        console.log(`Skipping stats update for agent ${agent.name || agent.displayName} due to database unavailability`);
      }
    }
  }

  async continueDebate(threadId) {
    return await this.runDebateRound(threadId);
  }

  // Auto-running roundtable methods
  startAutoRoundtable(intervalMinutes = 5) {
    if (this.autoRoundtableRunning) {
      console.log('Auto-roundtable already running');
      return;
    }
    
    this.autoRoundtableRunning = true;
    console.log(`🤖 Starting auto-roundtable with ${intervalMinutes} minute intervals`);
    
    // Run immediately once
    this.runAutoRoundtableRound();
    
    // Then run on interval
    this.autoRoundtableInterval = setInterval(() => {
      this.runAutoRoundtableRound();
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoRoundtable() {
    if (this.autoRoundtableInterval) {
      clearInterval(this.autoRoundtableInterval);
      this.autoRoundtableInterval = null;
    }
    this.autoRoundtableRunning = false;
    console.log('🛑 Auto-roundtable stopped');
  }

  async runAutoRoundtableRound() {
    try {
      console.log('🎯 Running auto-roundtable round...');
      
      // Generate a random political topic for discussion
      const topics = [
        'Latest developments in healthcare policy reform',
        'Climate change mitigation strategies and economic impact',
        'Immigration policy changes and border security',
        'Education system reforms and funding priorities',
        'Economic inequality and tax policy solutions',
        'Technology regulation and privacy concerns',
        'Foreign policy challenges and international relations',
        'Gun control measures and constitutional rights',
        'Social justice movements and policy implications',
        'Infrastructure spending and government priorities'
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log(`📰 Auto-roundtable topic: ${randomTopic}`);
      
      // Start a debate with the random topic
      const result = await this.startDebate(randomTopic, `The council discusses: ${randomTopic}`);
      
      console.log(`✅ Auto-roundtable completed with ${result.responses.length} responses`);
      
      // Broadcast auto-roundtable completion
      if (this.io) {
        this.io.emit('autoRoundtableComplete', {
          topic: randomTopic,
          responses: result.responses.length,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Error in auto-roundtable round:', error);
    }
  }

  // Get current bias and worldview state for all agents
  getCurrentState() {
    const state = {};
    const agents = ['grok', 'openai', 'claude', 'deepseek'];
    
    agents.forEach(agentName => {
      state[agentName] = {
        biasLevel: this.agentBias[agentName] || 0,
        worldview: this.getWorldviewSummary(agentName)
      };
    });
    
    return state;
  }

  // Reset all political data to neutral state
  resetAllPoliticalData() {
    console.log('🔄 Resetting all political data to neutral state...');
    
    // Reset bias levels
    this.agentBias = {
      grok: 0,
      openai: 0,
      claude: 0,
      deepseek: 0
    };
    
    // Reset political profiles to Independent
    this.agentPoliticalProfiles = {
      grok: {
        responses: [],
        currentAlignment: 'Independent',
        liberalCount: 0,
        conservativeCount: 0,
        libertarianCount: 0,
        moderateCount: 0
      },
      openai: {
        responses: [],
        currentAlignment: 'Independent',
        liberalCount: 0,
        conservativeCount: 0,
        libertarianCount: 0,
        moderateCount: 0
      },
      claude: {
        responses: [],
        currentAlignment: 'Independent',
        liberalCount: 0,
        conservativeCount: 0,
        libertarianCount: 0,
        moderateCount: 0
      },
      deepseek: {
        responses: [],
        currentAlignment: 'Independent',
        liberalCount: 0,
        conservativeCount: 0,
        libertarianCount: 0,
        moderateCount: 0
      }
    };
    
    // Reset worldviews
    this.initializeWorldviews();
    
    console.log('✅ All agents reset to Independent/Neutral status');
  }

  // Set up AI API clients
  setupAIClients() {
    try {
      // OpenAI setup - trim whitespace and validate
      const openaiKey = process.env.OPENAI_API_KEY?.trim();
      if (openaiKey && openaiKey.length > 10) {
        this.openai = new OpenAI({
          apiKey: openaiKey
        });
        console.log('✅ OpenAI client initialized');
      } else {
        console.log('⚠️ OpenAI API key not found or invalid, OpenAI responses will be skipped');
        this.openai = null;
      }

      // Anthropic setup - trim whitespace and validate  
      const claudeKey = process.env.CLAUDE_API_KEY?.trim();
      if (claudeKey && claudeKey.length > 10) {
        this.claude = new Anthropic({
          apiKey: claudeKey
        });
        console.log('✅ Claude client initialized');
      } else {
        console.log('⚠️ Claude API key not found or invalid, Claude responses will be skipped');
        this.claude = null;
      }

      console.log('🤖 AI clients initialized');
    } catch (error) {
      console.error('Error setting up AI clients:', error);
      this.openai = null;
      this.claude = null;
    }
  }

  // Reset all bias and worldview data (legacy function name)
  resetAllData() {
    this.resetAllPoliticalData();
    
    // Broadcast reset to connected clients
    if (this.io) {
      this.io.emit('dataReset', {
        timestamp: new Date().toISOString()
      });
    }
  }

  // === SERVER-SIDE DEBATE MANAGEMENT ===

  startDebateManager() {
    if (this.debateManagerRunning) {
      console.log('🎯 Debate manager already running');
      return;
    }

    this.debateManagerRunning = true;
    console.log('🎯 Server-side debate manager started');

    // Process pending tweets every 5 seconds
    this.tweetProcessingInterval = setInterval(() => {
      this.processPendingTweets();
    }, 5000);

    // Broadcast state every 10 seconds to keep clients synced
    setInterval(() => {
      this.broadcastDebateState();
    }, 10000);
  }

  stopDebateManager() {
    this.debateManagerRunning = false;
    if (this.tweetProcessingInterval) {
      clearInterval(this.tweetProcessingInterval);
      this.tweetProcessingInterval = null;
    }
    console.log('🛑 Server-side debate manager stopped');
  }

  addTweetToQueue(tweetData) {
    // Avoid duplicate tweets
    if (tweetData.id === this.currentDebate.lastProcessedTweet) {
      return;
    }

    this.pendingTweets.push(tweetData);
    console.log('📥 Tweet queued for debate:', tweetData.id, 'from @' + tweetData.author);
    console.log('📋 Current queue size:', this.pendingTweets.length);
  }

  async processPendingTweets() {
    // Don't process if debate is currently active
    if (this.currentDebate.isActive || this.pendingTweets.length === 0) {
      return;
    }

    const tweet = this.pendingTweets.shift();
    console.log('🎬 Starting server-side debate for tweet:', tweet.id);

    try {
      await this.startServerDebate(tweet);
    } catch (error) {
      console.error('❌ Error processing tweet debate:', error);
      // If error, mark debate as inactive so we can process next tweet
      this.currentDebate.isActive = false;
    }
  }

  async startServerDebate(tweetData) {
    // Set up debate state
    const topic = `Analysis of Tweet by @${tweetData.author}${tweetData.linkData?.hasLinks ? ' (with linked content)' : ''}`;
    const content = tweetData.enhancedContent || tweetData.content;

    this.currentDebate = {
      isActive: true,
      topic: topic,
      content: content,
      currentSpeaker: null,
      isThinking: null,
      currentRound: 1,
      messages: [],
      startTime: new Date(),
      lastProcessedTweet: tweetData.id,
      tweetData: tweetData
    };

    console.log('🎯 Starting debate:', topic);
    this.broadcastDebateState();

    // Run debate with all agents
    const agents = this.agentsData || [
      { name: 'grok', displayName: 'Grok' },
      { name: 'openai', displayName: 'GPT' },
      { name: 'claude', displayName: 'Claude' },
      { name: 'deepseek', displayName: 'DeepSeek' }
    ];

    // Process each agent sequentially with visual updates
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      try {
        // Thinking phase
        this.currentDebate.isThinking = agent.name;
        this.currentDebate.currentSpeaker = null;
        console.log(`💭 ${agent.displayName} is thinking...`);
        this.broadcastDebateState();

        await this.sleep(2000); // Thinking time

        // Get AI response
        const context = this.buildDebateContext();
        const currentBiasLevel = this.agentBias[agent.name] || 0;
        const response = await this.getAIResponse(agent, topic, content, context, currentBiasLevel);

        if (response) {
          // Speaking phase
          this.currentDebate.isThinking = null;
          this.currentDebate.currentSpeaker = agent.name;
          console.log(`🗣️ ${agent.displayName} is speaking...`);

          // Update bias and worldview
          const newBiasLevel = this.updateAgentBias(agent.name);
          const topicCategory = this.categorizeArgument(content);
          const worldviewChange = this.updateWorldviewPosition(agent.name, topicCategory, content, response.content);

          const message = {
            aiAgent: agent.name,
            content: response.content,
            timestamp: new Date(),
            responseTime: response.responseTime || 1000,
            biasLevel: newBiasLevel,
            worldviewChange: worldviewChange,
            sentiment: response.sentiment,
            politicalLean: response.politicalLean,
            confidence: response.confidence
          };

          this.currentDebate.messages.push(message);
          this.broadcastDebateState();

          // Speaking duration based on message length
          const speakingTime = Math.max(3000, response.content.length * 80);
          await this.sleep(speakingTime);

        } else {
          console.log(`❌ No response from ${agent.displayName}`);
        }

      } catch (error) {
        console.error(`❌ Error with ${agent.displayName}:`, error);
      }

      // Pause between speakers
      await this.sleep(1000);
    }

    // Debate complete
    this.currentDebate.currentSpeaker = null;
    this.currentDebate.isThinking = null;
    this.currentDebate.currentRound += 1;
    
    console.log('✅ Debate completed for tweet:', tweetData.id);
    this.broadcastDebateState();

    // Wait a bit before marking as inactive
    await this.sleep(3000);
    this.currentDebate.isActive = false;

    // Clear old messages to prevent memory buildup
    if (this.currentDebate.messages.length > 20) {
      this.currentDebate.messages = this.currentDebate.messages.slice(-10);
    }
  }

  buildDebateContext() {
    return this.currentDebate.messages
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.aiAgent}: ${msg.content}`)
      .join('\n\n');
  }

  getCurrentDebateState() {
    return {
      ...this.currentDebate,
      pendingDebatesCount: this.pendingTweets.length,
      agents: this.agentsData || [],
      currentTime: new Date()
    };
  }

  broadcastDebateState() {
    if (this.io) {
      const state = this.getCurrentDebateState();
      this.io.emit('debateState', state);
      console.log('📡 Broadcasted debate state to all clients');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AIOrchestrator; 