import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface DeveloperData {
  [key: string]: {
    name: string;
    role: string;
    company: string;
    duration: string;
    location: string;
    background: string;
    education: string;
    highlights: string[];
    twitter: string;
    linkedin: string;
    image: string;
  };
}

const DeveloperDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const developerData: DeveloperData = {
    'ray-hotate': {
      name: "Ray Hotate",
      role: "Member of Technical Staff",
      company: "xAI",
      duration: "Dec 2024 - Present",
      location: "Palo Alto, California",
      background: "AI researcher with experience at Stanford AI Lab, Harvard Medical School, and policy advisor to the Japanese government on AI and Web3 technologies.",
      education: "Stanford University (Computer Science, 2022-2026), University of Tokyo Medical School",
      highlights: [
        "Machine Learning Researcher at Stanford AI Lab & Harvard Medical School",
        "AI Policy Advisor to Prime Minister Kishida Fumio of Japan", 
        "Top student at University of Tokyo Medical School (most prestigious in Japan)",
        "Former intern at Goldman Sachs Private Equity and Cubist Systematic Strategies",
        "Eagle Scout and multilingual (English, Japanese, Spanish, Portuguese, Czech)"
      ],
      twitter: "https://x.com/rayhotate",
      linkedin: "https://www.linkedin.com/in/ray-hotate/",
      image: "/developers/ray_hotate.png"
    },
    'charlie-stephens': {
      name: "Charles Stephens",
      role: "Founding GTM",
      company: "xAI",
      duration: "Jun 2025 - Present", 
      location: "San Francisco, California",
      background: "Business development and sales leader with 7+ years at Databricks, entrepreneur who founded a peanut butter company in Argentina, and expert in go-to-market strategies.",
      education: "Cabrini University (Finance, 2010-2014)",
      highlights: [
        "7+ years at Databricks as Named Enterprise Account Executive",
        "Co-founded Nina's Peanut Butter company in Buenos Aires",
        "Led business development teams from 10 to 40+ employees", 
        "International experience across US, Australia, and Argentina",
        "Eagle Scout with multilingual abilities (Spanish, English, Portuguese)"
      ],
      twitter: "https://x.com/expeanutbutter",
      linkedin: "https://www.linkedin.com/in/cstephens49/",
      image: "/developers/charlie_stephens.jpeg"
    },
    'eric-li': {
      name: "Eric Li",
      role: "Former Quantitative Trader & Compiler Engineer",
      company: "IMC Trading / Observe Inc.",
      duration: "Present",
      location: "Remote",
      background: "Quantitative trader, compiler engineer, and Y Combinator founder with expertise in derivatives trading, language design, and database systems optimization.",
      education: "University of Waterloo (Math & Computer Science, 2018-2023), GPA: 3.9",
      highlights: [
        "Quantitative Trader at IMC Trading",
        "Compiler Engineer developing query language compilers in Go",
        "Y Combinator W20 startup founder (Hyperdoc)",
        "Former Software Engineer Intern at Google, optimized ML training performance by 900%",
        "Expert in Python, Go, C++, AWS, machine learning, and blockchain technologies"
      ],
      twitter: "https://x.com/ThePenguinCo",
      linkedin: "https://www.linkedin.com/in/ericli1234/",
      image: "/developers/eric_li.jpeg"
    },
    'albert-jackson': {
      name: "Albert Jackson",
      role: "Software Engineer",
      company: "Technology Consultant",
      duration: "Present",
      location: "Canada",
      background: "Full-stack software engineer and technology consultant with expertise in modern web development, cloud architecture, and scalable systems design. Passionate about building innovative solutions that bridge technology and user experience.",
      education: "Computer Science & Software Engineering",
      highlights: [
        "Full-stack development with modern frameworks and technologies",
        "Technology consulting for various business solutions",
        "Expert in web development, cloud infrastructure, and system architecture",
        "Active contributor to open-source projects and developer community",
        "Specialized in React, Node.js, and cloud-native applications"
      ],
      twitter: "https://x.com/xYoAlbert",
      linkedin: "https://www.linkedin.com/in/albert-jackson-60616332b/",
      image: "/developers/albert.jpeg"
    }
  };

  const developer = slug ? developerData[slug] : null;

  if (!developer) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'url("./background.gif") center/cover, rgba(0, 0, 0, 0.4)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Developer Not Found</h1>
          <button 
            onClick={() => navigate('/developers')}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid #00d4ff',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Back to Developers
          </button>
        </div>
      </div>
    );
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'url("./background.gif") center/cover, rgba(0, 0, 0, 0.4)',
    backgroundAttachment: 'fixed',
    padding: '2rem',
    color: 'white'
  };

  const backButtonStyle = {
    position: 'absolute' as const,
    top: '2rem',
    left: '2rem',
    padding: '0.8rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    fontFamily: '"Space Mono", monospace'
  };

  const contentStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    paddingTop: '4rem'
  };

  const headerStyle = {
    display: 'flex',
    gap: '3rem',
    alignItems: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap' as const
  };

  const imageStyle = {
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '4px solid rgba(0, 212, 255, 0.5)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  };

  const nameInfoStyle = {
    flex: 1,
    minWidth: '300px'
  };

  const nameStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #00d4ff, #0099cc, #ffffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: '"Space Mono", monospace'
  };

  const roleStyle = {
    fontSize: '1.4rem',
    color: '#00d4ff',
    marginBottom: '0.5rem',
    fontWeight: '600'
  };

  const companyStyle = {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '0.5rem'
  };

  const locationStyle = {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '2rem'
  };

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const sectionTitleStyle = {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: '1rem',
    fontFamily: '"Space Mono", monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
  };

  const textStyle = {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.9)'
  };

  const highlightListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const highlightItemStyle = {
    fontSize: '1rem',
    lineHeight: '1.8',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '0.8rem',
    paddingLeft: '1rem',
    position: 'relative' as const
  };

  const bulletStyle = {
    position: 'absolute' as const,
    left: 0,
    color: '#00d4ff',
    fontWeight: 'bold'
  };

  const socialLinksStyle = {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '2rem'
  };

  const socialLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
    fontFamily: '"Space Mono", monospace',
    minWidth: '60px',
    minHeight: '60px'
  };

  return (
    <div style={containerStyle}>
      <button
        style={backButtonStyle}
        onClick={() => navigate('/developers')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
          e.currentTarget.style.borderColor = '#00d4ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
      >
        ← Back to Developers
      </button>

      <div style={contentStyle}>
        <div style={headerStyle}>
          <img 
            src={developer.image}
            alt={developer.name}
            style={imageStyle}
          />
          <div style={nameInfoStyle}>
            <h1 style={nameStyle}>{developer.name}</h1>
            <div style={roleStyle}>{developer.role}</div>
            <div style={companyStyle}>{developer.company} • {developer.duration}</div>
            <div style={locationStyle}>{developer.location}</div>
            
            <div style={socialLinksStyle}>
              <a
                href={developer.twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src="/xlogo.png" 
                  alt="X/Twitter" 
                  style={{
                    width: '24px',
                    height: '24px'
                  }}
                />
              </a>
              <a
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={socialLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src="/linkedinlogo.png" 
                  alt="LinkedIn" 
                  style={{
                    width: '24px',
                    height: '24px'
                  }}
                />
              </a>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Background</div>
          <div style={textStyle}>{developer.background}</div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Education</div>
          <div style={textStyle}>{developer.education}</div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Key Highlights</div>
          <ul style={highlightListStyle}>
            {developer.highlights.map((highlight, idx) => (
              <li key={idx} style={highlightItemStyle}>
                <span style={bulletStyle}>•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetail; 