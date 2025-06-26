// Dynamic bias tracking utilities for AI agent political evolution

export function getBiasLevel(agentName) {
  const key = `bias_${agentName}`;
  const n = parseInt(localStorage.getItem(key) || "0", 10);
  return n;
}

export function setBiasLevel(agentName, level) {
  const key = `bias_${agentName}`;
  localStorage.setItem(key, level.toString());
}

export function incrBiasLevel(agentName) {
  const key = `bias_${agentName}`;
  const n = getBiasLevel(agentName) + 1;
  localStorage.setItem(key, n);
  return n;
}

// Dynamic political alignments - these evolve based on AI responses
export function getAgentAlignment(agentName) {
  const key = `alignment_${agentName}`;
  return localStorage.getItem(key) || 'Independent';
}

export function setAgentAlignment(agentName, alignment) {
  const key = `alignment_${agentName}`;
  localStorage.setItem(key, alignment);
}

// Get political profile for an agent
export function getAgentPoliticalProfile(agentName) {
  const key = `political_profile_${agentName}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing political profile:', error);
    }
  }
  
  // Default profile
  return {
    responses: [],
    currentAlignment: 'Independent',
    liberalCount: 0,
    conservativeCount: 0,
    libertarianCount: 0,
    moderateCount: 0
  };
}

// Save political profile for an agent
export function setAgentPoliticalProfile(agentName, profile) {
  const key = `political_profile_${agentName}`;
  localStorage.setItem(key, JSON.stringify(profile));
}

// Legacy ALIGNMENTS for backward compatibility - now dynamic
export const ALIGNMENTS = {
  get grok() { return getAgentAlignment('grok'); },
  get openai() { return getAgentAlignment('openai'); },
  get claude() { return getAgentAlignment('claude'); },
  get deepseek() { return getAgentAlignment('deepseek'); }
};

export function getBiasDescription(level) {
  if (level === 0) return "Neutral";
  if (level <= 3) return "Slight";
  if (level <= 7) return "Moderate";
  if (level <= 15) return "Strong";
  return "Extreme";
}

export function resetAllBias() {
  const agents = ['grok', 'openai', 'claude', 'deepseek'];
  agents.forEach(agent => {
    localStorage.removeItem(`bias_${agent}`);
    localStorage.removeItem(`alignment_${agent}`);
    localStorage.removeItem(`political_profile_${agent}`);
  });
  console.log('🔄 All bias levels and political alignments reset to neutral');
}

// Initialize all agents as Independent/Neutral
export function initializeNeutralAgents() {
  const agents = ['grok', 'openai', 'claude', 'deepseek'];
  agents.forEach(agent => {
    if (!getAgentAlignment(agent) || getAgentAlignment(agent) === 'undefined') {
      setAgentAlignment(agent, 'Independent');
    }
  });
}

// Call this to ensure all agents start neutral
initializeNeutralAgents();

// Get current dynamic alignments for all agents
export function getDynamicAlignments() {
  const alignments = {};
  const agents = ['grok', 'openai', 'claude', 'deepseek'];
  
  agents.forEach(agentName => {
    alignments[agentName] = getAgentAlignment(agentName);
  });
  
  return alignments;
} 