import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { WebhookData } from '../hooks/useSocket';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface WebhookFeedProps {
  socket: Socket | null;
  isConnected: boolean;
  webhookData: WebhookData[];
  error: string | null;
}

const WebhookFeed: React.FC<WebhookFeedProps> = ({ 
  socket, 
  isConnected, 
  webhookData, 
  error 
}) => {
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendTestWebhook = async () => {
    if (!testMessage.trim()) return;
    
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/webhooks/test`, {
        message: testMessage
      });
      setTestMessage('');
    } catch (error) {
      console.error('Error sending test webhook:', error);
      alert('Failed to send test webhook');
    } finally {
      setSending(false);
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTestWebhook();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'twitter': return '#1DA1F2';
      case 'test': return '#22c55e';
      case 'secure': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'twitter': return '🐦';
      case 'test': return '🧪';
      case 'secure': return '🔒';
      default: return '📧';
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
    color: 'white'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)'
  };

  const statusIndicatorStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: isConnected ? '#22c55e' : '#ef4444'
  };

  const testFormStyle = {
    marginBottom: '2rem',
    padding: '1.5rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)'
  };

  const formRowStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end'
  };

  const inputStyle = {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '1rem'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const feedStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  };

  const webhookItemStyle = (type: string) => ({
    padding: '1.5rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderLeft: `4px solid ${getTypeColor(type)}`,
    transition: 'transform 0.2s',
    animation: 'slideIn 0.3s ease-out'
  });

  const webhookHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  };

  const webhookTypeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600'
  };

  const webhookTimestampStyle = {
    fontSize: '0.75rem',
    opacity: 0.6
  };

  const webhookContentStyle = {
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '0.75rem'
  };

  const webhookAuthorStyle = {
    fontSize: '0.875rem',
    opacity: 0.8,
    fontStyle: 'italic'
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          📡 Real-time Webhook Feed
        </h1>

        {/* Connection Status */}
        <div style={statusStyle}>
          <div style={statusIndicatorStyle}></div>
          <span>
            {isConnected ? '✅ Connected to real-time server' : '❌ Disconnected from server'}
          </span>
          {error && (
            <span style={{ color: '#ef4444', marginLeft: '1rem' }}>
              - {error}
            </span>
          )}
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
            Server: {API_URL} | Data received: {webhookData.length}
          </div>
        </div>

        {/* Test Webhook Form */}
        <div style={testFormStyle}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>🧪 Test Webhook</h3>
          <p style={{ opacity: 0.7, marginBottom: '1rem', fontSize: '0.875rem' }}>
            Send a test message to see real-time updates in action
          </p>
          <form onSubmit={handleTestSubmit}>
            <div style={formRowStyle}>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
                style={inputStyle}
                disabled={sending}
              />
              <button 
                type="submit" 
                disabled={sending || !testMessage.trim()}
                style={{
                  ...buttonStyle,
                  opacity: (sending || !testMessage.trim()) ? 0.5 : 1,
                  cursor: (sending || !testMessage.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {sending ? 'Sending...' : 'Send Test'}
              </button>
              <button 
                type="button"
                onClick={() => window.open(`${API_URL}/api/webhooks/recent`, '_blank')}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#6b7280'
                }}
              >
                🔍 Debug
              </button>
            </div>
          </form>
        </div>

        {/* Webhook Feed */}
        <div style={feedStyle}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            📧 Live Webhook Data ({webhookData.length})
          </h3>
          
          {webhookData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              opacity: 0.7,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                No webhook data received yet
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                Send a test webhook or configure your external service to start receiving data
              </div>
            </div>
          ) : (
            webhookData.map((item: WebhookData) => (
              <div key={item.id} style={webhookItemStyle(item.type)}>
                <div style={webhookHeaderStyle}>
                  <div style={webhookTypeStyle}>
                    <span>{getTypeIcon(item.type)}</span>
                    <span style={{ color: getTypeColor(item.type) }}>
                      {item.type.toUpperCase()}
                    </span>
                    {item.type === 'twitter' && (
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                        {(item as any).is_retweet && <span>🔄 Retweet</span>}
                        {(item as any).is_reply && <span>💬 Reply</span>}
                      </div>
                    )}
                  </div>
                  <div style={webhookTimestampStyle}>
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>
                
                <div style={webhookContentStyle}>
                  {item.content}
                </div>
                
                {/* Link Information */}
                {item.linkData?.hasLinks && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span>🔗</span>
                      <span style={{ fontWeight: 'bold', color: '#00ffff' }}>
                        {item.linkData.linkCount} Link{item.linkData.linkCount > 1 ? 's' : ''} Processed
                      </span>
                    </div>
                    {item.linkData.urls && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        {item.linkData.urls.map((url, index) => (
                          <div key={index} style={{ marginBottom: '0.25rem' }}>
                            📄 <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#87ceeb', textDecoration: 'underline' }}>
                              {url.length > 50 ? url.substring(0, 50) + '...' : url}
                            </a>
                            {/* Show if URL was expanded from a shortener */}
                            {item.linkData?.scrapedResults?.[index]?.expandedUrl && (
                              <div style={{ marginLeft: '1rem', fontSize: '0.7rem', color: '#90ee90', fontStyle: 'italic' }}>
                                ↳ Expanded to: {item.linkData.scrapedResults[index].expandedUrl!.length > 60 
                                  ? item.linkData.scrapedResults[index].expandedUrl!.substring(0, 60) + '...' 
                                  : item.linkData.scrapedResults[index].expandedUrl}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.linkData.summaries && item.linkData.summaries.length > 0 && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        fontStyle: 'italic',
                        color: '#e6e6fa'
                      }}>
                        ✨ Content summarized for AI analysis
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}>
                  <div style={webhookAuthorStyle}>
                    — @{item.author}
                  </div>
                  {item.type === 'twitter' && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      fontSize: '0.75rem', 
                      opacity: 0.7 
                    }}>
                      {(item as any).retweet_count > 0 && (
                        <span>🔄 {(item as any).retweet_count}</span>
                      )}
                      {(item as any).favorite_count > 0 && (
                        <span>❤️ {(item as any).favorite_count}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Webhook URLs Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>📋 Available Webhook Endpoints</h4>
          <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: '1.8' }}>
            <div><strong>Twitter/Social:</strong> POST {API_URL}/api/webhooks/twitter</div>
            <div><strong>Generic:</strong> POST {API_URL}/api/webhooks/generic</div>
            <div><strong>Secure (HMAC):</strong> POST {API_URL}/api/webhooks/secure</div>
            <div><strong>Test:</strong> POST {API_URL}/api/webhooks/test</div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default WebhookFeed; 