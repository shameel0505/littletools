import { useEffect, useRef, useState } from 'react';

export default function AdBanner({ 
  adSlot = '8979592305', 
  style, 
  className = '', 
  format = 'auto' 
}) {
  const initialized = useRef(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    setIsLocalhost(isLocal);

    if (!initialized.current) {
      initialized.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push:", e);
      }
    }
  }, []);

  return (
    <div className={`ad-container-slot ${className}`} style={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <ins 
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-5314529663523439" 
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {isLocalhost && (
        <div style={{
          padding: '1rem',
          margin: '0.75rem auto',
          maxWidth: '728px',
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1.5px dashed rgba(59, 130, 246, 0.4)',
          borderRadius: '8px',
          color: 'var(--text-secondary, #94a3b8)',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <strong style={{ color: '#3b82f6' }}>Google AdSense Slot Verified (Ready for Live)</strong>
          </div>
          <div>Slot ID: <code>{adSlot}</code> • Client: <code>ca-pub-5314529663523439</code></div>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            Note: Google does not serve live ads on <code>localhost</code>. Real ads will display on <strong>littletools.me</strong> once Google finishes account review.
          </span>
        </div>
      )}
    </div>
  );
}
