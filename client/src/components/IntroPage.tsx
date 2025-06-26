import React, { useEffect } from 'react';

interface IntroPageProps {
  onComplete: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
  useEffect(() => {
    // Don't preload background - it's already in CSS and causes duplicate loading
    // Just set the timer for intro completion
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="intro-page">
      <div className="logo">
        <img 
          src="/xailogo.png" 
          alt="xAI Logo" 
          className="logo-image"
        />
        <div className="logo-content">
          <div className="box">RN</div>
          <div className="text">
            <span className="first">RND</span> <span className="second">TBL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage; 