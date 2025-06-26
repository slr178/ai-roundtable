import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AIAgent {
  name: string;
  displayName: string;
  performance: {
    totalDebates: number;
    averageEngagement: number;
    topTopics: string[];
  };
  politicalProfile: {
    currentLean: string;
    confidence: number;
  };
}

interface Thread {
  _id: string;
  title: string;
  topic: string;
  status: string;
  round: number;
  createdAt: string;
  messages: any[];
}

interface APIStatus {
  name: string;
  displayName: string;
  status: 'checking' | 'working' | 'failed';
  responseTime?: number;
  error?: string;
  lastChecked?: Date;
}

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'openai', displayName: 'GPT 🤖', status: 'checking' },
    { name: 'claude', displayName: 'Claude ⚖️', status: 'checking' },
    { name: 'grok', displayName: 'Grok 🔥', status: 'checking' },
    { name: 'deepseek', displayName: 'DeepSeek 🎯', status: 'checking' }
  ]);
  const [loading, setLoading] = useState(true);

  const checkAPIStatus = async () => {
    const testPrompt = "Test connection - respond with just 'OK'";
    
    for (const api of apiStatuses) {
      try {
        const startTime = Date.now();
        
        const response = await axios.post('http://localhost:5000/api/ai/test', {
          agent: api.name,
          prompt: testPrompt
        }, { timeout: 10000 });
        
        const responseTime = Date.now() - startTime;
        
        setApiStatuses(prev => prev.map(status => 
          status.name === api.name 
            ? { 
                ...status, 
                status: 'working' as const, 
                responseTime,
                lastChecked: new Date(),
                error: undefined
              }
            : status
        ));
      } catch (error: any) {
        setApiStatuses(prev => prev.map(status => 
          status.name === api.name 
            ? { 
                ...status, 
                status: 'failed' as const, 
                error: error.response?.data?.error || error.message || 'Connection failed',
                lastChecked: new Date(),
                responseTime: undefined
              }
            : status
        ));
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, threadsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/ai/agents'),
          axios.get('http://localhost:5000/api/threads')
        ]);
        setAgents(agentsRes.data);
        setThreads(threadsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    checkAPIStatus();
  }, []);

  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
    color: 'white'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ fontSize: '1.25rem' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          📊 Dashboard
        </h1>

        {/* API Status Console */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              🔧 API Status Console
            </h2>
            <button 
              onClick={checkAPIStatus}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Refresh Status
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem' 
          }}>
            {apiStatuses.map((api) => (
              <div key={api.name} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1rem',
                border: `1px solid ${api.status === 'working' ? 'rgba(34, 197, 94, 0.3)' : 
                                     api.status === 'failed' ? 'rgba(239, 68, 68, 0.3)' : 
                                     'rgba(107, 114, 128, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>
                    {api.status === 'working' ? '✅' : 
                     api.status === 'failed' ? '❌' : 
                     '⏳'}
                  </span>
                  <h3 style={{ fontWeight: '600', margin: 0 }}>{api.displayName}</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Status:</span>
                    <span style={{ 
                      fontWeight: '500',
                      color: api.status === 'working' ? '#22c55e' : 
                             api.status === 'failed' ? '#ef4444' : '#f59e0b'
                    }}>
                      {api.status === 'working' ? 'Working' : 
                       api.status === 'failed' ? 'Failed' : 
                       'Checking...'}
                    </span>
                  </div>
                  
                  {api.responseTime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7 }}>Response Time:</span>
                      <span style={{ fontWeight: '500' }}>{api.responseTime}ms</span>
                    </div>
                  )}
                  
                  {api.lastChecked && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7 }}>Last Checked:</span>
                      <span style={{ fontWeight: '500' }}>
                        {api.lastChecked.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {api.error && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>Error:</span>
                      <div style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        wordBreak: 'break-word'
                      }}>
                        {api.error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Agents Stats */}
        <div style={gridStyle}>
          {agents.map((agent) => (
            <div key={agent.name} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>
                  {agent.name === 'openai' ? '🤖' : 
                   agent.name === 'claude' ? '⚖️' : 
                   agent.name === 'grok' ? '🔥' : '🎯'}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {agent.displayName}
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ opacity: 0.7 }}>Debates:</span>
                  <span style={{ fontWeight: '500' }}>{agent.performance?.totalDebates || 0}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ opacity: 0.7 }}>Engagement:</span>
                  <span style={{ fontWeight: '500' }}>
                    {((agent.performance?.averageEngagement || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>Political Lean:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: agent.politicalProfile?.currentLean === 'left' ? '#3b82f6' :
                                     agent.politicalProfile?.currentLean === 'right' ? '#ef4444' : '#6b7280'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {agent.politicalProfile?.currentLean || 'center'}
                    </span>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                      ({((agent.politicalProfile?.confidence || 0.5) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Threads */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Recent Debates
          </h2>
          
          {threads.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.7, padding: '2rem' }}>
              No debates yet. Start your first debate from the Roundtable!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {threads.slice(0, 10).map((thread) => (
                <div key={thread._id} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem' 
                  }}>
                    <h3 style={{ fontWeight: '600', margin: 0 }}>{thread.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: thread.status === 'active' ? 'rgba(34, 197, 94, 0.2)' :
                                       thread.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' :
                                       'rgba(107, 114, 128, 0.2)',
                        color: thread.status === 'active' ? '#22c55e' :
                               thread.status === 'completed' ? '#3b82f6' : '#6b7280'
                      }}>
                        {thread.status}
                      </span>
                      <span style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                        Round {thread.round}
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.5rem', margin: 0 }}>
                    {thread.topic}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    opacity: 0.6
                  }}>
                    <span>{thread.messages?.length || 0} messages</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 