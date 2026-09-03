import { useEffect, useState } from 'react';
import { Settings, Moon, Sun, ArrowRight, Menu, X } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import FeedbackWidget from './components/FeedbackWidget';
import './layout.css';

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Track SPA route changes in Google Analytics
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-NVH4BE99QD', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-group" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v12a3 3 0 0 0 3 3h6" />
              <path d="M14 4h6" />
              <path d="M17 4v10" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">LittleTools</span>
            <span className="brand-tagline">Free Web Utilities</span>
          </div>
        </Link>

        <div className="header-right-controls">
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/bg-remover" className={`nav-link ${location.pathname === '/bg-remover' ? 'active' : ''}`}>BG Remover</Link>
            <Link to="/thumbnail-tester" className={`nav-link ${location.pathname === '/thumbnail-tester' ? 'active' : ''}`}>Thumbnail Tester</Link>
            <Link to="/doc-to-md" className={`nav-link ${location.pathname === '/doc-to-md' ? 'active' : ''}`}>Doc to MD</Link>
            <Link to="/cinegrade" className={`nav-link ${location.pathname === '/cinegrade' ? 'active' : ''}`}>CineGrade AI</Link>
          </nav>

          <div className="header-divider"></div>

          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} LittleTools.me. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
      
      <FeedbackWidget />
    </div>
  );
}
