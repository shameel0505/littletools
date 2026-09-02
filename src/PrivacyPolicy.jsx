import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, EyeOff, Cookie, Server } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="policy-page" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
      <Helmet>
        <title>Privacy Policy | LittleTools.me</title>
        <meta name="description" content="Privacy Policy for LittleTools.me. Learn about our 100% client-side privacy architecture and our advertising cookie disclosures." />
      </Helmet>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: September 1, 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <Shield size={20} color="#10b981" /> 1. Our Core Promise: 100% Client-Side Processing
        </h2>
        <p>
          At <strong>LittleTools.me</strong>, we believe your personal files and creative work belong exclusively to you. All computational tools offered on this site—including our <strong>AI Background Remover</strong>, <strong>YouTube Thumbnail Tester</strong>, and <strong>Doc to Markdown Converter</strong>—execute <em>entirely inside your web browser</em> using modern client-side technologies (WebAssembly, WebGPU, and local Web Workers).
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>No images, scanned documents, PDFs, or files you process are ever uploaded to, transmitted across, or stored on our servers.</strong> If you disconnect your internet after the initial page load, our processing tools continue to function 100% offline.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <Cookie size={20} color="#3b82f6" /> 2. Google AdSense & Advertising Cookies
        </h2>
        <p>
          We use Google AdSense to serve advertisements when you visit our website. To comply with Google’s publisher policies, please be informed of the following:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
          <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>aboutads.info</a>.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <Server size={20} color="#8b5cf6" /> 3. Local Storage & Analytics
        </h2>
        <p>
          Our application may utilize your browser’s <code>localStorage</code> purely to remember your preferences (such as your light/dark mode choice or recent document history on your local device). This data never leaves your device and can be cleared at any time via your browser settings.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          <EyeOff size={20} color="#f59e0b" /> 4. Contact Us
        </h2>
        <p>
          If you have any questions or concerns regarding this Privacy Policy or our client-side architecture, you can contact us directly at <a href="mailto:support@littletools.me" style={{ color: '#3b82f6' }}>support@littletools.me</a>.
        </p>
      </section>
    </div>
  );
}
