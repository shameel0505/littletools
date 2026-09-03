import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileText, 
  UploadCloud, 
  Copy, 
  Download, 
  BrainCircuit, 
  Loader2, 
  RefreshCw, 
  Layers, 
  FileArchive, 
  Check, 
  FolderArchive,
  CheckCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { encode } from 'gpt-tokenizer';
import JSZip from 'jszip';
import { parseDocumentToMarkdown } from './lib/docParser';
import AdBanner from './AdBanner';
import './docToMd.css';

export default function DocToMdTool() {
  const [outputMode, setOutputMode] = useState('merged'); // 'merged' | 'separate'
  const [processedFiles, setProcessedFiles] = useState([]); // [{ id, name, md, tokens, tokensSaved }]
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [markdown, setMarkdown] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchStatus, setBatchStatus] = useState({ current: 0, total: 0, currentFileName: '' });
  const [progress, setProgress] = useState({ text: '', percent: 0 });
  
  const [tokenCount, setTokenCount] = useState(0);
  const [tokensSaved, setTokensSaved] = useState(0);
  const [history, setHistory] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('docMdHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Recalculate tokens whenever markdown changes
  useEffect(() => {
    if (markdown) {
      try {
        const tokens = encode(markdown).length;
        setTokenCount(tokens);
        setTokensSaved(Math.round(tokens * 0.65));
      } catch (e) {
        console.error("Tokenizer error:", e);
      }
    } else {
      setTokenCount(0);
      setTokensSaved(0);
    }
  }, [markdown]);

  // Synchronize markdown display when switching output modes or selected file
  useEffect(() => {
    if (processedFiles.length === 0) return;

    if (outputMode === 'merged') {
      const merged = processedFiles.map(f => `# Document: ${f.name}\n\n${f.md}`).join('\n\n---\n\n');
      setMarkdown(merged);
    } else {
      const current = processedFiles[selectedFileIndex] || processedFiles[0];
      if (current) {
        setMarkdown(current.md);
      }
    }
  }, [outputMode, selectedFileIndex, processedFiles]);

  const saveToHistory = (name, md) => {
    const newEntry = { name, md, date: new Date().toISOString() };
    const newHistory = [newEntry, ...history.filter(h => h.name !== name)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('docMdHistory', JSON.stringify(newHistory));
  };

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    // Combine accepted files and any files rejected purely by OS MIME discrepancy
    const rejectedFiles = fileRejections ? fileRejections.map(r => r.file) : [];
    const allCandidateFiles = [...(acceptedFiles || []), ...rejectedFiles];
    
    // Filter by allowed extensions (.pdf, .docx, .xlsx, .xls, .csv, .txt, .md, .json, .png, .jpg, .jpeg, .webp)
    const validExtensions = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'md', 'json', 'rtf', 'png', 'jpg', 'jpeg', 'webp'];
    const filesToProcess = allCandidateFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    });

    if (!filesToProcess || filesToProcess.length === 0) {
      if (allCandidateFiles.length > 0) {
        showToast('Please upload supported document formats (PDF, Word, Excel, CSV, Text, Images).');
      }
      return;
    }

    setIsProcessing(true);
    setBatchStatus({ current: 1, total: filesToProcess.length, currentFileName: filesToProcess[0].name });
    setProgress({ text: 'Preparing documents...', percent: 5 });

    const newResults = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setBatchStatus({ current: i + 1, total: filesToProcess.length, currentFileName: file.name });
      setProgress({ text: `Parsing file ${i + 1} of ${filesToProcess.length}: ${file.name}...`, percent: 10 });

      try {
        const parsedMd = await parseDocumentToMarkdown(file, (p) => {
          setProgress(p);
        });

        let fileTokens = 0;
        try {
          fileTokens = encode(parsedMd).length;
        } catch (e) {
          fileTokens = Math.round(parsedMd.length / 4);
        }

        newResults.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          md: parsedMd,
          tokens: fileTokens,
          tokensSaved: Math.round(fileTokens * 0.65)
        });

        saveToHistory(file.name, parsedMd);
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
        newResults.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          md: `> **Error parsing ${file.name}:** ${err.message}`,
          tokens: 0,
          tokensSaved: 0
        });
      }
    }

    setProcessedFiles(newResults);
    setSelectedFileIndex(0);
    setIsProcessing(false);
    showToast(`Successfully processed ${filesToProcess.length} document${filesToProcess.length > 1 ? 's' : ''}!`);
  }, [history]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    showToast('Copied Markdown to clipboard!');
  };

  const handleDownloadSingle = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const currentName = outputMode === 'merged' 
      ? `combined-documents-${processedFiles.length}.md` 
      : (processedFiles[selectedFileIndex]?.name.replace(/\.[^/.]+$/, "") + ".md" || 'document.md');
    a.download = currentName;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded .md file');
  };

  const handleDownloadZip = async () => {
    if (processedFiles.length === 0) return;
    showToast('Generating ZIP archive...');
    const zip = new JSZip();

    processedFiles.forEach((item) => {
      const safeName = item.name.replace(/\.[^/.]+$/, "") + ".md";
      zip.file(safeName, item.md);
    });

    // Also include the combined file inside the zip for convenience
    const mergedContent = processedFiles.map(f => `# Document: ${f.name}\n\n${f.md}`).join('\n\n---\n\n');
    zip.file("ALL_COMBINED.md", mergedContent);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LittleTools-Markdown-Bundle-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ZIP bundle downloaded!');
  };

  const loadFromHistory = (item) => {
    setProcessedFiles([{ id: 'hist', name: item.name, md: item.md, tokens: 0, tokensSaved: 0 }]);
    setSelectedFileIndex(0);
    setOutputMode('separate');
    setMarkdown(item.md);
    showToast(`Loaded ${item.name} from history.`);
  };

  return (
    <div className="doc-to-md-page">
      <Helmet>
        <title>Doc to Markdown (Batch & AI Context Optimizer) | LittleTools.me</title>
        <meta name="description" content="Convert multiple PDFs, Word Docs, Spreadsheets, and Scanned Images into clean Markdown formatted for ChatGPT and LLMs. Choose single combined output or separate ZIP." />
        <link rel="canonical" href="https://littletools.me/doc-to-md" />
      </Helmet>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          zIndex: 9999
        }}>
          <CheckCircle size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <header className="doc-header">
        <h1>AI Context Optimizer</h1>
        <p>Convert single or multiple PDFs, Docs, and Images into clean Markdown for Large Language Models.</p>
      </header>

      <div className="doc-workspace">
        {/* Sidebar */}
        <aside className="doc-sidebar">
          <div 
            {...getRootProps()} 
            className={`dropzone-area ${isDragActive ? 'active' : ''}`}
          >
            {isProcessing && (
              <div className="processing-overlay">
                <div className="processing-card">
                  <div className="pulse-ring">
                    <div className="core-spinner"></div>
                  </div>
                  <h3 className="processing-title">Processing Document Batch</h3>
                  <p className="processing-status" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    File {batchStatus.current} of {batchStatus.total}
                  </p>
                  <p className="processing-status" style={{ fontSize: '0.8rem', marginTop: '-0.75rem' }}>
                    {batchStatus.currentFileName}
                  </p>
                  <div className="ai-progress-bar">
                    <div className="ai-progress-fill" style={{ width: `${progress.percent}%` }}></div>
                  </div>
                  <div className="processing-steps">
                    <div className={`step ${progress.percent > 10 ? 'done' : 'active'}`}>1. Reading File Structure</div>
                    <div className={`step ${progress.percent > 40 ? 'done' : progress.percent > 10 ? 'active' : ''}`}>2. Parsing Tables & Text</div>
                    <div className={`step ${progress.percent > 80 ? 'done' : progress.percent > 40 ? 'active' : ''}`}>3. AI OCR & Formatting</div>
                  </div>
                </div>
              </div>
            )}
            {!isProcessing && (
              <>
                <input {...getInputProps()} />
                <div className="dropzone-icon">
                  <UploadCloud size={40} />
                </div>
                <h3 className="dropzone-title">Drop Documents Here</h3>
                <p className="dropzone-text">Drop 1 or multiple files (PDF, Word, Excel, Images)</p>
                <div className="dropzone-subtext">Supports bulk uploads • 100% in-browser private</div>
              </>
            )}
          </div>

          {/* Token & Value Estimator */}
          <div className="token-estimator">
            <div className="estimator-header">
              <BrainCircuit size={18} /> OpenAI Token Estimator
            </div>
            <div className="stat-row">
              <span>Tokens:</span>
              <span className="stat-value">{tokenCount.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Words (approx):</span>
              <span className="stat-value">{Math.round(tokenCount * 0.75).toLocaleString()}</span>
            </div>
            <div className="stat-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span style={{color: '#10b981', fontWeight: 'bold'}}>Context Saved:</span>
              <span className="stat-value" style={{color: '#10b981'}}>~{tokensSaved.toLocaleString()} tokens</span>
            </div>
            <div className="stat-row" style={{ marginTop: '0.2rem' }}>
              <span style={{color: '#10b981', fontSize: '0.8rem'}}>Est. Savings (GPT-4):</span>
              <span className="stat-value" style={{color: '#10b981', fontSize: '0.8rem'}}>${((tokensSaved / 1000000) * 5.00).toFixed(4)}</span>
            </div>

            <div className="dropzone-subtext" style={{ marginTop: '1rem', textAlign: 'center', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '4px' }}>
              <strong>Engine:</strong> Tesseract.js (WASM) + PDF.js <br/>
              <strong>Privacy:</strong> 100% Local / Zero Uploads
            </div>
          </div>

          {/* Conversion History */}
          {history.length > 0 && (
            <div className="local-history">
              <div className="history-header">Recent Conversions</div>
              <div className="history-list">
                {history.map((item, i) => (
                  <div key={i} className="history-item" onClick={() => loadFromHistory(item)}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <FileText size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                      {item.name}
                    </span>
                    <RefreshCw size={12} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Editor */}
        <main className="doc-main">
          {/* Multi-File Output Mode Selector */}
          {processedFiles.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#3b82f6" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Output Mode ({processedFiles.length} files processed):
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setOutputMode('merged')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (outputMode === 'merged' ? '#3b82f6' : 'var(--border)'),
                    background: outputMode === 'merged' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: outputMode === 'merged' ? '#3b82f6' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FileText size={14} /> Single Combined .md
                </button>

                <button 
                  onClick={() => setOutputMode('separate')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (outputMode === 'separate' ? '#3b82f6' : 'var(--border)'),
                    background: outputMode === 'separate' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: outputMode === 'separate' ? '#3b82f6' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FolderArchive size={14} /> Separate Files (ZIP)
                </button>
              </div>
            </div>
          )}

          {/* Separate File Tabs (When in Separate Mode) */}
          {processedFiles.length > 1 && outputMode === 'separate' && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border)'
            }}>
              {processedFiles.map((file, idx) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileIndex(idx)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid ' + (selectedFileIndex === idx ? '#3b82f6' : 'var(--border)'),
                    background: selectedFileIndex === idx ? 'var(--bg-surface)' : 'transparent',
                    color: selectedFileIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: selectedFileIndex === idx ? 600 : 400,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FileText size={12} color={selectedFileIndex === idx ? '#3b82f6' : 'inherit'} />
                  {file.name}
                </button>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="markdown-actions">
            <div>
              <strong>
                {processedFiles.length > 1
                  ? (outputMode === 'merged' ? `Merged Output (${processedFiles.length} files combined)` : processedFiles[selectedFileIndex]?.name)
                  : (processedFiles[0]?.name || 'Drop documents to begin')}
              </strong>
            </div>

            <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
              {processedFiles.length > 1 && (
                <button 
                  className="btn-solid" 
                  onClick={handleDownloadZip}
                  style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
                  title="Download all converted files as a .zip archive"
                >
                  <FileArchive size={16} /> Download All (.ZIP)
                </button>
              )}

              <button className="btn-ghost" onClick={handleCopy} disabled={!markdown}>
                <Copy size={16} /> Copy MD
              </button>

              <button className="btn-solid" onClick={handleDownloadSingle} disabled={!markdown}>
                <Download size={16} /> Download .md
              </button>
            </div>
          </div>

          <textarea
            className="markdown-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Your generated Markdown will appear here...&#10;&#10;Supports batch processing. Drop multiple files to generate a single merged document or download them all as a ZIP archive."
            style={{ minHeight: '520px' }}
          />
        </main>
      </div>
      
      {/* SEO Content Section */}
      <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <h2>Why convert documents to Markdown for AI?</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
          Large Language Models (LLMs) like ChatGPT, Claude, and Gemini process context highly efficiently when it is structured semantically. 
          Standard PDFs and Word Documents contain enormous amounts of hidden formatting data, layout metadata, and unreadable binary code that wastes your token limits and confuses the AI.
          By converting your Scanned PDFs, Excel spreadsheets, and DOCX files into clean, raw Markdown tables and headers, you minimize token usage and maximize the AI's comprehension of your data.
        </p>
      </section>

      {/* Official AdSense Footer Unit */}
      <div className="standard-ad-banner" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <span className="ad-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Advertisement</span>
        <AdBanner adSlot="8979592305" style={{ display: 'block', width: '100%', maxWidth: '970px', height: '250px', margin: '0 auto' }} />
      </div>
    </div>
  );
}
