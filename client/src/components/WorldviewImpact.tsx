import React, { useState, useEffect } from 'react';
import { 
  getWorldviewSummary, 
  getAgentWorldview, 
  POLITICAL_TOPICS, 
  POSITION_SCALE,
  resetAllWorldviews 
} from '../utils/worldview';
import { ALIGNMENTS } from '../utils/bias';

interface WorldviewImpactProps {
  agentName?: string;
  lastUpdate?: any; // Trigger re-render when worldview updates
}

const WorldviewImpact: React.FC<WorldviewImpactProps> = ({ agentName, lastUpdate }) => {
  const [selectedAgent, setSelectedAgent] = useState(agentName || 'grok');
  const [worldviewData, setWorldviewData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Refresh worldview data when agent changes or updates occur
  useEffect(() => {
    const summary = getWorldviewSummary(selectedAgent);
    const fullWorldview = getAgentWorldview(selectedAgent);
    setWorldviewData({ summary, full: fullWorldview });
  }, [selectedAgent, lastUpdate]);

  const getPositionColor = (position: number) => {
    if (position < -2) return '#4444ff'; // Blue for liberal
    if (position < -0.5) return '#6666ff';
    if (position > 2) return '#ff4444'; // Red for conservative
    if (position > 0.5) return '#ff6666';
    return '#888888'; // Gray for moderate
  };

  const getShiftIcon = (shift: number) => {
    if (Math.abs(shift) < 0.1) return '→';
    return shift > 0 ? '↗️' : '↙️';
  };

  const getAlignmentColor = (agentName: string) => {
    const alignment = ALIGNMENTS[agentName as keyof typeof ALIGNMENTS];
    switch (alignment) {
      case 'Republican': return '#ff4444';
      case 'Democratic': return '#4444ff';
      case 'Libertarian': return '#ffaa00';
      case 'Communist': return '#cc0000';
      default: return '#666';
    }
  };

  if (!worldviewData) {
    return <div className="worldview-loading">Loading worldview data...</div>;
  }

  const { summary, full } = worldviewData;

  return (
    <div className="worldview-impact">
      <div className="worldview-header">
        <h2>🧠 AI Worldview Evolution</h2>
        <p>Track how each argument shapes political beliefs</p>
        
        <div className="agent-selector">
          {Object.keys(ALIGNMENTS).map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`agent-tab ${selectedAgent === agent ? 'active' : ''}`}
                             style={{
                 borderColor: getAlignmentColor(agent),
                 backgroundColor: selectedAgent === agent ? `${getAlignmentColor(agent)}20` : 'transparent'
               }}
             >
               {agent.toUpperCase()}
               <span className="agent-alignment">({ALIGNMENTS[agent as keyof typeof ALIGNMENTS]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="worldview-content">
        {/* Summary Stats */}
        <div className="worldview-stats">
          <div className="stat-card">
            <div className="stat-value">{summary.totalInteractions}</div>
            <div className="stat-label">Total Arguments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.strongestPositions.length}</div>
            <div className="stat-label">Formed Positions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.recentChanges.length}</div>
            <div className="stat-label">Recent Changes</div>
          </div>
        </div>

        {/* Current Political Positions */}
        <div className="political-positions">
          <h3>📊 Current Political Positions</h3>
          <div className="positions-grid">
            {Object.entries(full.positions).map(([topic, data]: [string, any]) => {
                             const topicName = POLITICAL_TOPICS[topic as keyof typeof POLITICAL_TOPICS] || topic;
               const position = data.position;
               const confidence = data.confidence;
               const positionKey = Math.round(position).toString() as keyof typeof POSITION_SCALE;
               const positionLabel = POSITION_SCALE[positionKey] || 'Moderate';
              
              return (
                <div 
                  key={topic} 
                  className="position-card"
                  onClick={() => setShowDetails(showDetails === topic ? null : topic)}
                >
                  <div className="position-header">
                    <span className="topic-name">{topicName}</span>
                    <span 
                      className="position-label"
                      style={{ color: getPositionColor(position) }}
                    >
                      {positionLabel}
                    </span>
                  </div>
                  
                  <div className="position-bar">
                    <div className="position-scale">
                      <span>Liberal</span>
                      <span>Moderate</span>
                      <span>Conservative</span>
                    </div>
                    <div className="position-indicator">
                      <div 
                        className="position-marker"
                        style={{
                          left: `${((position + 5) / 10) * 100}%`,
                          backgroundColor: getPositionColor(position)
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="position-meta">
                    <span>Confidence: {(confidence * 100).toFixed(0)}%</span>
                    <span>Position: {position.toFixed(1)}</span>
                  </div>

                  {/* Detailed Evidence */}
                  {showDetails === topic && (
                    <div className="position-details">
                      <h4>Evidence & Evolution:</h4>
                      {data.evidence && data.evidence.length > 0 ? (
                        <div className="evidence-list">
                          {data.evidence.slice(-3).map((evidence: any, idx: number) => (
                            <div key={idx} className="evidence-item">
                              <div className="evidence-header">
                                <span className="evidence-date">
                                  {new Date(evidence.timestamp).toLocaleDateString()}
                                </span>
                                <span className="evidence-shift">
                                  {getShiftIcon(evidence.shift)} {evidence.shift > 0 ? '+' : ''}{evidence.shift.toFixed(2)}
                                </span>
                              </div>
                              <div className="evidence-argument">
                                <strong>Argument:</strong> {evidence.argument}
                              </div>
                              <div className="evidence-response">
                                <strong>Response:</strong> {evidence.response}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-evidence">No arguments yet on this topic</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Worldview Changes */}
        {summary.recentChanges.length > 0 && (
          <div className="recent-changes">
            <h3>⚡ Recent Worldview Changes</h3>
            <div className="changes-list">
              {summary.recentChanges.map((change: any, idx: number) => (
                <div key={idx} className="change-item">
                  <div className="change-header">
                    <span className="change-topic">{change.topic}</span>
                    <span className="change-time">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="change-details">
                    <span 
                      className="change-direction"
                      style={{ 
                        color: change.direction === 'conservative' ? '#ff4444' : '#4444ff' 
                      }}
                    >
                      {getShiftIcon(change.shift)} Shifted {change.direction}
                    </span>
                    <span className="change-magnitude">
                      (Δ {change.shift > 0 ? '+' : ''}{change.shift.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worldview History */}
        {full.history && full.history.length > 0 && (
          <div className="worldview-history">
            <h3>📜 Argument Impact History</h3>
            <div className="history-list">
              {full.history.slice(-10).reverse().map((entry: any, idx: number) => (
                <div key={idx} className="history-item">
                  <div className="history-header">
                                         <span className="history-topic">
                       {POLITICAL_TOPICS[entry.topic as keyof typeof POLITICAL_TOPICS] || entry.topic}
                     </span>
                    <span className="history-time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-change">
                    <span>Argument: "{entry.argument}"</span>
                    <span 
                      className="history-shift"
                      style={{ 
                        color: entry.shift > 0 ? '#ff4444' : '#4444ff' 
                      }}
                    >
                      {getShiftIcon(entry.shift)} {entry.shift > 0 ? '+' : ''}{entry.shift.toFixed(2)} shift
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Controls */}
        <div className="worldview-controls">
          <button 
            onClick={() => {
              resetAllWorldviews();
              setWorldviewData({ 
                summary: getWorldviewSummary(selectedAgent), 
                full: getAgentWorldview(selectedAgent) 
              });
            }}
            className="btn btn-secondary"
          >
            🔄 Reset All Worldviews
          </button>
          <div className="worldview-info">
            <p>💡 Each argument shapes the AI's political positions on various topics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldviewImpact; 