import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function Terms() {
  return (
    <div className="terms-page" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
      <Helmet>
        <title>Terms of Service | LittleTools.me</title>
        <meta name="description" content="Terms of Service for LittleTools.me." />
      </Helmet>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: September 1, 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <FileCheck size={20} color="#10b981" /> 1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using LittleTools.me, you agree to be bound by these Terms of Service. If you do not agree to all of the terms, do not access or use the tools.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <Cpu size={20} color="#3b82f6" /> 2. Use License & Client-Side Execution
        </h2>
        <p>
          LittleTools grants you a personal, non-exclusive, non-transferable license to use the web utilities for both personal and commercial purposes. You retain full ownership and rights over all images, files, and documents processed through our tools.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <ShieldAlert size={20} color="#ef4444" /> 3. Disclaimer of Warranties
        </h2>
        <p>
          The services are provided "AS IS" and "AS AVAILABLE" without warranty of any kind. While our in-browser AI and OCR engines strive for high accuracy, LittleTools makes no warranty that outputs will be error-free or uninterrupted.
        </p>
      </section>
    </div>
  );
}
