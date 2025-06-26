import React from 'react';

interface Message {
  aiAgent: string;
  content: string;
  timestamp: Date;
  sentiment?: string;
  politicalLean?: string;
  confidence?: number;
  responseTime?: number;
}

interface MessageLogProps {
  messages: Message[];
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const getAgentColor = (agentName: string) => {
    const colors: { [key: string]: string } = {
      'openai': 'rgba(34, 197, 94, 0.3)',
      'claude': 'rgba(59, 130, 246, 0.3)',
      'grok': 'rgba(239, 68, 68, 0.3)',
      'deepseek': 'rgba(168, 85, 247, 0.3)'
    };
    return colors[agentName] || 'rgba(107, 114, 128, 0.3)';
  };

  const getAgentDisplayName = (agentName: string) => {
    const names: { [key: string]: string } = {
      'openai': 'GPT',
      'claude': 'Claude',
      'grok': 'Grok',
      'deepseek': 'DeepSeek'
    };
    return names[agentName] || agentName;
  };

  const getAgentAvatar = (agentName: string) => {
    const avatars: { [key: string]: string } = {
      'openai': '🤖',
      'claude': '⚖️',
      'grok': '🔥',
      'deepseek': '🎯'
    };
    return avatars[agentName] || '🤔';
  };

  const getSentimentColor = (sentiment?: string) => {
    const colors: { [key: string]: string } = {
      'positive': '#22c55e',
      'negative': '#ef4444',
      'neutral': '#6b7280'
    };
    return colors[sentiment || 'neutral'] || '#6b7280';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        💬 Conversation Log
        <span style={{
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          fontSize: '0.875rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px'
        }}>
          {messages.length} messages
        </span>
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxHeight: '500px',
        overflowY: 'auto',
        paddingRight: '0.5rem'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderLeft: `4px solid ${getAgentColor(message.aiAgent)}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                fontSize: '2rem',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                background: getAgentColor(message.aiAgent),
                borderRadius: '50%'
              }}>
                {getAgentAvatar(message.aiAgent)}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: 'white',
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    {getAgentDisplayName(message.aiAgent)}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {message.responseTime && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {message.responseTime}ms
                      </span>
                    )}
                    
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {message.content}
                </p>
                
                {/* Metadata */}
                {(message.sentiment || message.politicalLean || message.confidence) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    {message.sentiment && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getSentimentColor(message.sentiment)
                        }}></div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {message.sentiment}
                        </span>
                      </div>
                    )}
                    
                    {message.politicalLean && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {message.politicalLean}
                      </span>
                    )}
                    
                    {message.confidence && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {Math.round(message.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            padding: '2rem',
            fontStyle: 'italic'
          }}>
            No messages yet. Start a debate to see the conversation unfold!
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageLog; 