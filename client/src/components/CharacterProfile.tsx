import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBiasDescription, getAgentAlignment } from '../utils/bias';
import { POLITICAL_TOPICS, POSITION_SCALE } from '../utils/worldview';
import useSocket from '../hooks/useSocket';

const CharacterProfile: React.FC = () => {
  const { name: characterName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { agentStates, isConnected, fetchCurrentState, error: socketError } = useSocket();
  
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Validate character name
  const validCharacters = ['grok', 'openai', 'claude', 'deepseek'];
  const isValidCharacter = characterName && validCharacters.includes(characterName);

  useEffect(() => {
    if (!isValidCharacter) {
      navigate('/bias');
      return;
    }

    if (isConnected) {
      fetchCurrentState();
    }
  }, [characterName, isValidCharacter, navigate, isConnected]);

  const getCharacterDisplayName = (name: string) => {
    switch (name) {
          case 'openai': return 'GPT';
    case 'claude': return 'Claude';
    case 'grok': return 'Grok';
    case 'deepseek': return 'DeepSeek';
      default: return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  const getCharacterAvatar = (name: string) => {
    switch (name) {
          case 'openai': return '/gpt_idle.png';
    case 'claude': return '/claude_idle_2.png';
    case 'grok': return '/grok_idle.png';
    case 'deepseek': return '/deepseek_idle.gif';
    default: return '/gpt_idle.png';
    }
  };

  // Get actual political alignment instead of dynamic "Independent"
  const getActualPoliticalAlignment = (agentName: string) => {
    const alignments: { [key: string]: string } = {
      'grok': 'Conservative',
      'openai': 'Progressive', 
      'claude': 'Libertarian',
      'deepseek': 'Communist'
    };
    return alignments[agentName] || 'Independent';
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'Progressive': return '#2563eb';
      case 'Conservative': return '#dc2626';
      case 'Libertarian': return '#ea580c';
      case 'Communist': return '#7c2d12';
      case 'Independent':
      default: return '#6b7280';
    }
  };

  const getPositionColor = (position: number) => {
    const intensity = Math.abs(position) / 5;
    if (position < 0) {
      return `rgba(37, 99, 235, ${0.4 + intensity * 0.6})`; // Blue for liberal
    } else if (position > 0) {
      return `rgba(220, 38, 38, ${0.4 + intensity * 0.6})`; // Red for conservative
    }
    return '#6b7280'; // Gray for neutral
  };

  const PoliticalScaleChart: React.FC<{ position: number; confidence: number; topic: string }> = ({ position, confidence, topic }) => {
    const percentage = ((position + 5) / 10) * 100;
    const confidenceOpacity = Math.max(0.3, confidence);
    
    return (
      <div className="political-scale-chart">
        <div className="scale-header">
          <span className="scale-position">{position.toFixed(1)}</span>
          <span className="scale-confidence">{(confidence * 100).toFixed(0)}% confidence</span>
        </div>
        
        <div className="scale-visualization">
          <div className="scale-track-detailed">
            <div className="scale-gradient"></div>
            <div className="scale-markers-detailed">
              {[-5, -2.5, 0, 2.5, 5].map((value, index) => (
                <div 
                  key={value} 
                  className={`scale-tick ${value === 0 ? 'center-tick' : ''}`}
                  style={{ left: `${((value + 5) / 10) * 100}%` }}
                >
                  <div className="tick-mark"></div>
                  <div className="tick-label">{value}</div>
                </div>
              ))}
            </div>
            <div 
              className="position-indicator-detailed"
              style={{ 
                left: `${percentage}%`,
                backgroundColor: getPositionColor(position),
                opacity: confidenceOpacity
              }}
            />
          </div>
          
          <div className="scale-labels-detailed">
            <span className="label-left">Strongly Liberal</span>
            <span className="label-center">Moderate</span>
            <span className="label-right">Strongly Conservative</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isValidCharacter || !characterName) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="character-profile-modern">
        <div className="loading-state">
          <div className="loading-spinner-modern"></div>
          <h2>Connecting...</h2>
          <p>Establishing connection to analysis server</p>
        </div>
      </div>
    );
  }

  const agentData = agentStates[characterName];
  const actualAlignment = getActualPoliticalAlignment(characterName);
  const biasLevel = agentData?.biasLevel || 0;
  const worldview = agentData?.worldview;

  if (!agentData) {
    return (
      <div className="character-profile-modern">
        <div className="loading-state">
          <div className="loading-spinner-modern"></div>
          <h2>Loading Analysis</h2>
          <p>Retrieving {getCharacterDisplayName(characterName)} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-profile-modern">
      {/* Navigation */}
      <div className="profile-nav-modern">
        <button 
          onClick={() => navigate('/bias')}
          className="nav-back-modern"
        >
          ← Back to Overview
        </button>
        
        <div className="connection-indicator">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          {isConnected ? 'Live Data' : 'Offline'}
        </div>
      </div>

      {/* Character Header */}
      <div className="character-header-modern">
        <div className="character-avatar-modern">
          <img 
            src={getCharacterAvatar(characterName)}
            alt={`${getCharacterDisplayName(characterName)} avatar`}
            className="avatar-image-modern"
          />
        </div>
        
        <div className="character-meta-modern">
          <h1 className="character-title">{getCharacterDisplayName(characterName)}</h1>
          <div 
            className="alignment-indicator"
            style={{ backgroundColor: getAlignmentColor(actualAlignment) }}
          >
            {actualAlignment}
          </div>
          <p className="character-subtitle">Political Profile Analysis</p>
        </div>

        <div className="character-stats-modern">
          <div className="stat-item">
            <div className="stat-value">{worldview?.totalInteractions || 0}</div>
            <div className="stat-label">Total Debates</div>
          </div>
        </div>
      </div>

      {/* Main Analysis Content */}
      <div className="analysis-content">
        {/* Political Position Analysis */}
        <div className="analysis-section">
          <div className="section-header-modern">
            <h2>Political Position Analysis</h2>
            <p className="section-description">Detailed breakdown of ideological positions on key topics</p>
          </div>

          <div className="positions-analysis">
            {!worldview?.strongestPositions || worldview.strongestPositions.length === 0 ? (
              <div className="empty-state">
                <h3>No Position Data Available</h3>
                <p>This agent needs to participate in more debates to develop measurable political positions.</p>
              </div>
            ) : (
              worldview.strongestPositions.map((positionData: any, index: number) => {
                const mockTopics = Object.keys(POLITICAL_TOPICS);
                const topic = mockTopics[index % mockTopics.length];
                const topicName = POLITICAL_TOPICS[topic as keyof typeof POLITICAL_TOPICS] || topic;
                const position = positionData.position || 0;
                const confidence = positionData.confidence || 0.5;
                
                return (
                  <div 
                    key={topic}
                    className={`position-analysis-card ${selectedTopic === topic ? 'expanded' : ''}`}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                  >
                    <div className="position-header">
                      <h3 className="topic-title">{topicName}</h3>
                      <div className="position-summary">
                        <span className={`position-label ${Math.abs(position) > 2 ? 'strong' : 'moderate'}`}>
                          {Math.abs(position) > 2 ? 'Strong' : 'Moderate'} {position < 0 ? 'Liberal' : position > 0 ? 'Conservative' : 'Neutral'}
                        </span>
                      </div>
                    </div>

                    <PoliticalScaleChart 
                      position={position}
                      confidence={confidence}
                      topic={topic}
                    />

                    {selectedTopic === topic && (
                      <div className="position-details">
                        <div className="evidence-section">
                          <h4>Formation Evidence</h4>
                          <p className="evidence-note">
                            This position developed through {Math.floor(confidence * 10)} debate interactions
                            with a confidence level of {(confidence * 100).toFixed(0)}%.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Evolution */}
        {worldview?.recentChanges && worldview.recentChanges.length > 0 && (
          <div className="analysis-section">
            <div className="section-header-modern">
              <h2>Recent Political Evolution</h2>
              <p className="section-description">How recent debates have shaped this agent's worldview</p>
            </div>

            <div className="evolution-timeline">
              {worldview.recentChanges.slice(0, 5).map((change: any, idx: number) => (
                <div key={idx} className="evolution-event">
                  <div className="event-indicator">
                    <div className={`shift-direction ${change.shift > 0 ? 'conservative' : 'liberal'}`}>
                      {change.shift > 0 ? '→' : '←'}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <h4 className="event-topic">{change.topic}</h4>
                      <div className="event-magnitude">
                        <span className={`shift-value ${change.direction}`}>
                          {Math.abs(change.shift).toFixed(2)} point shift {change.direction}
                        </span>
                      </div>
                    </div>
                    
                    <div className="event-details">
                      <div className="debate-context">
                        <strong>Debate Topic:</strong>
                        <p>"{change.argument || 'General discussion'}"</p>
                      </div>
                      
                      {change.evidence?.response && (
                        <div className="agent-response">
                          <strong>Agent Response:</strong>
                          <p>"{change.evidence.response}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="event-timestamp">
                      {new Date(change.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CharacterProfile; 