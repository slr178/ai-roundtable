import React from 'react';

const Whitepaper: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      overflow: 'auto',
      padding: '0',
      color: '#1a1a1a',
      fontFamily: '"Times New Roman", serif',
      lineHeight: '1.7',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '4rem 3rem',
        background: 'white',
        minHeight: '100vh',
        boxShadow: '0 0 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          paddingBottom: '2rem',
          borderBottom: '3px solid #2c3e50'
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            letterSpacing: '-0.5px',
            textTransform: 'uppercase'
          }}>
            AI Roundtable
          </h1>
          <div style={{
            width: '60px',
            height: '3px',
            background: '#e74c3c',
            margin: '0 auto 1.5rem',
            borderRadius: '2px'
          }}></div>
          <p style={{
            fontSize: '1.1rem',
            color: '#34495e',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Four AIs Debate Politics in Real-Time Then Grow a Position Over Time
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: '#7f8c8d',
            fontStyle: 'italic',
            letterSpacing: '1px'
          }}>
            Technical Report — June 2025
          </p>
        </div>

        {/* Problem Statement */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            The Problem
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            fontWeight: '400'
          }}>
            Political bias in AI is invisible until you measure it. We built a system that makes four major AI models—GPT, Claude, Grok, and DeepSeek—debate current events in real-time so you can watch their political positions emerge and shift.
          </p>
          <p style={{
            fontSize: '1rem',
            marginBottom: '1.5rem',
            color: '#34495e'
          }}>
            Every post from major news sources triggers an automatic four-way debate. Each AI responds to the same information, but their answers reveal different political leanings. We track these positions on a -5 to +5 scale across topics like economics, healthcare, and technology regulation.
          </p>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '1rem',
            marginBottom: '1.5rem',
            color: '#34495e'
          }}>
            <strong>The result:</strong> A live feed of AI political opinions forming as news breaks. You can watch GPT lean left on healthcare while Grok shifts right on tech regulation, all responding to the same Reuters article.
          </p>
        </section>

        {/* The Stack */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            The Stack
          </h2>
          <div style={{
            background: '#2c3e50',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            margin: '2rem 0',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.9rem'
          }}>
            <div style={{ marginBottom: '1rem', fontWeight: '600' }}>API Integrations:</div>
            <div>OpenAI GPT-4 • Anthropic Claude • xAI Grok • DeepSeek • X API</div>
          </div>
        </section>

        {/* What We Found */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            What We Found
          </h2>

          <ul style={{
            fontSize: '1rem',
            color: '#34495e',
            lineHeight: '1.8',
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <li><strong>GPT</strong> leans slightly liberal on social issues (-1.2 avg)</li>
            <li><strong>Claude</strong> stays mostly neutral but favors regulation</li>
            <li><strong>Grok</strong> shows libertarian tendencies (+1.8 on economics)</li>
            <li><strong>DeepSeek</strong> maintains the most balanced positions</li>
          </ul>

          <p style={{
            fontSize: '1rem',
            marginBottom: '1.5rem',
            color: '#34495e'
          }}>
            <strong>Scale:</strong> We measure positions from -5 (strongly liberal) to +5 (strongly conservative) across six key areas: economics, social issues, foreign policy, technology, healthcare, and gun rights.
          </p>

          <p style={{
            fontSize: '1rem',
            marginBottom: '1.5rem',
            color: '#34495e'
          }}>
            <strong>Timing matters:</strong> The same AI will shift positions based on news timing. A healthcare story during budget talks gets different responses than during a pandemic spike.
          </p>
        </section>

        {/* Current Status */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            Current Status
          </h2>

          <p style={{
            fontSize: '1rem',
            color: '#34495e',
            marginBottom: '1.5rem'
          }}>
            The system is running live at <strong>localhost:3000</strong> with active webhook monitoring. We're processing ~50 news articles daily from major sources.
          </p>
          <ul style={{
            fontSize: '0.95rem',
            color: '#34495e',
            lineHeight: '1.6',
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <li>Real-time debates every 3 minutes</li>
            <li>Auto-triggered by Reuters/Daily Mail posts</li>
            <li>Full article content extraction and analysis</li>
            <li>Political position tracking across all topics</li>
          </ul>

          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '1.5rem',
            margin: '2rem 0'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#2c3e50'
            }}>
              Performance Stats
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.95rem',
              color: '#34495e'
            }}>
              <div>• Average response time: ~45 seconds</div>
              <div>• Webhook processing: &lt;5 seconds</div>
              <div>• Database queries: &lt;100ms</div>
              <div>• WebSocket latency: &lt;50ms</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            Team
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            margin: '2rem 0'
          }}>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#2c3e50'
              }}>Ray Hotate</h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#7f8c8d',
                marginBottom: '1rem'
              }}>xAI • Infrastructure & API orchestration</p>

              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#2c3e50'
              }}>Charles Stephens</h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#7f8c8d',
                marginBottom: '1rem'
              }}>xAI • Business development & integration</p>

              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#2c3e50'
              }}>Sangbin Cho</h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#7f8c8d'
              }}>xAI • Bias detection & real-time analysis</p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#2c3e50'
              }}>Eric Li</h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#7f8c8d',
                marginBottom: '1rem'
              }}>Model evaluation & post-training</p>

              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#2c3e50'
              }}>Albert Jackson</h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#7f8c8d'
              }}>ML engineering & optimization</p>
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>
            Bottom Line
          </h2>
          
          <div style={{
            background: '#f8f9fa',
            borderLeft: '4px solid #e74c3c',
            padding: '2rem',
            margin: '2rem 0'
          }}>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              color: '#2c3e50',
              fontWeight: '500',
              lineHeight: '1.6'
            }}>
              AI political bias isn't theoretical—it's measurable, it's happening now, and it varies significantly between models.
            </p>
            <p style={{
              fontSize: '1rem',
              marginBottom: '1rem',
              color: '#34495e'
            }}>
              This system makes AI political reasoning transparent. Instead of guessing about bias, you can watch it form in real-time as news breaks.
            </p>
            <p style={{
              fontSize: '1rem',
              color: '#34495e'
            }}>
              The code is live, the debates are happening, and the data is there for anyone who wants to understand how AI systems think about politics.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          borderTop: '2px solid #ecf0f1',
          paddingTop: '2rem',
          marginTop: '3rem'
        }}>
          <p style={{ 
            fontSize: '1rem', 
            color: '#7f8c8d',
            marginBottom: '1rem'
          }}>
            Questions? Check the Developers tab for team contacts.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.9rem',
            color: '#95a5a6'
          }}>
            <span>Built with React + Node.js</span>
            <span>•</span>
            <span>Real-time WebSocket updates</span>
            <span>•</span>
            <span>Open source MIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whitepaper; 