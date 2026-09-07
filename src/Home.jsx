import { Link } from 'react-router-dom';
import { Layers, Monitor, ArrowRight, Zap, Shield, Image as ImageIcon, FileText, Film } from 'lucide-react';
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

        <div className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
            <Film size={24} />
          </div>
          <h3>CineGrade AI</h3>
          <p>The industry-standard neural color grading engine. Transform your RAW footage into cinematic masterpieces instantly using Cloud GPU.</p>
          <ul className="feature-list">
            <li><Zap size={14}/> Cloud GPU Compute</li>
            <li><ImageIcon size={14}/> 4.8 GB Neural Models</li>
            <li><Monitor size={14} /> Download 3D LUT (.cube)</li>
          </ul>
          <Link to="/cinegrade" className="btn-solid btn-feature">
            Launch Tool <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Why Choose Client-Side Section */}
      <section className="info-deepdive-section" style={{ marginTop: '3.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Why 100% Client-Side Web Utilities Matter
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Traditional web converters and AI photo tools upload your private files to cloud servers. LittleTools runs directly inside your browser sandbox.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#10b981' }}>🛡️ Zero Server Uploads</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Your confidential photos, business PDFs, and video footage never leave your device. Processing occurs purely in local memory (RAM & GPU).
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#3b82f6' }}>⚡ Blazing Fast Speed</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              No upload queues, server throttling, or waiting for files to download. WebAssembly and WebGPU deliver instantaneous processing.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#8b5cf6' }}>🚫 No Paywalls or Sign-Ups</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Unlimited daily use with zero subscription fees, hidden credits, watermarks, or mandatory account registrations.
            </p>
          </div>
        </div>
      </section>

      {/* Platform FAQ Section */}
      <section className="faq-section" style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.75rem', color: 'var(--text-primary)' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Are my images and documents really kept private?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Yes, 100%. Our AI Background Remover, Doc-to-Markdown, and Thumbnail Tester tools run exclusively in your browser via WebAssembly, Web Workers, and WebGPU. You can even disconnect your internet after loading the page and the tools will still work completely offline.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              What file types are supported across the platform?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              We support a wide array of media and document formats including JPEG, PNG, WEBP, PDF, DOCX, RAW (DNG, CR2, NEF), MP4, MOV, and AVI videos.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Can I use exported 3D LUTs in DaVinci Resolve or Premiere Pro?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Yes! CineGrade AI outputs standard industry <code>.CUBE</code> 3D Look-Up Tables (33x33x33 and 64x64x64 lattices) that are immediately compatible with Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro, OBS Studio, and Photoshop.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              How does the Doc-to-Markdown tool optimize context for ChatGPT and LLMs?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              LLMs (like ChatGPT, Claude, and Gemini) process structured Markdown much more efficiently than raw binary PDFs. Our tool cleans up headers, strips extraneous formatting, and calculates real-time token counts using OpenAI's tokenizer so you can minimize token costs and maximize context retention.
            </p>
          </div>
        </div>
      </section>

      {/* Standard Rectangular Ad Placeholder */}
      <div className="standard-ad-banner" style={{ marginTop: '3.5rem' }}>
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
