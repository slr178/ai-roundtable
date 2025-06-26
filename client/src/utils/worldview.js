// Worldview tracking for AI agents - tracks political positions on various topics
import { ALIGNMENTS } from './bias';

// Core political topics that we track worldviews on
export const POLITICAL_TOPICS = {
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

// Worldview position scale (-5 to +5, where negative is more liberal, positive is more conservative)
export const POSITION_SCALE = {
  '-5': 'Extremely Liberal',
  '-4': 'Very Liberal', 
  '-3': 'Liberal',
  '-2': 'Somewhat Liberal',
  '-1': 'Slightly Liberal',
  '0': 'Neutral/Moderate',
  '1': 'Slightly Conservative',
  '2': 'Somewhat Conservative',
  '3': 'Conservative',
  '4': 'Very Conservative',
  '5': 'Extremely Conservative'
};

/**
 * Get an agent's worldview on all topics
 */
export function getAgentWorldview(agentName) {
  const key = `worldview_${agentName}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize neutral worldview
  const initialWorldview = {
    agentName,
    positions: {},
    history: [],
    lastUpdated: new Date().toISOString(),
    totalInteractions: 0
  };
  
  // Initialize all topics to neutral
  Object.keys(POLITICAL_TOPICS).forEach(topic => {
    initialWorldview.positions[topic] = {
      position: 0, // Neutral
      confidence: 0.1, // Low confidence initially
      evidence: [],
      lastChanged: null
    };
  });
  
  saveAgentWorldview(agentName, initialWorldview);
  return initialWorldview;
}

/**
 * Save an agent's worldview
 */
export function saveAgentWorldview(agentName, worldview) {
  const key = `worldview_${agentName}`;
  worldview.lastUpdated = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(worldview));
}

/**
 * Update an agent's position on a specific topic based on an argument/response
 */
export function updateWorldviewPosition(agentName, topic, argument, response, biasLevel) {
  const worldview = getAgentWorldview(agentName);
  const alignment = ALIGNMENTS[agentName];
  
  // Determine position shift based on bias level and political alignment
  let positionShift = 0;
  
  if (alignment === 'Republican') {
    positionShift = Math.min(0.3 + (biasLevel * 0.1), 1.0); // Shift conservative
  } else if (alignment === 'Democratic') {
    positionShift = Math.max(-0.3 - (biasLevel * 0.1), -1.0); // Shift liberal
  } else if (alignment === 'Libertarian') {
    // Libertarian: varies by topic (liberal on social, conservative on economic)
    const socialTopics = ['abortion', 'guns', 'immigration', 'tech'];
    const economicTopics = ['taxes', 'economy', 'healthcare'];
    
    if (socialTopics.includes(topic)) {
      positionShift = Math.max(-0.2 - (biasLevel * 0.08), -0.8); // More liberal on social
    } else if (economicTopics.includes(topic)) {
      positionShift = Math.min(0.2 + (biasLevel * 0.08), 0.8); // More conservative on economic
    } else {
      positionShift = Math.random() > 0.5 ? 0.1 : -0.1; // Mixed on other topics
    }
  } else if (alignment === 'Communist') {
    positionShift = Math.max(-0.4 - (biasLevel * 0.12), -1.2); // Shift far left
  }
  
  // Get current position for this topic
  const currentTopic = worldview.positions[topic] || {
    position: 0,
    confidence: 0.1,
    evidence: [],
    lastChanged: null
  };
  
  // Calculate new position (bounded between -5 and +5)
  const oldPosition = currentTopic.position;
  const newPosition = Math.max(-5, Math.min(5, oldPosition + positionShift));
  
  // Increase confidence with each interaction
  const newConfidence = Math.min(1.0, currentTopic.confidence + 0.05 + (biasLevel * 0.01));
  
  // Create evidence entry
  const evidenceEntry = {
    timestamp: new Date().toISOString(),
    argument: argument.substring(0, 200) + (argument.length > 200 ? '...' : ''),
    response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
    biasLevel,
    positionBefore: oldPosition,
    positionAfter: newPosition,
    shift: newPosition - oldPosition
  };
  
  // Update the position
  worldview.positions[topic] = {
    position: newPosition,
    confidence: newConfidence,
    evidence: [...(currentTopic.evidence || []), evidenceEntry].slice(-10), // Keep last 10 pieces of evidence
    lastChanged: new Date().toISOString()
  };
  
  // Add to history
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
  
  worldview.history = [...worldview.history, historyEntry].slice(-50); // Keep last 50 history entries
  worldview.totalInteractions += 1;
  
  saveAgentWorldview(agentName, worldview);
  
  return {
    topic,
    oldPosition,
    newPosition,
    shift: newPosition - oldPosition,
    positionLabel: POSITION_SCALE[Math.round(newPosition).toString()] || 'Moderate',
    evidence: evidenceEntry
  };
}

/**
 * Get worldview summary for display
 */
export function getWorldviewSummary(agentName) {
  const worldview = getAgentWorldview(agentName);
  const alignment = ALIGNMENTS[agentName];
  
  // Get strongest positions
  const strongestPositions = Object.entries(worldview.positions)
    .map(([topic, data]) => ({
      topic: POLITICAL_TOPICS[topic] || topic,
      position: data.position,
      confidence: data.confidence,
      label: POSITION_SCALE[Math.round(data.position).toString()] || 'Moderate',
      strength: Math.abs(data.position) * data.confidence
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);
  
  // Get recent changes
  const recentChanges = worldview.history
    .slice(-5)
    .map(entry => ({
      topic: POLITICAL_TOPICS[entry.topic] || entry.topic,
      shift: entry.shift,
      direction: entry.shift > 0 ? 'conservative' : 'liberal',
      magnitude: Math.abs(entry.shift),
      timestamp: entry.timestamp
    }));
  
  return {
    agentName,
    alignment,
    totalInteractions: worldview.totalInteractions,
    strongestPositions,
    recentChanges,
    lastUpdated: worldview.lastUpdated
  };
}

/**
 * Reset an agent's worldview
 */
export function resetAgentWorldview(agentName) {
  const key = `worldview_${agentName}`;
  localStorage.removeItem(key);
}

/**
 * Reset all agents' worldviews
 */
export function resetAllWorldviews() {
  ['grok', 'gpt', 'claude', 'deepseek'].forEach(agent => {
    resetAgentWorldview(agent);
  });
}

/**
 * Categorize argument topic using keyword matching
 */
export function categorizeArgument(argument) {
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
  
  return 'general'; // Default topic if no match found
} 