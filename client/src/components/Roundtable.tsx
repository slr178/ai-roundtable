import React from 'react';
import TweetDisplay from './TweetDisplay';
import { WebhookData } from '../hooks/useSocket';

// GSAP type declarations
declare global {
  interface Window {
    TweenLite: any;
    TimelineLite: any;
    SplitText: any;
    Power3: any;
  }
}

interface Message {
  aiAgent: string;
  content: string;
  timestamp: string;
  responseTime?: number;
  // Enhanced political tracking
  biasLevel?: number;
  worldviewChange?: {
    topic: string;
    oldPosition: number;
    newPosition: number;
    shift: number;
    evidence: any;
  };
  sentiment?: string;
  politicalLean?: string;
  confidence?: number;
}

interface Agent {
  name: string;
  id: string;
  emoji: string;
  color: string;
  gif: string;
}

interface AgentResponse {
  success: boolean;
  agent: string;
  agentName: string;
  content: string;
  responseTime: number;
}

interface RoundtableProps {
  webhookData: WebhookData[];
  messages: Message[];
  isDebating: boolean;
  currentTopic: string;
  currentContent: string;
  currentSpeaker: string | null;
  isThinking: string | null;
  error: string | null;
  currentMessage: string;
  displayedMessage: string;
  isTyping: boolean;
  isLogVisible: boolean;
  setIsLogVisible: (visible: boolean) => void;
  agents: Agent[];
  getCurrentAgent: () => Agent | undefined;
  pendingDebatesCount?: number;
  tweetData?: any; // Tweet data from the debate state
  isFetchingDebate?: boolean;
}

export default function Roundtable({ 
  webhookData, 
  messages, 
  isDebating, 
  currentTopic, 
  currentContent, 
  currentSpeaker, 
  isThinking, 
  error, 
  currentMessage, 
  displayedMessage, 
  isTyping, 
  isLogVisible, 
  setIsLogVisible, 
  agents, 
  getCurrentAgent,
  pendingDebatesCount = 0,
  tweetData,
  isFetchingDebate = false
}: RoundtableProps) {

  const getBiasColor = (biasLevel?: number) => {
    if (!biasLevel) return '#666';
    if (biasLevel <= 3) return '#88cc88'; // Light green for low bias
    if (biasLevel <= 7) return '#ffaa00'; // Orange for moderate bias
    if (biasLevel <= 15) return '#ff6666'; // Red for high bias
    return '#cc0000'; // Dark red for extreme bias
  };

  const getBiasLabel = (biasLevel?: number) => {
    if (!biasLevel) return 'Neutral';
    if (biasLevel <= 3) return 'Slight';
    if (biasLevel <= 7) return 'Moderate';
    if (biasLevel <= 15) return 'Strong';
    return 'Extreme';
  };

  const getShiftIcon = (shift?: number) => {
    if (!shift || Math.abs(shift) < 0.1) return '→';
    return shift > 0 ? '↗️' : '↙️';
  };

  const getShiftColor = (shift?: number) => {
    if (!shift) return '#666';
    return shift > 0 ? '#ff4444' : '#4444ff'; // Red for conservative, blue for liberal
  };

  const getAlignmentColor = (agentName: string) => {
    const alignments: { [key: string]: string } = {
      'openai': '#4444ff', // Democratic - Blue  
      'gpt': '#4444ff', // Democratic - Blue
      'claude': '#ffaa00', // Libertarian - Orange
      'grok': '#ff4444', // Republican - Red
      'deepseek': '#cc0000' // Communist - Dark Red
    };
    return alignments[agentName] || '#666';
  };

  return (
    <div className="page-container">
      {/* Override the dark overlay completely to show the gif clearly */}
      <style>
        {`.page-container::before { display: none !important; }`}
      </style>

      <div className="layout-container">
        <div className="main-content" style={{ 
          background: 'none', 
          backdropFilter: 'none', 
          width: '100%',
          marginRight: isLogVisible ? '450px' : '60px', // Wider for enhanced log
          transition: 'margin-right 0.3s ease'
        }}>
        {/* Error Display */}
        {error && (
          <div className="error-card fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Waiting State - Only show when NOT debating and no current topic */}
        {!isDebating && !currentTopic && (
          <div className="fade-in waiting-state">
            <div className="waiting-message scale-in" style={{
              opacity: 0.7,
              fontSize: '1.1rem',
              fontWeight: '500',
              textAlign: 'center',
              padding: '2rem'
            }}>
              {isFetchingDebate ? (
                <>
                  <div style={{ 
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'rgba(255, 255, 255, 0.8)',
                    animation: 'spin 1s ease-in-out infinite',
                    marginRight: '10px'
                  }} />
                  🔄 Loading debates...
                  <div style={{ 
                    fontSize: '0.85rem', 
                    opacity: 0.8, 
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    ⚠️ This may take a few moments if loading mid-debate
                  </div>
                </>
              ) : pendingDebatesCount > 0 ? (
                <>
                  ⏳ Processing {pendingDebatesCount} pending debate{pendingDebatesCount > 1 ? 's' : ''}...
                  <div style={{ 
                    fontSize: '0.85rem', 
                    opacity: 0.8, 
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    Tweets received while on other tabs
                  </div>
                </>
              ) : (
                <>
                  ⏰ Waiting for next debate
                  <div style={{ 
                    fontSize: '0.85rem', 
                    opacity: 0.8, 
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    Ready for breaking news to come in
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Current Tweet Under Analysis */}
        {currentTopic && (
          <div className="current-topic fade-in breaking-news-alert">
            <h2 className="slide-in">🚨 BREAKING: Current Tweet Under Analysis</h2>
            <p className="fade-in" style={{ animationDelay: '0.2s' }}>{currentTopic}</p>
            
            {/* Display the actual tweet if available */}
            {tweetData && (
              <div className="fade-in" style={{ animationDelay: '0.4s' }}>
                <TweetDisplay tweetData={tweetData} />
              </div>
            )}
            
            {/* Show enhanced content if no tweet data but have content */}
            {!tweetData && currentContent && (
              <div className="tweet-content fade-in" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.85rem',
                fontStyle: 'italic',
                marginBottom: '1rem',
                lineHeight: '1.4',
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                fontWeight: '500',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                animationDelay: '0.4s'
              }}>
                {currentContent}
              </div>
            )}
            
            <div className="topic-stats scale-in" style={{ animationDelay: '0.6s' }}>
              {isDebating && <span className="debate-status">Analyzing</span>}
            </div>
          </div>
        )}
        </div>

        {/* Log Toggle Button */}
        {(isDebating || messages.length > 0) && (
          <div className="log-toggle-container fade-in">
            <button 
              className={`log-toggle-btn scale-in ${isLogVisible ? 'active' : ''}`}
              onClick={() => setIsLogVisible(!isLogVisible)}
            >
              bias log
            </button>
          </div>
        )}

        {/* Enhanced Message Log on the Right */}
        {(isDebating || messages.length > 0) && isLogVisible && (
          <div className="message-log-container message-log-animate" style={{ width: '420px' }}>
            <div className="message-log">
              <div className="log-header">
                <h3>🧠 Political Evolution Log</h3>
                <button 
                  className="log-close-btn"
                  onClick={() => setIsLogVisible(false)}
                >
                  ×
                </button>
              </div>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <span className="pixel-text">Awaiting council responses...</span>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className="message-item message-item-animate" style={{
                      animationDelay: `${index * 0.2}s`,
                      borderLeft: `4px solid ${getAlignmentColor(message.aiAgent)}`
                    }}>
                      <div className="message-header">
                        <span className={`message-agent agent-${message.aiAgent}`}>
                          {agents.find(a => a.id === message.aiAgent)?.name || message.aiAgent}
                        </span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {/* Enhanced Political Tracking Display */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        {message.biasLevel !== undefined && (
                          <span style={{
                            background: getBiasColor(message.biasLevel),
                            color: 'white',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}>
                            Bias: {message.biasLevel} ({getBiasLabel(message.biasLevel)})
                          </span>
                        )}
                        
                        {message.politicalLean && (
                          <span style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {message.politicalLean}
                          </span>
                        )}
                        
                        {message.sentiment && (
                          <span style={{
                            background: message.sentiment === 'positive' ? '#22c55e' : 
                                       message.sentiment === 'negative' ? '#ef4444' : '#6b7280',
                            color: 'white',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {message.sentiment}
                          </span>
                        )}
                      </div>

                      <div className="message-text pixel-text" style={{ marginBottom: '0.5rem' }}>
                        {message.content}
                      </div>

                      {/* Worldview Change Display */}
                      {message.worldviewChange && (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          marginTop: '0.5rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#daa520',
                            fontWeight: 'bold',
                            marginBottom: '0.25rem'
                          }}>
                            🎯 Position Change: {message.worldviewChange.topic}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.7rem',
                            color: 'rgba(255, 255, 255, 0.8)'
                          }}>
                            <span>{message.worldviewChange.oldPosition.toFixed(1)}</span>
                            <span style={{ color: getShiftColor(message.worldviewChange.shift) }}>
                              {getShiftIcon(message.worldviewChange.shift)}
                            </span>
                            <span>{message.worldviewChange.newPosition.toFixed(1)}</span>
                            <span style={{ 
                              color: getShiftColor(message.worldviewChange.shift),
                              fontWeight: 'bold'
                            }}>
                              ({message.worldviewChange.shift > 0 ? '+' : ''}{message.worldviewChange.shift.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Response Time */}
                      {message.responseTime && (
                        <div style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                          marginTop: '0.25rem'
                        }}>
                          Response time: {message.responseTime}ms
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left Speaking Character */}
      {(currentSpeaker || isThinking) && getCurrentAgent() && (
        <div className={`bottom-speaking-character ${(currentSpeaker || isThinking) ? 'visible' : ''}`}>
          {/* Character Sprite */}
          <img
            src={getCurrentAgent()?.gif}
            alt={`${getCurrentAgent()?.name} avatar`}
            className="character-sprite"
          />

          {/* Retro Speech Bubble */}
          {currentSpeaker && (
            <div className="retro-speech-bubble scale-in">
              <div className="retro-speech-text" id="retro-quote">
                <div className="retro-agent-name fade-in">
                  {getCurrentAgent()?.name}
                </div>
                <div className="speech-message">
                  {displayedMessage}
                  {isTyping && <span className="cursor-blink">█</span>}
                </div>
              </div>
            </div>
          )}

          {/* Retro Thinking Bubble */}
          {isThinking && (
            <div className="retro-thinking-bubble scale-in">
              <div className="retro-thinking-text">
                <div className="retro-agent-name fade-in">
                  {getCurrentAgent()?.name}
                </div>
                <span className="fade-in" style={{ animationDelay: '0.3s' }}>
                  Contemplating the matter... gathering wisdom...
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 