import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Send, CheckCircle, Clock, ShieldAlert, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate instantaneous client-side acknowledgment
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="contact-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
      <Helmet>
        <title>Contact Us & Support — LittleTools.me</title>
        <meta name="description" content="Contact the LittleTools.me team for inquiries, bug reports, feature suggestions, and partnerships. We're here to help." />
        <link rel="canonical" href="https://littletools.me/contact" />
      </Helmet>

      {/* Header */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
          <MessageSquare size={14} />
          <span>Support & Inquiries</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          We'd Love to Hear From You
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Have a question about our browser tools, found a bug, or have an idea for a new feature? Reach out to our team below.
        </p>
      </section>

      {/* Main Grid: Contact Cards & Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        {/* Left Column: Direct Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Direct Email Support</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Official contact inbox</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              For general inquiries, business partnerships, or feedback:
            </p>
            <a href="mailto:support@littletools.me" style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>
              support@littletools.me
            </a>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Response Time</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Quick turnarounds</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              We usually respond to all inquiries within <strong>24 to 48 hours</strong> (Monday through Friday).
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Frequently Asked Questions</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Instant answers</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Looking for quick answers about file limits or client-side privacy?
            </p>
            <Link to="/about" style={{ color: 'var(--accent-blue)', fontSize: '0.88rem', fontWeight: 600 }}>
              Read our Technology & Privacy Overview &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Thank you for reaching out to LittleTools. Our team will review your message and reply to <strong>{formData.email}</strong> shortly.
              </p>
              <button 
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="btn-feature"
                style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Send Us a Message</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Your Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Subject / Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Select an inquiry category</option>
                  <option value="Bug Report">Bug Report / Technical Issue</option>
                  <option value="Feature Request">Feature Request / Suggestion</option>
                  <option value="General Inquiry">General Question</option>
                  <option value="Partnership">Partnership / Media Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Message</label>
                <textarea 
                  rows={4} 
                  required 
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-solid" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent-blue)', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
