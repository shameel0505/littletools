import { useState } from 'react';
import { MessageSquare, X, CheckCircle, Send, Loader2, Bug, Lightbulb } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './feedbackWidget.css';

// Formspree Endpoint (Hides email address securely)

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('https://formspree.io/f/mkjnrzeq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: `New ${type} from LittleTools`,
          type: type,
          message: message,
          ...(email ? { email: email } : {}),
          path: location.pathname,
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();
      
      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          // Reset form after closing
          setTimeout(() => {
            setIsSuccess(false);
            setMessage('');
            setEmail('');
            setType('Feedback');
          }, 500);
        }, 2500);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="feedback-modal"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="feedback-header">
              <h3>
                <MessageSquare size={18} className="text-accent" />
                Help us improve
              </h3>
              <button className="feedback-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="feedback-body">
              {isSuccess ? (
                <motion.div 
                  className="feedback-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="feedback-success-icon">
                    <CheckCircle size={32} />
                  </div>
                  <h4>Thank you!</h4>
                  <p>Your {type.toLowerCase()} has been received.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className="feedback-type-selector">
                    <button 
                      type="button" 
                      className={`feedback-type-btn ${type === 'Bug' ? 'active' : ''}`}
                      onClick={() => setType('Bug')}
                    >
                      <Bug size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'text-bottom' }} /> Bug
                    </button>
                    <button 
                      type="button" 
                      className={`feedback-type-btn ${type === 'Feature' ? 'active' : ''}`}
                      onClick={() => setType('Feature')}
                    >
                      <Lightbulb size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'text-bottom' }} /> Feature
                    </button>
                    <button 
                      type="button" 
                      className={`feedback-type-btn ${type === 'Feedback' ? 'active' : ''}`}
                      onClick={() => setType('Feedback')}
                    >
                      <MessageSquare size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'text-bottom' }} /> Feedback
                    </button>
                  </div>

                  <div className="feedback-form-group">
                    <label>How can we improve?</label>
                    <textarea 
                      className="feedback-textarea" 
                      placeholder="Tell us what's on your mind..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="feedback-form-group">
                    <label>Email (Optional)</label>
                    <input 
                      type="email" 
                      className="feedback-input" 
                      placeholder="For follow-up questions"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}

                  <button type="submit" className="feedback-submit" disabled={isSubmitting || !message.trim()}>
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} /> Send {type}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className="feedback-fab" 
        onClick={() => setIsOpen(!isOpen)}
        title="Send Feedback"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
