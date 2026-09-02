import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Helmet } from 'react-helmet-async';
import AdBanner from './AdBanner';
import { 
  Upload, 
  Download, 
  Loader2, 
  RotateCcw, 
  Sliders, 
  Trash2, 
  AlertCircle,
  Pause,
  Play,
  X,
  Layers,
  Check,
  FileCheck,
  Monitor
} from 'lucide-react';
import './index.css';

const MAX_CANVAS_DIMENSION = 4096;
const MAX_FILE_SIZE_MB = 35;

const PRESET_COLORS = [
  { id: 'transparent', label: 'Transparent', value: 'transparent', isChecker: true },
  { id: 'white', label: 'White', value: '#ffffff', hex: '#ffffff' },
  { id: 'gray', label: 'Off-White', value: '#f4f4f5', hex: '#f4f4f5' },
  { id: 'slate', label: 'Slate', value: '#1e293b', hex: '#1e293b' },
  { id: 'black', label: 'Black', value: '#000000', hex: '#000000' }
];

function BgRemoverTool() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [modelStatus, setModelStatus] = useState('uninitialized'); // 'uninitialized' | 'loading' | 'ready' | 'error'
  const [activeDevice, setActiveDevice] = useState('webgpu');
  const [progress, setProgress] = useState({ text: 'Initializing engine...', progress: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  
  // Single image state
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const imagePreviewUrlRef = useRef(null);
  const [isProcessingSingle, setIsProcessingSingle] = useState(false);
  const [transparentImageUrl, setTransparentImageUrl] = useState(null);
  const [activeBg, setActiveBg] = useState('transparent');
  const [customBgColor, setCustomBgColor] = useState('#2563eb');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderRef = useRef(null);

  // Batch mode state
  const [batchQueue, setBatchQueue] = useState([]);
  const batchQueueRef = useRef([]);
  batchQueueRef.current = batchQueue;

  const [batchBg, setBatchBg] = useState('#ffffff');
  const [customBatchColor, setCustomBatchColor] = useState('#2563eb');
  const batchBgRef = useRef(batchBg);
  batchBgRef.current = batchBg;
  const customBatchColorRef = useRef(customBatchColor);
  customBatchColorRef.current = customBatchColor;

  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const isBatchRunningRef = useRef(false);
  isBatchRunningRef.current = isBatchRunning;

  const isProcessingItemRef = useRef(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const worker = useRef(null);

  // Auto clear toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Safe canvas compositing
  const applyMaskToOriginal = useCallback((originalUrl, mask, callback, bgColor = 'transparent') => {
    if (!mask || !mask.data) {
      setErrorMsg('Failed to process mask output.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = originalUrl;
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
          const ratio = Math.min(MAX_CANVAS_DIMENSION / width, MAX_CANVAS_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = mask.width;
        maskCanvas.height = mask.height;
        const maskCtx = maskCanvas.getContext('2d');
        const maskImgData = maskCtx.createImageData(mask.width, mask.height);

        const mData = mask.data;
        const mChannels = mask.channels || 1;
        const dest = maskImgData.data;

        if (mChannels === 1) {
          for (let i = 0, j = 0; i < mData.length; i++, j += 4) {
            const val = mData[i];
            dest[j] = val;
            dest[j + 1] = val;
            dest[j + 2] = val;
            dest[j + 3] = val;
          }
        } else if (mChannels === 4) {
          dest.set(mData);
        } else {
          for (let i = 0, j = 0; i < mData.length; i += 3, j += 4) {
            dest[j] = mData[i];
            dest[j + 1] = mData[i + 1];
            dest[j + 2] = mData[i + 2];
            dest[j + 3] = mData[i];
          }
        }
        maskCtx.putImageData(maskImgData, 0, 0);

        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = width;
        cutoutCanvas.height = height;
        const cutoutCtx = cutoutCanvas.getContext('2d');

        cutoutCtx.drawImage(img, 0, 0, width, height);
        cutoutCtx.globalCompositeOperation = 'destination-in';
        cutoutCtx.drawImage(maskCanvas, 0, 0, width, height);

        if (bgColor === 'transparent') {
          callback(cutoutCanvas.toDataURL('image/png'), width, height);
        } else {
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = width;
          finalCanvas.height = height;
          const finalCtx = finalCanvas.getContext('2d');

          finalCtx.fillStyle = bgColor;
          finalCtx.fillRect(0, 0, width, height);
          finalCtx.drawImage(cutoutCanvas, 0, 0);

          callback(finalCanvas.toDataURL('image/png'), width, height);
        }
      } catch (err) {
        console.error('Compositing error:', err);
        setErrorMsg('Failed to render final output.');
      }
    };
    img.onerror = () => {
      setErrorMsg('Failed to load source image.');
    };
  }, []);

  // Process next item in queue
  const processNextBatchItem = useCallback(() => {
    if (!isBatchRunningRef.current || !worker.current) return;
    if (isProcessingItemRef.current) return;

    const currentQueue = batchQueueRef.current;
    const nextItem = currentQueue.find((i) => i.status === 'queued');

    if (!nextItem) {
      setIsBatchRunning(false);
      isBatchRunningRef.current = false;
      isProcessingItemRef.current = false;
      setToastMsg('All batch items processed.');
      return;
    }

    isProcessingItemRef.current = true;
    setBatchQueue((prev) => 
      prev.map((i) => i.id === nextItem.id ? { ...i, status: 'processing' } : i)
    );

    worker.current.postMessage({ type: 'segment', image: nextItem.url, id: nextItem.id });
  }, []);

  // Worker setup
  const initWorker = useCallback(() => {
    if (worker.current) {
      worker.current.terminate();
    }
    
    setModelStatus('loading');
    setProgress({ text: 'Loading AI model...', progress: 10 });
    setErrorMsg('');

    try {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

      worker.current.addEventListener('message', (e) => {
        const { status, progress: progData, mask, device, id, error } = e.data;

        switch (status) {
          case 'init_start':
            setModelStatus('loading');
            break;
          case 'progress':
            if (progData) {
              if (progData.status === 'download' || progData.status === 'progress') {
                const percent = Math.min(100, Math.round(progData.progress || 0));
                setProgress({
                  text: 'Downloading model weights...',
                  progress: percent
                });
              } else if (progData.status === 'done') {
                setProgress({
                  text: 'Compiling shaders...',
                  progress: 98
                });
              } else if (progData.status === 'ready') {
                setProgress({ text: 'Ready', progress: 100 });
              }
            }
            break;
          case 'init_complete':
            setModelStatus('ready');
            if (device) setActiveDevice(device);
            break;
          case 'segment_complete':
            if (id) {
              const item = batchQueueRef.current.find((i) => i.id === id);
              if (item) {
                const color = batchBgRef.current === 'custom' ? customBatchColorRef.current : batchBgRef.current;
                applyMaskToOriginal(item.url, mask, (resultUrl) => {
                  setBatchQueue((prev) => 
                    prev.map((i) => i.id === id ? { ...i, status: 'done', resultUrl } : i)
                  );
                  isProcessingItemRef.current = false;
                  setTimeout(() => {
                    processNextBatchItem();
                  }, 10);
                }, color);
              } else {
                isProcessingItemRef.current = false;
                processNextBatchItem();
              }
            } else {
              setIsProcessingSingle(false);
              if (mask && imagePreviewUrlRef.current) {
                applyMaskToOriginal(imagePreviewUrlRef.current, mask, (url, width, height) => {
                  setTransparentImageUrl(url);
                  setImageDims({ width, height });
                  setToastMsg('Background removed.');
                });
              }
            }
            break;
          case 'error':
            if (id) {
              setBatchQueue((prev) => 
                prev.map((i) => i.id === id ? { ...i, status: 'error', error } : i)
              );
              isProcessingItemRef.current = false;
              setTimeout(() => {
                processNextBatchItem();
              }, 10);
            } else {
              setIsProcessingSingle(false);
              setModelStatus('error');
              setErrorMsg(error || 'Processing error occurred.');
            }
            break;
          default:
            break;
        }
      });

      worker.current.onerror = (err) => {
        console.error('Worker error:', err);
        setIsProcessingSingle(false);
        setIsBatchRunning(false);
        isProcessingItemRef.current = false;
        setModelStatus('error');
        setErrorMsg('Memory error encountered. Click retry to reload.');
      };

      worker.current.postMessage({ type: 'init' });
    } catch (e) {
      console.error('Worker init failed:', e);
      setModelStatus('error');
      setErrorMsg('Web Workers unavailable in this environment.');
    }
  }, [applyMaskToOriginal, processNextBatchItem]);

  useEffect(() => {
    initWorker();
    return () => {
      if (worker.current) worker.current.terminate();
      if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
      batchQueueRef.current.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [initWorker]);

  // Dropzone single
  const onSingleDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      setErrorMsg(`Please select a valid image (JPG, PNG, WebP) under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setErrorMsg('');
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }

      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      imagePreviewUrlRef.current = url;
      setTransparentImageUrl(null);
      setSliderPos(50);

      // Measure dimensions
      const temp = new Image();
      temp.src = url;
      temp.onload = () => {
        setImageDims({ width: temp.naturalWidth, height: temp.naturalHeight });
      };

      if (modelStatus === 'ready' && worker.current) {
        setIsProcessingSingle(true);
        worker.current.postMessage({ type: 'segment', image: url });
      }
    }
  }, [modelStatus]);

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } = useDropzone({
    onDrop: onSingleDrop,
    accept: { 'image/*': [] },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    maxFiles: 1
  });

  // Dropzone batch
  const onBatchDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      setErrorMsg(`${rejectedFiles.length} file(s) skipped (exceeded ${MAX_FILE_SIZE_MB}MB limit).`);
    } else {
      setErrorMsg('');
    }

    if (acceptedFiles.length === 0) return;

    const newItems = acceptedFiles.map((file) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1),
      status: 'queued',
      resultUrl: null,
      error: null
    }));

    setBatchQueue((prev) => [...prev, ...newItems]);
    setToastMsg(`Added ${newItems.length} images to queue.`);
  }, []);

  const { getRootProps: getBatchRootProps, getInputProps: getBatchInputProps, isDragActive: isBatchDragActive } = useDropzone({
    onDrop: onBatchDrop,
    accept: { 'image/*': [] },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024
  });

  const startBatchProcessing = () => {
    if (batchQueue.length === 0 || isBatchRunning) return;
    setIsBatchRunning(true);
    isBatchRunningRef.current = true;
    isProcessingItemRef.current = false;
    setTimeout(() => {
      processNextBatchItem();
    }, 50);
  };

  const pauseBatchProcessing = () => {
    setIsBatchRunning(false);
    isBatchRunningRef.current = false;
    setToastMsg('Batch paused.');
  };

  const clearBatchQueue = () => {
    setIsBatchRunning(false);
    isBatchRunningRef.current = false;
    isProcessingItemRef.current = false;
    batchQueue.forEach((item) => URL.revokeObjectURL(item.url));
    setBatchQueue([]);
    setToastMsg('Queue cleared.');
  };

  const removeBatchItem = (id) => {
    setBatchQueue((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  // ZIP download
  const downloadBatchZip = async () => {
    const doneItems = batchQueue.filter((item) => item.status === 'done' && item.resultUrl);
    if (doneItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);
    try {
      const zip = new JSZip();

      for (let i = 0; i < doneItems.length; i++) {
        const item = doneItems[i];
        const base64Data = item.resultUrl.split(',')[1];
        const cleanName = item.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") + "_cutout.png";
        zip.file(cleanName, base64Data, { base64: true });
      }

      const content = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => setZipProgress(Math.round(meta.percent))
      );

      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `cutouts-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setToastMsg('ZIP archive downloaded.');
    } catch (e) {
      console.error('ZIP export error:', e);
      setErrorMsg('Failed to bundle ZIP.');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handleSingleDownload = () => {
    if (!transparentImageUrl) return;

    if (activeBg === 'transparent') {
      const a = document.createElement('a');
      a.href = transparentImageUrl;
      a.download = `cutout-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMsg('PNG downloaded.');
    } else {
      const img = new Image();
      img.src = transparentImageUrl;
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.fillStyle = activeBg === 'custom' ? customBgColor : activeBg;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);

        const a = document.createElement('a');
        a.href = c.toDataURL('image/png');
        a.download = `cutout-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setToastMsg('Image downloaded with custom background.');
      };
    }
  };

  const handleDownloadSingleBatchItem = (item) => {
    if (!item.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = item.name.replace(/\.[^/.]+$/, "") + "_cutout.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalBatchCount = batchQueue.length;
  const completedBatchCount = batchQueue.filter((i) => i.status === 'done').length;
  const batchPercent = totalBatchCount > 0 ? Math.round((completedBatchCount / totalBatchCount) * 100) : 0;

  return (
    <div className="tool-container">
      <Helmet>
        <title>AI Background Remover — Free, Instant & 100% Private | LittleTools.me</title>
        <meta name="description" content="Remove backgrounds from images instantly in your browser using state-of-the-art AI. Supports single and bulk batch processing with 100% client-side privacy. Zero server uploads." />
        <link rel="canonical" href="https://littletools.me/bg-remover" />
        
        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://littletools.me/bg-remover" />
        <meta property="og:title" content="AI Background Remover — Free & 100% Private" />
        <meta property="og:description" content="Erase backgrounds from photos instantly with AI in your browser. Zero uploads, 100% privacy." />
        <meta property="og:site_name" content="LittleTools" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Background Remover — Free & 100% Private" />
        <meta name="twitter:description" content="Erase backgrounds from photos instantly with AI in your browser. Zero uploads, 100% privacy." />
        
        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Background Remover",
            "url": "https://littletools.me/bg-remover",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires WebAssembly or WebGPU",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Remove backgrounds from images instantly with in-browser AI. Supports single and batch modes with zero server uploads."
          })}
        </script>
      </Helmet>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast">
          <FileCheck size={14} className="toast-icon" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="workspace">
            {/* Loading Progress Strip */}
            {modelStatus === 'loading' && (
              <div className="progress-strip">
                <div className="progress-strip-header">
                  <span>{progress.text}</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <div className="progress-strip-bar">
                  <div 
                    className="progress-strip-fill" 
                    style={{ width: `${Math.max(5, progress.progress)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {modelStatus === 'error' && (
              <div className="error-card">
                <AlertCircle size={16} />
                <div className="error-text">
                  <span>{errorMsg || 'Failed to initialize engine.'}</span>
                  <button className="error-action" onClick={initWorker}>
                    <RotateCcw size={12} /> Retry
                  </button>
                </div>
              </div>
            )}

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem'}}>
              <nav className="mode-tabs">
                <button 
                  className={`tab ${activeTab === 'single' ? 'active' : ''}`}
                  onClick={() => setActiveTab('single')}
                >
                  Single Image
                </button>
                <button 
                  className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
                  onClick={() => setActiveTab('batch')}
                >
                  Batch Process
                  {batchQueue.length > 0 && <span className="badge">{batchQueue.length}</span>}
                </button>
              </nav>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Monitor size={14} />
                <span>WebGPU AI engine runs locally. Mobile devices may not be supported.</span>
              </div>
            </div>

            {/* SINGLE MODE */}
        {activeTab === 'single' && (
          <div className="mode-view">
            {!imagePreviewUrl && (
              <div 
                {...getSingleRootProps()} 
                className={`drop-area ${isSingleDragActive ? 'drag-over' : ''} ${modelStatus !== 'ready' ? 'locked' : ''}`}
              >
                <input {...getSingleInputProps()} />
                <div className="drop-icon-box">
                  <Upload size={20} />
                </div>
                <div className="drop-text-group">
                  <span className="drop-main-text">Drop an image here, or click to browse</span>
                  <span className="drop-sub-text">PNG, JPG, WebP up to 35MB</span>
                </div>
              </div>
            )}

            {isProcessingSingle && (
              <div className="processing-canvas">
                <Loader2 size={24} className="spin" />
                <span>Removing background...</span>
              </div>
            )}

            {!isProcessingSingle && transparentImageUrl && (
              <div className="single-editor">
                {/* Control Ribbon */}
                <div className="ribbon">
                  <div className="ribbon-left">
                    <span className="ribbon-label">Backdrop:</span>
                    <div className="swatch-group">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.id}
                          className={`swatch-btn ${activeBg === preset.value ? 'selected' : ''} ${preset.isChecker ? 'checker' : ''}`}
                          style={{ backgroundColor: preset.isChecker ? undefined : preset.hex }}
                          onClick={() => setActiveBg(preset.value)}
                          title={preset.label}
                        >
                          {activeBg === preset.value && <Check size={12} className={preset.value === '#ffffff' || preset.value === '#f4f4f5' ? 'check-dark' : 'check-light'} />}
                        </button>
                      ))}

                      {/* Custom color input */}
                      <div className="custom-color-swatch" title="Custom color">
                        <input
                          type="color"
                          value={customBgColor}
                          onChange={(e) => {
                            setCustomBgColor(e.target.value);
                            setActiveBg('custom');
                          }}
                          className="native-color"
                        />
                        <div 
                          className={`color-preview ${activeBg === 'custom' ? 'selected' : ''}`} 
                          style={{ backgroundColor: customBgColor }}
                        >
                          {activeBg === 'custom' && <Check size={12} className="check-light" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ribbon-right">
                    {imageDims.width > 0 && (
                      <span className="dim-tag">{imageDims.width} × {imageDims.height}</span>
                    )}
                    <button className="btn-ghost" onClick={() => setImagePreviewUrl(null)}>
                      <RotateCcw size={14} />
                      Reset
                    </button>
                    <button className="btn-solid" onClick={handleSingleDownload}>
                      <Download size={14} />
                      Download PNG
                    </button>
                  </div>
                </div>

                {/* Comparison Canvas Frame */}
                <div 
                  className={`canvas-viewport ${activeBg === 'transparent' ? 'checker' : ''}`}
                  style={{ 
                    backgroundColor: activeBg === 'transparent' ? undefined : (activeBg === 'custom' ? customBgColor : activeBg) 
                  }}
                  ref={sliderRef}
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                  onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                  onClick={(e) => handleSliderMove(e.clientX)}
                  onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                >
                  <img 
                    src={transparentImageUrl} 
                    alt="Cutout Result" 
                    className="canvas-image"
                    draggable={false}
                  />

                  <div 
                    className="canvas-overlay"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                  >
                    <img 
                      src={imagePreviewUrl} 
                      alt="Original Image" 
                      className="canvas-image"
                      draggable={false}
                    />
                  </div>

                  {/* Minimalist Slider Divider */}
                  <div className="slider-track" style={{ left: `${sliderPos}%` }}>
                    <div className="slider-thumb">
                      <Sliders size={11} />
                    </div>
                  </div>

                  <span className="edge-tag tag-left" style={{ opacity: sliderPos > 25 ? 1 : 0 }}>Original</span>
                  <span className="edge-tag tag-right" style={{ opacity: sliderPos < 75 ? 1 : 0 }}>Cutout</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BATCH MODE */}
        {activeTab === 'batch' && (
          <div className="mode-view">
            {/* Batch Ribbon Controls */}
            <div className="ribbon">
              <div className="ribbon-left">
                <span className="ribbon-label">Output Backdrop:</span>
                <div className="swatch-group">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.id}
                      className={`swatch-btn ${batchBg === preset.value ? 'selected' : ''} ${preset.isChecker ? 'checker' : ''}`}
                      style={{ backgroundColor: preset.isChecker ? undefined : preset.hex }}
                      onClick={() => setBatchBg(preset.value)}
                      title={preset.label}
                    >
                      {batchBg === preset.value && <Check size={12} className={preset.value === '#ffffff' || preset.value === '#f4f4f5' ? 'check-dark' : 'check-light'} />}
                    </button>
                  ))}

                  <div className="custom-color-swatch" title="Custom color">
                    <input
                      type="color"
                      value={customBatchColor}
                      onChange={(e) => {
                        setCustomBatchColor(e.target.value);
                        setBatchBg('custom');
                      }}
                      className="native-color"
                    />
                    <div 
                      className={`color-preview ${batchBg === 'custom' ? 'selected' : ''}`} 
                      style={{ backgroundColor: customBatchColor }}
                    >
                      {batchBg === 'custom' && <Check size={12} className="check-light" />}
                    </div>
                  </div>
                </div>
              </div>

              {batchQueue.length > 0 && (
                <div className="ribbon-right">
                  <button className="btn-ghost danger-ghost" onClick={clearBatchQueue} disabled={isBatchRunning}>
                    <Trash2 size={13} />
                    Clear Queue
                  </button>
                </div>
              )}
            </div>

            {/* Batch Multi-Drop Area */}
            <div 
              {...getBatchRootProps()} 
              className={`drop-area batch-drop-area ${isBatchDragActive ? 'drag-over' : ''}`}
            >
              <input {...getBatchInputProps()} />
              <div className="drop-icon-box">
                <Upload size={20} />
              </div>
              <div className="drop-text-group">
                <span className="drop-main-text">Drop multiple images here to batch process</span>
                <span className="drop-sub-text">Sequential background isolation processed entirely in-browser</span>
              </div>
            </div>

            {/* Queue Table / Grid View */}
            {batchQueue.length > 0 && (
              <div className="batch-panel">
                <div className="batch-summary-bar">
                  <div className="summary-stats">
                    <span className="stat-highlight">{completedBatchCount} / {totalBatchCount}</span>
                    <span className="stat-sub">completed</span>
                    {isBatchRunning && (
                      <span className="live-status-pill">
                        <span className="pulse-dot"></span> Processing
                      </span>
                    )}
                  </div>

                  <div className="batch-action-buttons">
                    {isBatchRunning ? (
                      <button className="btn-ghost" onClick={pauseBatchProcessing}>
                        <Pause size={13} />
                        Pause
                      </button>
                    ) : (
                      completedBatchCount < totalBatchCount && (
                        <button 
                          className="btn-solid" 
                          onClick={startBatchProcessing}
                          disabled={modelStatus !== 'ready'}
                        >
                          <Play size={13} />
                          {completedBatchCount > 0 ? 'Resume' : 'Start Process'}
                        </button>
                      )
                    )}

                    {completedBatchCount > 0 && (
                      <button 
                        className="btn-solid btn-accent" 
                        onClick={downloadBatchZip}
                        disabled={isZipping}
                      >
                        {isZipping ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                        {isZipping ? `Archiving (${zipProgress}%)` : `Download All (${completedBatchCount})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-strip-bar">
                  <div 
                    className="progress-strip-fill" 
                    style={{ width: `${batchPercent}%` }}
                  ></div>
                </div>

                {/* Modern Grid Cards */}
                <div className="card-grid">
                  {batchQueue.map((item) => (
                    <div key={item.id} className="grid-card">
                      <div className="card-media">
                        <img 
                          src={item.resultUrl || item.url} 
                          alt={item.name} 
                          className={`card-img ${item.resultUrl && batchBg === 'transparent' ? 'checker' : ''}`}
                          style={{
                            backgroundColor: item.resultUrl && batchBg !== 'transparent' 
                              ? (batchBg === 'custom' ? customBatchColor : batchBg) 
                              : undefined
                          }}
                        />
                        {item.status === 'processing' && (
                          <div className="card-curtain">
                            <Loader2 size={18} className="spin" />
                          </div>
                        )}
                        {!isBatchRunning && (
                          <button 
                            className="card-dismiss" 
                            onClick={() => removeBatchItem(item.id)}
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        )}
                        {item.status === 'done' && (
                          <button 
                            className="card-quick-download" 
                            onClick={() => handleDownloadSingleBatchItem(item)}
                            title="Download PNG"
                          >
                            <Download size={12} />
                          </button>
                        )}
                      </div>
                      <div className="card-details">
                        <span className="card-title" title={item.name}>{item.name}</span>
                        <div className="card-sub-info">
                          <span className="card-size">{item.size} MB</span>
                          <span className={`pill ${item.status}`}>
                            {item.status === 'queued' && 'Queued'}
                            {item.status === 'processing' && 'Working'}
                            {item.status === 'done' && 'Done'}
                            {item.status === 'error' && 'Error'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Official AdSense Footer Unit */}
      <div className="standard-ad-banner" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <span className="ad-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Advertisement</span>
        <AdBanner adSlot="8979592305" style={{ display: 'block', width: '100%', maxWidth: '970px', height: '250px', margin: '0 auto' }} />
      </div>
    </div>
  );
}

export default BgRemoverTool;
