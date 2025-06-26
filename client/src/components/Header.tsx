import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const headerStyle = {
    background: 'rgba(0, 0, 0, 0.1) !important' as any,
    backgroundImage: 'none !important' as any,
    backgroundAttachment: 'initial !important' as any,
    backgroundRepeat: 'no-repeat !important' as any,
    backgroundPosition: 'initial !important' as any,
    backgroundSize: 'initial !important' as any,
    backdropFilter: 'blur(20px) saturate(150%) !important' as any,
    WebkitBackdropFilter: 'blur(20px) saturate(150%) !important' as any,
    borderBottom: '1px solid rgba(255, 255, 255, 0.2) !important' as any,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2) !important' as any,
    position: 'relative' as const,
    zIndex: 1000,
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const flexStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white'
  };

  const navStyle = {
    display: 'flex',
    gap: '2rem'
  };

  const linkStyle = (active: boolean) => ({
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s',
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
  });

  return (
    <header 
      className="react-header-component custom-header" 
      style={headerStyle}
      data-no-global-styles="true"
    >
      <div style={containerStyle}>
        <div style={flexStyle}>
          <div>
            <h1 style={titleStyle}>🎯 Roundtable</h1>
          </div>
          <nav style={navStyle}>
            <Link
              to="/"
              style={linkStyle(isActive('/'))}
            >
              Roundtable
            </Link>
            <Link
              to="/dashboard"
              style={linkStyle(isActive('/dashboard'))}
            >
              Dashboard
            </Link>
            <Link
              to="/news"
              style={linkStyle(isActive('/news'))}
            >
              News Feeds
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 