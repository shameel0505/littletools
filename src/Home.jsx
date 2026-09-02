import { Link } from 'react-router-dom';
import { Layers, Monitor, ArrowRight, Zap, Shield, Image as ImageIcon, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AdBanner from './AdBanner';

export default function Home() {
  return (
    <div className="home-page">
      <Helmet>
        <title>LittleTools.me — Free, Fast & 100% Private Web Utilities</title>
        <meta name="description" content="A curated suite of high-performance web utilities running entirely in your browser with zero data uploads. AI Background Remover, YouTube Thumbnail Studio, and Doc to Markdown Converter." />
        <link rel="canonical" href="https://littletools.me/" />
        
        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://littletools.me/" />
        <meta property="og:title" content="LittleTools.me — Free, Fast & 100% Private Web Utilities" />
        <meta property="og:description" content="High-performance, privacy-first tools designed for everyone. Everything runs entirely in your browser with zero data uploads." />
        <meta property="og:site_name" content="LittleTools" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LittleTools.me — Free, Fast & Private Web Utilities" />
        <meta name="twitter:description" content="AI Background Remover, YouTube Thumbnail Tester, and Doc to Markdown. 100% free and in-browser." />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "LittleTools",
            "url": "https://littletools.me/",
            "description": "Free, fast, and 100% private web utilities running entirely in your browser.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://littletools.me/{search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <section className="hero-section">
        <div className="hero-badge">Free Web Utilities</div>
        <h1 className="hero-title">Simple, Fast, and Private<br />Tools for Everyone.</h1>
        <p className="hero-subtitle">
          High-performance, privacy-first tools designed for everyone. Everything runs entirely in your browser with zero data uploads.
        </p>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon bg-blue">
            <Layers size={24} />
          </div>
          <h3>Background Remover</h3>
          <p>Instantly strip backgrounds from any image using state-of-the-art AI. Supports batch processing for e-commerce.</p>
          <ul className="feature-list">
            <li><Zap size={14}/> Client-side WebGPU acceleration</li>
            <li><Shield size={14}/> 100% private, no server uploads</li>
            <li><ImageIcon size={14}/> Single and Batch modes</li>
          </ul>
          <Link to="/bg-remover" className="btn-solid btn-feature">
            Launch Tool <ArrowRight size={14} />
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon bg-purple">
            <Monitor size={24} />
          </div>
          <h3>Thumbnail CTR Tester</h3>
          <p>Preview exactly how your video thumbnails will look in the wild across YouTube's desktop, mobile, and search feeds.</p>
          <ul className="feature-list">
            <li><Zap size={14}/> Pixel-perfect native layouts</li>
            <li><Shield size={14}/> Contrast & Blur diagnostic tools</li>
            <li><ImageIcon size={14}/> Real-time timestamp overlays</li>
          </ul>
          <Link to="/thumbnail-tester" className="btn-solid btn-feature">
            Launch Tool <ArrowRight size={14} />
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: '#10b981', color: 'white' }}>
            <FileText size={24} />
          </div>
          <h3>Doc to Markdown (AI Context)</h3>
          <p>Convert PDFs, DOCX, and Scanned Images (via local OCR) into clean Markdown optimized for ChatGPT and LLMs.</p>
          <ul className="feature-list">
            <li><Zap size={14}/> English & Arabic OCR support</li>
            <li><Shield size={14}/> 100% private, local processing</li>
            <li><Monitor size={14} /> OpenAI Token Estimator</li>
          </ul>
          <Link to="/doc-to-md" className="btn-solid btn-feature">
            Launch Tool <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Standard Rectangular Ad Placeholder */}
      <div className="standard-ad-banner">
        <span className="ad-label">Advertisement</span>
        <AdBanner 
          adSlot="8979592305" 
          className="banner-ad-bottom"
          style={{ display: 'block', width: '100%', maxWidth: '970px', height: '250px' }} 
        />
      </div>
    </div>
  );
}
