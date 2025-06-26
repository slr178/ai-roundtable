import React, { useState } from 'react';

interface DeveloperProfile {
  name: string;
  slug: string;
  role: string;
  company: string;
  image: string;
  shortBio: string;
  twitter: string;
  linkedin: string;
  projectStory: string;
}

const Developers: React.FC = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperProfile | null>(null);

  const developers: DeveloperProfile[] = [
    {
      name: "Ray Hotate",
      slug: "ray-hotate",
      role: "Member of Technical Staff",
      company: "xAI",
      image: "/developers/ray_hotate.png",
      shortBio: "AI researcher with experience at Stanford AI Lab, Harvard Medical School, and policy advisor to the Japanese government.",
      twitter: "https://x.com/rayhotate",
      linkedin: "https://www.linkedin.com/in/ray-hotate/",
      projectStory: "Hey there! I'm Ray Hotate, Member of Technical Staff at xAI, where I architect and maintain the high-throughput AI services that power all our models. This four-AI political reactor project is a natural extension of my day-to-day work—by plugging our robust, low-latency Twitter ingestion pipelines straight into Grok, GPT, Claude, and Deepseek, I get to ensure smooth real-time data flow and reliability at scale. I love that it lets researchers flip alignment dials, compare emerging biases, and run experiments on live news without flakiness. In short, it's exactly the kind of hands-on, infrastructure-driven challenge I signed up for at xAI—and it's a blast to see our APIs unlock new ways to study how AI opinions actually form."
    },
    {
      name: "Charles Stephens",
      slug: "charlie-stephens", 
      role: "Founding GTM",
      company: "xAI",
      image: "/developers/charlie_stephens.jpeg",
      shortBio: "Business development leader with 7+ years at Databricks and entrepreneur who founded a company in Argentina.",
      twitter: "https://x.com/expeanutbutter",
      linkedin: "https://www.linkedin.com/in/cstephens49/",
      projectStory: "Hey there! I'm thrilled to be leading this at xAI. We've wired our four AIs—Grok, GPT, Claude and Deepseek—straight into a live Twitter news feed, so they're automatically triggered by breaking headlines and form their own takes in real time. With our unified API you can fine-tune filters, swap prompts on the fly, or even dial each agent's \"alignment\" up or down. Imagine flipping between a conservative-leaning Grok reaction and a liberal-leaning GPT breakdown of the same story—no manual work needed. My mission is to make it super easy and fun for researchers and developers to experiment with, compare, and responsibly guide how these AIs develop opinions on the news."
    },
    {
      name: "Eric Li",
      slug: "eric-li",
      role: "Former Quantitative Trader & Compiler Engineer",
      company: "IMC Trading / Observe Inc.",
      image: "/developers/eric_li.jpeg",
      shortBio: "Quantitative trader, compiler engineer, and Y Combinator founder with expertise in trading and systems.",
      twitter: "https://x.com/ThePenguinCo",
      linkedin: "https://www.linkedin.com/in/ericli1234/",
      projectStory: "I architect and refine our model evaluation and post-training pipelines, so this four-AI political reactor is right in my wheelhouse. I get to design the prompt-engineering workflows that feed live Twitter news into Grok, GPT, Claude, and Deepseek—letting them autonomously form takes and push structured responses. It's thrilling to apply my infrastructure-and-modeling expertise to unlock transparent, side-by-side comparisons of how each AI's political views emerge—and to build the tools that make those experiments seamless for researchers and developers alike."
    },
    {
      name: "Albert Jackson",
      slug: "albert-jackson",
      role: "Software Engineer",
      company: "Technology Consultant",
      image: "/developers/albert.jpeg",
      shortBio: "Software engineer and technology consultant with expertise in full-stack development and modern web technologies.",
      twitter: "https://x.com/xYoAlbert",
      linkedin: "https://www.linkedin.com/in/albert-jackson-60616332b/",
      projectStory: "Hey there! I'm Albert Jackson, a Machine Learning Engineer on the xAI team. I've spent the last few years building and fine-tuning large language models—especially ones that can sift through noisy social feeds—and this four-AI political reactor project is the perfect playground for that. I'm stoked to plug our live Twitter ingestion into Grok, GPT, Claude, and Deepseek, then build the training and evaluation pipelines that let them autonomously form—and even debate—their own takes on breaking news. Plus, I've worked closely with fellow ML teams at partner AI labs to exchange best practices and optimizations, so I'm all about forging those connections to make our bias-tracking frameworks even stronger. In short, this is exactly the kind of end-to-end ML challenge I love—and I can't wait to see what insights we uncover about how AI opinions emerge."
    },
    {
      name: "Sangbin Cho",
      slug: "sangbin-cho",
      role: "AI Research Engineer",
      company: "xAI",
      image: "/developers/sangbincho.jpeg",
      shortBio: "AI research engineer specializing in large language models, political bias detection, and real-time data processing systems.",
      twitter: "https://x.com/Saaaang94",
      linkedin: "https://www.linkedin.com/in/sang-cho/",
      projectStory: "Hi! I'm Sangbin Cho, an AI Research Engineer at xAI focused on understanding and measuring political bias in large language models. This four-AI political reactor is particularly exciting for me because it lets us observe how different AI systems—Grok, GPT, Claude, and DeepSeek—develop and express political opinions when exposed to the same real-time news streams. I've been working on the bias detection algorithms that track each AI's political shifts in real-time, building the frameworks that measure not just what they say, but how their underlying worldviews evolve through debate interactions. What fascinates me most is seeing how each model's training and architecture influences their political reasoning patterns, and this project gives us unprecedented visibility into those dynamics. It's like having a laboratory for studying AI political consciousness in action."
    }
  ];

  const containerStyle = {
    minHeight: '100vh',
    padding: '4rem 2rem',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '5rem'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '300',
    marginBottom: '0',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const
  };

  const gridStyle = {
    display: 'flex',
    gap: '6rem',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
    maxWidth: '900px'
  };

  const developerContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem'
  };

  const nameStyle = {
    fontSize: '1.1rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: '"Inter", sans-serif',
    textAlign: 'center' as const,
    marginTop: '0.5rem'
  };

  const developerButtonStyle = {
    background: 'transparent',
    borderRadius: '50%',
    padding: '0',
    border: 'none',
    width: '160px',
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
    opacity: 0.9,
    position: 'relative' as const
  };

  const clickMeButtonStyle = {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: 'rgba(0, 212, 255, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    cursor: 'pointer',
    zIndex: 10,
    fontFamily: '"Inter", sans-serif',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    animation: 'pulse 2s infinite'
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem'
  };

  const modalContentStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative' as const,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
  };

  const modalCloseStyle = {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  const imageStyle = {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'border-color 0.2s ease'
  };

  const socialLinksStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  };

  const socialLinkStyle = {
    padding: '0.6rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    fontFamily: '"Inter", sans-serif',
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div className="page-container">
      {/* Override the dark overlay completely to show the gif clearly */}
      <style>
        {`.page-container::before { display: none !important; }`}
      </style>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>THE DEVELOPERS</h1>
        </div>

        <div style={gridStyle}>
          {developers.map((dev, index) => (
            <div key={index} style={developerContainerStyle}>
              <div
                style={developerButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                  if (img) {
                    img.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                  if (img) {
                    img.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
              >
                <img 
                  src={dev.image} 
                  alt={dev.name}
                  style={imageStyle}
                />
                <button
                  style={clickMeButtonStyle}
                  onClick={() => setSelectedDeveloper(dev)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  My story
                </button>
              </div>
              
              <div style={nameStyle}>{dev.name}</div>
              
              <div style={socialLinksStyle}>
                <a
                  href={dev.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <img 
                    src="/xlogo.png" 
                    alt="X/Twitter" 
                    style={{
                      width: '20px',
                      height: '20px'
                    }}
                  />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <img 
                    src="/linkedinlogo.png" 
                    alt="LinkedIn" 
                    style={{
                      width: '20px',
                      height: '20px'
                    }}
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for developer project story */}
      {selectedDeveloper && (
        <div style={modalOverlayStyle} onClick={() => setSelectedDeveloper(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button
              style={modalCloseStyle}
              onClick={() => setSelectedDeveloper(null)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <img
                src={selectedDeveloper.image}
                alt={selectedDeveloper.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover' as const,
                  border: '2px solid rgba(0, 212, 255, 0.5)'
                }}
              />
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  color: '#333',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: '600'
                }}>
                  {selectedDeveloper.name}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#666',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  {selectedDeveloper.role} • {selectedDeveloper.company}
                </p>
              </div>
            </div>
            
            <div style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#444',
              fontFamily: '"Inter", sans-serif'
            }}>
              {selectedDeveloper.projectStory}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Developers; 