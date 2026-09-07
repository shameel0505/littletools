import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Zap, Lock, Cpu, Globe, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="about-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
      <Helmet>
        <title>About Us — Private, High-Performance Web Utilities | LittleTools.me</title>
        <meta name="description" content="Learn about LittleTools.me, our mission to build 100% private, client-side browser utilities, and the modern WebAssembly & WebGPU technology behind our platform." />
        <link rel="canonical" href="https://littletools.me/about" />
      </Helmet>

      {/* Hero Header */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
          <Shield size={14} />
          <span>Our Mission & Architecture</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Building Software That Respects Your Privacy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto' }}>
          LittleTools was founded on a simple principle: modern web browsers are powerful computers. You shouldn't have to upload your confidential files to remote cloud servers just to perform everyday digital tasks.
        </p>
      </section>

      {/* Core Values Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Lock size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>100% Client-Side Privacy</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            All processing (AI background removal, OCR, document conversion) runs directly on your device using WebAssembly and WebGPU. Your files never touch a remote server.
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero Subscription Barriers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            We believe essential creative and productivity utilities should be accessible to everyone—no subscriptions, no mandatory account sign-ups, and no paywalls.
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Next-Gen Web Standards</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            We leverage cutting-edge web technologies like ONNX Runtime Web, Tesseract OCR in Web Workers, and hardware-accelerated shaders for near-native performance.
          </p>
        </div>
      </section>

      {/* The Story & Tech Stack */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Why We Built LittleTools
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.98rem' }}>
          Every day, millions of creators, developers, students, and businesses upload sensitive documents, proprietary design assets, and confidential photos to online converters and background removers. Most of these legacy tools upload your files to centralized cloud storage, where they can be retained, analyzed, or vulnerable to data breaches.
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.98rem' }}>
          We set out to engineer an alternative suite of tools that runs completely within the browser sandbox. By downloading lightweight, state-of-the-art neural networks directly into your browser's cache, your computer performs all computations locally with zero latency, zero bandwidth waste on file uploads, and absolute security.
        </p>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Our Technology Stack
        </h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>ONNX Runtime Web & WebAssembly (WASM):</strong> Powers our client-side AI Background Remover without consuming server resources.</li>
          <li><strong>Tesseract.js & PDF.js:</strong> Enables client-side optical character recognition (OCR) and document extraction directly from PDFs, DOCX, and images.</li>
          <li><strong>3D Color Science & Filmic Look-Up Tables:</strong> Powers CineGrade Studio, enabling creators to export professional 3D LUTs for DaVinci Resolve, Premiere Pro, and Final Cut.</li>
          <li><strong>React & Vite:</strong> Delivers sub-second page loads and seamless, responsive user experiences across mobile and desktop devices.</li>
        </ul>
      </section>

      {/* Call to Action */}
      <section style={{ textAlign: 'center', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ready to Explore Our Free Suite?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Discover private, high-speed tools built for creators, photographers, and developers.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/bg-remover" className="btn-solid" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', background: 'var(--accent-blue)', color: 'white', fontWeight: 600 }}>
            Try Background Remover <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-feature" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}>
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
