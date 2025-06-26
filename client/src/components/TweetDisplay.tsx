import React, { useState, useEffect } from 'react';

interface TweetData {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  user?: {
    name?: string;
    screen_name?: string;
    image?: string;
    followers?: number;
    following?: number;
    verification?: {
      is_blue_verified?: boolean;
      verified_type?: string;
    };
  };
  retweet_count?: number;
  favorite_count?: number;
  linkData?: {
    hasLinks: boolean;
    linkCount: number;
    urls?: string[];
  };
}

interface TweetDisplayProps {
  tweetData?: TweetData;
  className?: string;
}

const TweetDisplay: React.FC<TweetDisplayProps> = ({ tweetData, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when tweet data changes
  useEffect(() => {
    if (tweetData) {
      setIsLoading(false);
    }
  }, [tweetData?.id]); // Only reset when tweet ID changes

  if (!tweetData) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`tweet-display ${className}`} style={{ opacity: 0.7 }}>
        <div className="tweet-header">
          <div className="tweet-author-info">
            <div style={{
              width: 120,
              height: 16,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
        <div style={{
          width: '100%',
          height: 40,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>
    );
  }

  const formatNumber = (num: number = 0) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      if (!timestamp) return 'now';
      const date = new Date(timestamp);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'now';
      
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'now';
    }
  };

  // Safely extract user data with fallbacks
  const displayName = tweetData.user?.name || tweetData.author || 'Unknown User';
  const username = tweetData.user?.screen_name || tweetData.author || 'unknown';
  const isVerified = tweetData.user?.verification?.is_blue_verified || false;

  return (
    <div className={`tweet-display ${className}`}>
      <div className="tweet-header">
        <div className="tweet-author-info">
          <div className="tweet-author-line">
            <span className="tweet-display-name">
              {displayName}
              {isVerified && (
                <svg className="tweet-verified-badge" viewBox="0 0 24 24" aria-label="Verified account">
                  <g>
                    <path fill="currentColor" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"></path>
                  </g>
                </svg>
              )}
            </span>
            <span className="tweet-username">@{username}</span>
            <span className="tweet-separator">·</span>
            <span className="tweet-timestamp">{formatTimestamp(tweetData.timestamp)}</span>
          </div>
        </div>
      </div>

      <div className="tweet-content">
        {tweetData.content || 'No content available'}
      </div>

      {tweetData.linkData?.hasLinks && (
        <div className="tweet-link-indicator">
          <svg className="tweet-link-icon" viewBox="0 0 24 24">
            <g>
              <path fill="currentColor" d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.593 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.693-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.693 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.403.547-.722.547z"></path>
              <path fill="currentColor" d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.693 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z"></path>
            </g>
          </svg>
          <span>{tweetData.linkData.linkCount} link{tweetData.linkData.linkCount > 1 ? 's' : ''} attached</span>
        </div>
      )}

      <div className="tweet-stats">
        <div className="tweet-stat">
          <svg className="tweet-stat-icon" viewBox="0 0 24 24">
            <g>
              <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8.005 8.005-8.005h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.005zm8.005-6.005c-3.317 0-6.005 2.69-6.005 6.005 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
            </g>
          </svg>
          <span>Analyzing</span>
        </div>

        <div className="tweet-stat">
          <svg className="tweet-stat-icon" viewBox="0 0 24 24">
            <g>
              <path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.791-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.791 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"></path>
            </g>
          </svg>
          <span>{formatNumber(tweetData.retweet_count)}</span>
        </div>

        <div className="tweet-stat">
          <svg className="tweet-stat-icon" viewBox="0 0 24 24">
            <g>
              <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
            </g>
          </svg>
          <span>{formatNumber(tweetData.favorite_count)}</span>
        </div>
      </div>
    </div>
  );
};

export default TweetDisplay; 