import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  Download, 
  Film, 
  Loader2, 
  Settings, 
  ExternalLink,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  ShieldCheck,
  Search,
  RefreshCw,
  Columns,
  Wand2,
  Palette,
  Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import AdBanner from './AdBanner';

import './cineGradeTool.css';

const API_BASE = '';

export default function CineGradeTool() {
  const [customApiUrl, setCustomApiUrl] = useState(() => localStorage.getItem('cinegrade_custom_api') || '');
  const [tempUrl, setTempUrl] = useState(customApiUrl);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, connected, error
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');
  
  // Library & Selection
  const [library, setLibrary] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'custom_ref', 'auto_grade'
  const [autoStyle, setAutoStyle] = useState('blockbuster'); // 'blockbuster', 'golden_hour', 'noir', 'clean'
  
  const [selectedRef, setSelectedRef] = useState(null);
  const [customRefFile, setCustomRefFile] = useState(null);
  const [customRefPreview, setCustomRefPreview] = useState(null);
  
  const [targetFile, setTargetFile] = useState(null);
  const [targetPreview, setTargetPreview] = useState(null);
  
  // Grading Parameters
  const [intensity, setIntensity] = useState(100);
  const [protectSkin, setProtectSkin] = useState(true);
  const [isLog, setIsLog] = useState(false);
  
  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Comparison Viewer State
  const [splitPos, setSplitPos] = useState(50);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'side-by-side', 'graded'
  const isDraggingSplit = useRef(false);
  const splitContainerRef = useRef(null);

  const targetInputRef = useRef(null);
  const customRefInputRef = useRef(null);
  const activeBaseUrl = customApiUrl.trim().replace(/\/$/, '');

  useEffect(() => {
    localStorage.setItem('cinegrade_custom_api', customApiUrl);
    
    if (!customApiUrl) {
      setConnectionStatus('idle');
      return;
    }

    let isMounted = true;
    
    const connectToGpu = async () => {
      setConnectionStatus('connecting');
      setConnectionErrorMsg('');
      try {
        let baseUrl = customApiUrl.trim().replace(/\/$/, '');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        
        // Use Vite proxy in development to bypass CORS, but fetch directly in production
        const isDev = import.meta.env.DEV;
        const targetUrl = (baseUrl && isDev) ? '/tunnel-api/api/library' : (baseUrl ? `${baseUrl}/api/library` : '/api/library');
        
        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'bypass-tunnel-reminder': 'true',
            ...(baseUrl && isDev ? { 'x-target-url': baseUrl } : {})
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP ${res.status}: ${errText.substring(0, 100)}`);
        }
        
        const data = await res.json();
        if (isMounted) {
          const libraryWithBaseUrl = data.map(item => ({ ...item, baseUrl }));
          setLibrary(libraryWithBaseUrl);
          if (libraryWithBaseUrl.length > 0 && !selectedRef) {
            setSelectedRef(libraryWithBaseUrl[0]);
          }
          setConnectionStatus('connected');
        }
      } catch (err) {
        if (isMounted) {
          setConnectionStatus('error');
          if (err.name === 'AbortError') {
            setConnectionErrorMsg('Connection timed out. Is the Cloudflare tunnel active on Colab?');
          } else {
            setConnectionErrorMsg(err.message === 'Failed to fetch' ? 'Network Error: Tunnel offline or CORS blocked.' : err.message);
          }
        }
      }
    };
    
    connectToGpu();
    
    return () => {
      isMounted = false;
    };
  }, [customApiUrl]);

  const handleConnectClick = () => {
    setCustomApiUrl(tempUrl);
  };

  const handleTargetSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTargetFile(file);
      if (file.type.startsWith('image/')) {
        setTargetPreview(URL.createObjectURL(file));
      } else {
        setTargetPreview(null);
      }
    }
  };

  const handleTargetDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setTargetFile(file);
      if (file.type.startsWith('image/')) {
        setTargetPreview(URL.createObjectURL(file));
      } else {
        setTargetPreview(null);
      }
    }
  };

  const handleCustomRefSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomRefFile(file);
      setCustomRefPreview(URL.createObjectURL(file));
    }
  };

  const handleCustomRefDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setCustomRefFile(file);
      setCustomRefPreview(URL.createObjectURL(file));
    }
  };

  // Split view dragging handlers
  const handleSplitMouseDown = (e) => {
    e.preventDefault();
    isDraggingSplit.current = true;
  };

  const handleSplitMouseMove = (e) => {
    if (!isDraggingSplit.current || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSplitPos(percentage);
  };

  const handleSplitMouseUp = () => {
    isDraggingSplit.current = false;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => { isDraggingSplit.current = false; };
    const handleGlobalMouseMove = (e) => {
      if (isDraggingSplit.current) handleSplitMouseMove(e);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
    };
  }, []);

  // Filter Categories
  const categories = ['All', 'Sci-Fi', 'Warm / Golden', 'Dark / Noir', 'Pastel', 'Vintage', 'Drama'];
  const filteredLibrary = library.filter(item => {
    const matchesCat = categoryFilter === 'All' || item.category?.toLowerCase().includes(categoryFilter.toLowerCase()) || (categoryFilter === 'Sci-Fi' && item.category?.includes('Sci-Fi'));
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleGrade = async () => {
    if (!targetFile) return;
    if (activeTab === 'templates' && !selectedRef) return;
    if (activeTab === 'custom_ref' && !customRefFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessingStage('Analyzing footage & color science...');

    try {
      let baseUrl = customApiUrl.trim().replace(/\/$/, '') || API_BASE;
      const formData = new FormData();
      formData.append('target', targetFile);
      formData.append('intensity', (intensity / 100).toString());
      formData.append('protect_skin', protectSkin ? 'true' : 'false');
      formData.append('is_log', isLog ? 'true' : 'false');
      formData.append('steps', '25');
      formData.append('size', '512');
      formData.append('ncc', 'true');

      if (activeTab === 'auto_grade') {
        formData.append('mode', 'auto');
        formData.append('style', autoStyle);
        setProcessingStage(`Applying 1-Click Pro ${autoStyle.replace('_', ' ').toUpperCase()} Color Science...`);
      } else if (activeTab === 'custom_ref') {
        formData.append('mode', 'reference');
        formData.append('reference', customRefFile);
        setProcessingStage('Extracting custom reference chromatic distribution...');
      } else {
        formData.append('mode', 'reference');
        formData.append('ref_id', selectedRef.id || selectedRef.name);
        setProcessingStage(`Synthesizing 3D LUT from ${selectedRef.name}...`);
      }

      const isDev = import.meta.env.DEV;
      const targetUrl = (baseUrl && isDev) ? '/tunnel-api/api/grade' : (baseUrl ? `${baseUrl}/api/grade` : '/api/grade');
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(baseUrl && isDev ? { 'x-target-url': baseUrl } : {})
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const initData = await response.json();
      const taskId = initData.task_id;
      
      setProcessingStage('Applying 3D Look-Up Table & rendering output...');

      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const isDev = import.meta.env.DEV;
        const statusEndpoint = (baseUrl && isDev) ? `/tunnel-api/api/status/${taskId}` : (baseUrl ? `${baseUrl}/api/status/${taskId}` : `/api/status/${taskId}`);
        const statusRes = await fetch(statusEndpoint, {
          headers: {
            'Accept': 'application/json',
            'bypass-tunnel-reminder': 'true',
            ...(baseUrl && isDev ? { 'x-target-url': baseUrl } : {})
          }
        });
        if (!statusRes.ok) throw new Error(await statusRes.text());
        
        const statusData = await statusRes.json();
        if (statusData.status === 'completed') {
          setResult(statusData.result);
          break;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || "Unknown processing error");
        }
      }
    } catch (err) {
      console.error("Grading error:", err);
      setError(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="cinegrade-page">
      <Helmet>
        <title>CineGrade AI — 1-Click Cinematic Neural Color Grading | LittleTools</title>
        <meta name="description" content="Transform your photos and video footage with Hollywood-grade color palettes. Match iconic movie aesthetics like Dune, Blade Runner, and Oppenheimer, or use the 1-click AI Auto-Grader." />
        <link rel="canonical" href="https://littletools.me/cinegrade" />
        
        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://littletools.me/cinegrade" />
        <meta property="og:title" content="CineGrade AI — 1-Click Cinematic Neural Color Grading" />
        <meta property="og:description" content="Effortless Hollywood-grade color grading. Match iconic movie aesthetics, upload custom style references, or let the 1-click AI Auto-Grader perfect your shots." />
        <meta property="og:site_name" content="LittleTools" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CineGrade AI — 1-Click Cinematic Neural Color Grading" />
        <meta name="twitter:description" content="AI Neural Color Grading for creators and cinematographers. Export 3D LUTs (.cube) with zero quality loss." />
      </Helmet>

      {/* Header */}
      <header className="cinegrade-header">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="cinegrade-badge">
            <Sparkles size={14} />
            <span>AI Neural Color Science & 3D LUT Engine</span>
          </div>
          <h1>CineGrade Studio</h1>
          <p>
            Effortless Hollywood-grade color grading. Match iconic movie aesthetics, upload custom style references, or let the 1-click AI Auto-Grader perfect your shots.
          </p>
        </motion.div>
      </header>

      {/* GPU Connection Banner */}
      <motion.div className="gpu-banner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="gpu-banner-left">
          <div className="gpu-banner-title">
            <Settings size={16} className="icon-accent" />
            <span>GPU Backend Acceleration</span>
          </div>
          <p className="gpu-banner-desc">
            Connect to your free Google Colab Cloudflare tunnel for GPU-accelerated 3D LUT generation and 4K batch rendering.
          </p>
        </div>

        <div className="gpu-banner-right">
          <a 
            href="https://colab.research.google.com/github/shameel0505/VideoColorGrading/blob/main/CineGrade_Colab_Backend.ipynb" 
            target="_blank" 
            rel="noreferrer"
            className="btn-colab"
          >
            <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab" />
            Launch Free GPU
            <ExternalLink size={14} />
          </a>
          
          <div className="tunnel-input-wrapper">
            <input 
              type="text" 
              placeholder="Paste Cloudflare URL (e.g., https://xyz.trycloudflare.com)"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value.replace(/\/$/, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleConnectClick()}
              className="tunnel-input"
            />
            <button onClick={handleConnectClick} className="btn-connect">
              Connect
            </button>
          </div>
        </div>
      </motion.div>

      {/* Status Bar */}
      <div className="connection-status-bar">
        {connectionStatus === 'idle' && (
          <span className="status-idle">⚪ Disconnected &bull; Launch Colab and paste URL above to enable AI grading</span>
        )}
        {connectionStatus === 'connecting' && (
          <span className="status-connecting"><Loader2 size={13} className="animate-spin" /> Connecting to Cloud GPU & loading library...</span>
        )}
        {connectionStatus === 'connected' && (
          <span className="status-connected"><CheckCircle size={13} /> Connected to Cloud GPU &bull; {library.length} Cinematic looks ready</span>
        )}
        {connectionStatus === 'error' && (
          <span className="status-error">❌ Connection error: {connectionErrorMsg}</span>
        )}
      </div>

      {!result ? (
        <div className="cinegrade-workspace">
          {/* Left Column: Grade Source Selector */}
          <motion.div className="tool-card source-panel" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
            <div className="cinegrade-tabs">
              <button 
                className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                <Film size={15} />
                <span>Movie Looks</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'custom_ref' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom_ref')}
              >
                <ImageIcon size={15} />
                <span>Custom Reference</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'auto_grade' ? 'active' : ''}`}
                onClick={() => setActiveTab('auto_grade')}
              >
                <Wand2 size={15} />
                <span>AI Auto-Grader</span>
              </button>
            </div>

            {/* TAB 1: Movie Looks Gallery */}
            {activeTab === 'templates' && (
              <div className="tab-content">
                <div className="gallery-header-controls">
                  <div className="search-box">
                    <Search size={15} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search movie (Dune, Matrix, Joker, Oppenheimer...)" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="category-pills">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        className={`pill-btn ${categoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {connectionStatus !== 'connected' && library.length === 0 ? (
                  <div className="empty-gpu-prompt">
                    <Palette size={40} className="empty-icon" />
                    <h4>Connect to GPU to Load Looks</h4>
                    <p>Click "Launch Free GPU" above to start the Colab backend and load iconic movie palettes.</p>
                  </div>
                ) : (
                  <div className="gallery-grid">
                    {filteredLibrary.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`gallery-item ${selectedRef?.id === item.id ? 'selected' : ''}`}
                        onClick={() => setSelectedRef(item)}
                      >
                        <img 
                          src={item.baseUrl ? `${item.baseUrl}${item.path}` : `/tunnel-api${item.path}`} 
                          alt={item.name} 
                          loading="lazy"
                        />
                        <div className="gallery-overlay">
                          <span className="look-name">{item.name}</span>
                          <span className="look-cat">{item.category}</span>
                        </div>
                        {selectedRef?.id === item.id && (
                          <div className="check-badge">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Custom Reference Upload */}
            {activeTab === 'custom_ref' && (
              <div className="tab-content custom-ref-tab">
                <div className="custom-ref-hero">
                  <div className="hero-icon-wrapper">
                    <ImageIcon size={24} />
                  </div>
                  <h3>Match Any Vibe</h3>
                  <p>
                    Drop in any image with a color palette you love. The AI will extract its cinematic color grading and apply it directly to your footage.
                  </p>
                </div>

                <div 
                  className={`dropzone ref-dropzone ${customRefFile ? 'has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCustomRefDrop}
                  onClick={() => customRefInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={customRefInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={handleCustomRefSelect}
                  />
                  {customRefPreview ? (
                    <div className="custom-preview-container">
                      <img src={customRefPreview} alt="Custom Reference" className="custom-ref-img" />
                      <div className="custom-preview-badge">
                        <CheckCircle size={14} className="check-icon" /> 
                        <span className="badge-text">Reference Ready: {customRefFile?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <UploadCloud size={36} className="dropzone-icon" />
                      <h4>Drop Reference Image Here</h4>
                      <p>Click to browse JPEG, PNG, or WEBP</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: AI Auto-Grader */}
            {activeTab === 'auto_grade' && (
              <div className="tab-content auto-grade-tab">
                <div className="auto-grade-banner">
                  <div className="auto-grade-hero-icon">
                    <Sparkles size={28} />
                  </div>
                  <h3>Photographic Master Film Stock Emulation</h3>
                  <p>
                    Studio-grade Oklab subtractive color density. Select a physical 35mm film stock emulation:
                  </p>
                </div>

                <div className="style-preset-grid">
                  <div 
                    className={`style-preset-card ${autoStyle === 'vision3' || autoStyle === 'blockbuster' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('vision3')}
                  >
                    <div className="style-preview-bar blockbuster-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🎬 Kodak Vision3 500T (5219)</span>
                      <span className="style-card-desc">Hollywood standard: Deep oceanic shadows, warm golden skin & soft highlights.</span>
                    </div>
                    {(autoStyle === 'vision3' || autoStyle === 'blockbuster') && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'portra' || autoStyle === 'golden_hour' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('portra')}
                  >
                    <div className="style-preview-bar golden-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🌅 Kodak Portra 400</span>
                      <span className="style-card-desc">Warm & luminous: Creamy highlights, soft pastel roll-off & flattering complexion.</span>
                    </div>
                    {(autoStyle === 'portra' || autoStyle === 'golden_hour') && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'cinestill' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('cinestill')}
                  >
                    <div className="style-preview-bar cinestill-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🎆 CineStill 800T</span>
                      <span className="style-card-desc">Night neon aesthetic: Deep cobalt blues, rich tungsten warmth & halation glow.</span>
                    </div>
                    {autoStyle === 'cinestill' && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'kodachrome' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('kodachrome')}
                  >
                    <div className="style-preview-bar kodachrome-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🎞️ Kodak Kodachrome 64</span>
                      <span className="style-card-desc">Vintage 1970s National Geographic: Punchy contrast & saturated primary colors.</span>
                    </div>
                    {autoStyle === 'kodachrome' && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'fuji_pro' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('fuji_pro')}
                  >
                    <div className="style-preview-bar fuji-pro-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🌸 Fujifilm Pro 400H</span>
                      <span className="style-card-desc">Pastel editorial: Airy mint greens, cyan skies & luminous portrait tones.</span>
                    </div>
                    {autoStyle === 'fuji_pro' && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'eterna' || autoStyle === 'noir' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('eterna')}
                  >
                    <div className="style-preview-bar noir-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">🌑 Fuji Eterna 8543</span>
                      <span className="style-card-desc">Muted Film Noir: Cool slate shadows, restrained saturation & moody Nordic tones.</span>
                    </div>
                    {(autoStyle === 'eterna' || autoStyle === 'noir') && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'bleach_bypass' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('bleach_bypass')}
                  >
                    <div className="style-preview-bar bleach-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">⚔️ Bleach Bypass (Silver)</span>
                      <span className="style-card-desc">Gritty thriller: High micro-contrast, desaturated silver tones & metallic edge.</span>
                    </div>
                    {autoStyle === 'bleach_bypass' && <CheckCircle size={15} className="style-check-icon" />}
                  </div>

                  <div 
                    className={`style-preset-card ${autoStyle === 'commercial' || autoStyle === 'clean' ? 'active' : ''}`}
                    onClick={() => setAutoStyle('commercial')}
                  >
                    <div className="style-preview-bar clean-gradient" />
                    <div className="style-card-content">
                      <span className="style-card-title">💎 Clean Commercial 35mm</span>
                      <span className="style-card-desc">Crisp dynamic range, vivid memory colors & punchy true-to-life contrast.</span>
                    </div>
                    {(autoStyle === 'commercial' || autoStyle === 'clean') && <CheckCircle size={15} className="style-check-icon" />}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Target Media & Tuning Controls */}
          <motion.div className="tool-card target-panel" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
            <h3>2. Upload Your Footage</h3>
            <p className="panel-subtitle">
              Select cinema footage (.r3d, .braw, .ari, .mp4, .mov, ProRes) or RAW photo (.dng, .cr2, .nef, .arw).
            </p>

            <div 
              className={`dropzone target-dropzone ${targetFile ? 'has-file' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleTargetDrop}
              onClick={() => targetInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={targetInputRef} 
                style={{ display: 'none' }} 
                accept="video/*,image/*,.dng,.cr2,.arw,.nef,.r3d,.braw,.ari"
                onChange={handleTargetSelect}
              />
              {targetPreview ? (
                <div className="target-preview-container">
                  <img src={targetPreview} alt="Target Preview" className="target-preview-img" />
                  <div className="custom-preview-badge">
                    <CheckCircle size={14} /> Ready: {targetFile?.name}
                  </div>
                </div>
              ) : targetFile ? (
                <div className="dropzone-content">
                  <Film size={36} className="dropzone-icon" />
                  <h4>{targetFile.name}</h4>
                  <p>
                    {['.r3d', '.braw', '.ari'].some(ext => targetFile.name.toLowerCase().endsWith(ext)) 
                      ? 'Cinema RAW' 
                      : 'Video'} selected ({(targetFile.size / (1024*1024)).toFixed(1)} MB)
                  </p>
                  {targetFile.size > 95 * 1024 * 1024 && customApiUrl.includes('trycloudflare.com') && (
                    <p style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                      ⚠️ Note: Cloudflare free tunnel limits single-file uploads to 100 MB.
                    </p>
                  )}
                </div>
              ) : (
                <div className="dropzone-content">
                  <UploadCloud size={36} className="dropzone-icon" />
                  <h4>Drop Your Photo, Video, or Cinema RAW Here</h4>
                  <p>Supports Cinema RAW (R3D, BRAW, ARI, DNG), ProRes, MP4, MOV, JPEG</p>
                </div>
              )}
            </div>

            {targetFile && ['.r3d', '.braw', '.ari'].some(ext => targetFile.name.toLowerCase().endsWith(ext)) && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Cinema RAW Workflow:</strong> For BRAW & R3D, export a still frame (PNG/TIFF/JPG) or ProRes clip from DaVinci Resolve or Premiere, grade it here, and export your <strong>.CUBE 3D LUT</strong> to apply to your raw timeline.
              </div>
            )}

            {/* Pro Tuning Controls */}
            <div className="tuning-section">
              <h4>
                <Sliders size={16} />
                Fine-Tuning Controls
              </h4>

              <div className="control-slider-group">
                <div className="slider-header">
                  <label>Grading Strength / Intensity</label>
                  <span className="slider-val">{intensity}%</span>
                </div>
                <div className="quick-intensity-pills">
                  {[50, 75, 100, 125].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`quick-pill ${intensity === val ? 'active' : ''}`}
                      onClick={() => setIntensity(val)}
                    >
                      {val === 50 ? '50% Subtle' : val === 75 ? '75% Natural' : val === 100 ? '100% Cinema' : '125% Heavy'}
                    </button>
                  ))}
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="150" 
                  value={intensity} 
                  onChange={(e) => setIntensity(Number(e.target.value))}
                />
              </div>

              <div className="control-toggle-group">
                <div className="toggle-info">
                  <ShieldCheck size={18} className="toggle-icon" />
                  <div>
                    <span className="toggle-label">Skin-Tone Protection</span>
                    <p className="toggle-desc">Locks human facial tones from turning green or cyan.</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={protectSkin} 
                  onChange={(e) => setProtectSkin(e.target.checked)}
                  className="toggle-checkbox"
                />
              </div>

              <div className="control-toggle-group" style={{ marginTop: '0.6rem' }}>
                <div className="toggle-info">
                  <Film size={18} className="toggle-icon" />
                  <div>
                    <span className="toggle-label">Log / Flat Profile Normalization</span>
                    <p className="toggle-desc">Expands dynamic range for Apple Log, Sony S-Log, Canon C-Log & flat video.</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isLog} 
                  onChange={(e) => setIsLog(e.target.checked)}
                  className="toggle-checkbox"
                />
              </div>
            </div>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            {/* Grade Button */}
            <button 
              className="btn-primary btn-grade"
              onClick={handleGrade}
              disabled={
                isProcessing || 
                !targetFile || 
                (activeTab === 'templates' && !selectedRef) || 
                (activeTab === 'custom_ref' && !customRefFile)
              }
            >
              {isProcessing ? (
                <span className="btn-loading">
                  <Loader2 size={20} className="animate-spin" />
                  {processingStage}
                </span>
              ) : (
                <span className="btn-label">
                  <Sparkles size={20} />
                  {activeTab === 'auto_grade' ? '✨ Auto-Grade Footage' : '🎨 Apply Cinematic Grade'}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      ) : (
        /* Results View Studio with Interactive Before / After Split Slider */
        <motion.div className="tool-card results-studio" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="results-header">
            <div>
              <div className="cinegrade-badge" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle size={14} />
                <span>Color Grade Completed</span>
              </div>
              <h2>Studio Render & Comparison</h2>
            </div>

            <div className="view-mode-toggles">
              <button 
                className={`mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
              >
                <Columns size={16} /> Split Slider
              </button>
              <button 
                className={`mode-btn ${viewMode === 'side-by-side' ? 'active' : ''}`}
                onClick={() => setViewMode('side-by-side')}
              >
                Side-by-Side
              </button>
              <button 
                className={`mode-btn ${viewMode === 'graded' ? 'active' : ''}`}
                onClick={() => setViewMode('graded')}
              >
                Graded Only
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="viewer-viewport">
            {result.type === 'video' ? (
              <div className="video-player-box">
                <video 
                  src={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_media)}`} 
                  controls 
                  autoPlay 
                  loop 
                  className="full-media"
                />
              </div>
            ) : (
              viewMode === 'split' ? (
                /* Interactive Split Slider Viewer with Zero-Distortion Clip-Path */
                <div className="split-viewer-wrapper" ref={splitContainerRef}>
                  {/* Base Layer: After (Graded Result) */}
                  <img 
                    src={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_media)}`} 
                    alt="Graded Result" 
                    className="split-view-img"
                    draggable={false}
                  />
                  <div className="split-badge badge-after">AFTER (GRADED)</div>

                  {/* Top Layer: Before (Original Image Clipped) */}
                  <div 
                    className="split-clipped-overlay"
                    style={{
                      clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`
                    }}
                  >
                    <img 
                      src={targetPreview || (activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.original_media || result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.original_media || result.output_media)}`)} 
                      alt="Original Footage" 
                      className="split-view-img"
                      draggable={false}
                    />
                    <div className="split-badge badge-before">BEFORE</div>
                  </div>

                  {/* Divider Line & Handle */}
                  <div className="split-divider-line" style={{ left: `${splitPos}%` }}>
                    <div className="split-handle-btn">
                      <Columns size={16} />
                    </div>
                  </div>

                  {/* Transparent Interactive Slider overlay for instant touch & mouse tracking */}
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="split-range-input"
                    aria-label="Before and After slider"
                  />
                </div>
              ) : viewMode === 'side-by-side' ? (
                /* Side-by-Side View */
                <div className="side-by-side-container">
                  <div className="side-box">
                    <div className="side-tag">BEFORE</div>
                    <img 
                      src={targetPreview || (activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.original_media || result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.original_media || result.output_media)}`)} 
                      alt="Original" 
                    />
                  </div>
                  <div className="side-box">
                    <div className="side-tag graded">AFTER (GRADED)</div>
                    <img 
                      src={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_media)}`} 
                      alt="Graded" 
                    />
                  </div>
                </div>
              ) : (
                /* Graded Only View */
                <div className="graded-only-container">
                  <img 
                    src={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_media)}`} 
                    alt="Graded Masterpiece" 
                    className="full-media"
                  />
                </div>
              )
            )}
          </div>

          {/* Actions & Downloads */}
          <div className="results-footer">
            <button 
              className="btn-secondary" 
              onClick={() => setResult(null)}
            >
              <RefreshCw size={16} /> Grade Another
            </button>

            <div className="download-buttons">
              <a 
                href={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_media)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_media)}`} 
                download 
                className="btn-primary btn-download"
              >
                <Download size={18} /> Download Graded {result.type === 'video' ? 'Video' : 'Photo'}
              </a>
              <a 
                href={activeBaseUrl ? `${activeBaseUrl}/api/download?path=${encodeURIComponent(result.output_lut)}` : `/tunnel-api/api/download?path=${encodeURIComponent(result.output_lut)}`} 
                download 
                className="btn-primary btn-lut"
              >
                <Film size={18} /> Export .CUBE 3D LUT
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Educational Guide & Color Science Section */}
      <section className="tool-guide-section" style={{ marginTop: '3.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', lineHeight: '1.7' }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          The Complete Guide to Cinematic Color Grading & 3D LUT Workflows
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Color grading transforms raw footage into stylized visual storytelling. Whether aiming for the high-contrast drama of a Hollywood blockbuster, the nostalgic warmth of golden hour sunlight, or the timeless elegance of classic film noir, understanding color science ensures professional, artifact-free results.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              1. Perceptual Tone Mapping & Quantile Matching
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Unlike simple RGB curves that crush shadows and clip highlights, CineGrade AI calculates cumulative distribution functions (CDF) in perceptual CIELAB and Oklab color spaces. This aligns shadow density and highlight roll-off while preserving natural dynamic range.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              2. Vectorized Skin Tone Protection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Aggressive teal-and-orange grades frequently turn human faces muddy or unnaturally orange. Our automated skin locus algorithm detects melanin chromaticity vectors and isolates facial tones, ensuring healthy, radiant complexion while styling backgrounds.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              3. Industry-Standard .CUBE 3D LUTs
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Every grade generated by CineGrade can be exported as a 33x33x33 or 64x64x64 .CUBE 3D LUT. This allows filmmakers to import the exact look into DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, OBS Studio, and in-camera monitor displays.
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Frequently Asked Questions (FAQ)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              How do I use the exported .CUBE LUT in Premiere Pro or DaVinci Resolve?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              In <strong>Adobe Premiere Pro</strong>, open the Lumetri Color panel, navigate to the <em>Creative</em> tab, click the <em>Look</em> dropdown, and select <em>Browse...</em> to load your downloaded .CUBE file. In <strong>DaVinci Resolve</strong>, open Project Settings &gt; Color Management &gt; Open LUT Folder, copy the .CUBE file into the directory, click <em>Update Lists</em>, and apply it to any node in your color tree.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              What is the difference between Log footage and Standard Rec.709?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Log profiles (such as Sony S-Log3, Canon C-Log, or Blackmagic Film) record flat, desaturated images that preserve maximum dynamic range in highlights and shadows. Standard Rec.709 footage is ready for display with higher contrast. CineGrade works smoothly with both: apply our Auto-Grade presets directly to standard footage or use custom reference frames to match any log-graded cinema shot.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              What video file types and resolutions are supported?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              CineGrade supports MP4, MOV, WebM, and AVI formats at resolutions up to 4K (3840x2160) at 60fps. Transcoding is accelerated with hardware GPU encoding (NVENC / QuickSync) with automatic software fallback for universal codec compatibility.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Can I adjust grading intensity?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Yes. Use the Quick Intensity buttons (50% Subtle, 75% Natural, 100% Cinema, 125% Heavy) or fine-tune with the slider to blend the grade smoothly between your source footage and the target aesthetic.
            </p>
          </div>
        </div>
      </section>

      {/* Standard Rectangular Ad Banner for AdSense */}
      <div className="standard-ad-banner" style={{ marginTop: '48px' }}>
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
