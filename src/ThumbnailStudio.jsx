import React, { useState, useRef } from 'react';
import './ThumbnailStudio.css';
import { 
  Upload, 
  Smartphone, 
  Monitor, 
  Search, 
  Sun, 
  Moon, 
  Check, 
  Layers
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AdBanner from './AdBanner';

const MOCK_VIDEOS = [
  { id: 1, title: 'I Built a Secret Underground Bunker in 24 Hours', channel: 'Beast Squad', avatar: 'https://picsum.photos/seed/avatar1/100/100', thumbnail: 'https://picsum.photos/seed/bunker/640/360', views: '4.8M views', time: '8 hours ago', duration: '18:42' },
  { id: 2, title: 'Why Everyone Is Switching to This $400 Camera in 2026', channel: 'Tech Focus', avatar: 'https://picsum.photos/seed/avatar2/100/100', thumbnail: 'https://picsum.photos/seed/camera/640/360', views: '890K views', time: '1 day ago', duration: '12:15' },
  { id: 'ad1', isAd: true, title: 'Get 40,000+ Royalty-Free Tracks for Creators', sponsor: 'Epidemic Sound', avatar: 'https://picsum.photos/seed/epilogo/100/100', thumbnail: 'https://picsum.photos/seed/audio/640/360', link: 'https://www.epidemicsound.com/' }, 
  { id: 3, title: 'Cooking Gordon Ramsay’s Most Difficult Beef Wellington', channel: 'Culinary Master', avatar: 'https://picsum.photos/seed/avatar3/100/100', thumbnail: 'https://picsum.photos/seed/cooking/640/360', views: '1.2M views', time: '2 days ago', duration: '22:05' },
  { id: 4, title: '10 Things You Need to Stop Doing in Graphic Design', channel: 'Design Hub', avatar: 'https://picsum.photos/seed/avatar4/100/100', thumbnail: 'https://picsum.photos/seed/design/640/360', views: '620K views', time: '3 days ago', duration: '09:30' },
  { id: 5, title: 'I Spent 48 Hours in the World’s Most Remote City', channel: 'Travel Pro', avatar: 'https://picsum.photos/seed/avatar5/100/100', thumbnail: 'https://picsum.photos/seed/travel/640/360', views: '2.5M views', time: '4 days ago', duration: '14:20' },
  { id: 6, title: 'Minecraft, But Every Block is Random', channel: 'Gamer Legend', avatar: 'https://picsum.photos/seed/avatar6/100/100', thumbnail: 'https://picsum.photos/seed/game/640/360', views: '3.1M views', time: '5 days ago', duration: '28:10' },
  { id: 'ad2', isAd: true, title: 'Build Your Online Store in 5 Minutes ($1/mo)', sponsor: 'Shopify Creators', avatar: 'https://picsum.photos/seed/shoplogo/100/100', thumbnail: 'https://picsum.photos/seed/store/640/360', link: 'https://www.shopify.com/' }, 
  { id: 7, title: 'I Tried The Hardest Navy SEAL Workout For 30 Days', channel: 'Fit Life', avatar: 'https://picsum.photos/seed/avatar7/100/100', thumbnail: 'https://picsum.photos/seed/fitness/640/360', views: '1.8M views', time: '6 days ago', duration: '11:45' },
  { id: 8, title: 'Coding a Neural Network From Scratch in Python', channel: 'Dev Diaries', avatar: 'https://picsum.photos/seed/avatar8/100/100', thumbnail: 'https://picsum.photos/seed/code/640/360', views: '450K views', time: '1 week ago', duration: '22:15' },
  { id: 9, title: 'We Built The Cheapest Electric Car on Amazon', channel: 'Auto Tech', avatar: 'https://picsum.photos/seed/avatar9/100/100', thumbnail: 'https://picsum.photos/seed/car/640/360', views: '550K views', time: '2 weeks ago', duration: '15:30' },
  { id: 10, title: 'Relaxing Rain Sounds for Sleep & Study (10 Hours)', channel: 'Zen Ambience', avatar: 'https://picsum.photos/seed/avatar10/100/100', thumbnail: 'https://picsum.photos/seed/rain/640/360', views: '12M views', time: '1 month ago', duration: '10:00:00' }
];

const SAMPLE_THUMBNAILS = [
  { name: 'Tech Review', url: 'https://picsum.photos/seed/sample/640/360', title: 'The Future of AI Hardware Just Arrived (Honest Review)' }
];

const SEARCH_COMPETITORS = [
  {
    id: 's1',
    title: 'Don’t Buy AI Hardware in 2026 Until You Watch This Honest Review',
    channel: 'Dave Tech Reviews',
    avatar: 'https://picsum.photos/seed/dave/100/100',
    thumbnail: 'https://picsum.photos/seed/techhardware/640/360',
    duration: '16:40',
    views: '410K views',
    time: '2 days ago',
    description: 'We spent 30 days testing the newest generation of neural computing hardware and comparing them against traditional GPUs. Here is everything you need to know.'
  },
  {
    id: 's2',
    title: 'Why The Entire Tech Industry is Moving Away From GPUs',
    channel: 'Silicon Explained',
    avatar: 'https://picsum.photos/seed/silicon/100/100',
    thumbnail: 'https://picsum.photos/seed/siliconchip/640/360',
    duration: '21:15',
    views: '1.2M views',
    time: '3 weeks ago',
    description: 'Custom ASICs, NPUs, and neuromorphic processors are taking over. We break down the architectural shifts powering the next decade of computing.'
  },
  {
    id: 's3',
    title: 'Top 5 AI Hardware Gadgets That ACTUALLY Work (No Hype)',
    channel: 'Creator Gadgets',
    avatar: 'https://picsum.photos/seed/gadgets/100/100',
    thumbnail: 'https://picsum.photos/seed/gadgetreview/640/360',
    duration: '11:05',
    views: '290K views',
    time: '5 days ago',
    description: 'We cut through the marketing noise and tested 5 viral AI devices in real-world workflows to see which ones are worth your hard-earned cash.'
  }
];

export default function ThumbnailStudio() {
  const [thumbnailA, setThumbnailA] = useState(SAMPLE_THUMBNAILS[0].url);
  const [thumbnailB, setThumbnailB] = useState(null);
  const [activeVariant, setActiveVariant] = useState('A'); 
  const [mockVideos] = useState(MOCK_VIDEOS);
  
  const [videoTitle, setVideoTitle] = useState(SAMPLE_THUMBNAILS[0].title);
  const [channelName, setChannelName] = useState('My Creator Channel');
  const [videoDuration, setVideoDuration] = useState('14:28');
  const [viewCount, setViewCount] = useState('125K views');
  const [uploadTime, setUploadTime] = useState('4 hours ago');

  const [activeLayout, setActiveLayout] = useState('desktop'); 
  const [theme, setTheme] = useState('dark'); 
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [blurLevel, setBlurLevel] = useState(0); 
  const [showDurationBadge, setShowDurationBadge] = useState(true);

  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);

  const handleFileUpload = (e, variant = 'A') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (variant === 'A') {
        setThumbnailA(url);
        setActiveVariant('A');
      } else {
        setThumbnailB(url);
        setActiveVariant('compare');
      }
    }
  };

  const activeThumb = activeVariant === 'B' && thumbnailB ? thumbnailB : thumbnailA;

  return (
    <div className={`yt-studio ${theme}`}>
      <Helmet>
        <title>YouTube Thumbnail Tester & CTR Simulator | LittleTools.me</title>
        <meta name="description" content="Preview your YouTube thumbnails in real-world desktop, mobile, and search feeds before uploading. A/B test variants, check contrast with B&W mode, and avoid timestamp collisions." />
        <link rel="canonical" href="https://littletools.me/thumbnail-tester" />
        
        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://littletools.me/thumbnail-tester" />
        <meta property="og:title" content="YouTube Thumbnail Tester & Feed Simulator" />
        <meta property="og:description" content="See how your YouTube thumbnail stands out against competing videos in real feeds before you publish." />
        <meta property="og:site_name" content="LittleTools" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="YouTube Thumbnail Tester & Feed Simulator" />
        <meta name="twitter:description" content="A/B test thumbnails, simulate mobile/desktop views, and optimize click-through rate for free." />
        
        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "YouTube Thumbnail Feed Simulator",
            "url": "https://littletools.me/thumbnail-tester",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Preview and compare YouTube thumbnails against real trending video feeds on Desktop, Mobile, and Search."
          })}
        </script>
      </Helmet>

      <div className="studio-bar">
        <div className="studio-bar-left">
          <div className="studio-title-group">
            <span className="studio-badge">YouTube CTR Lab</span>
            <span className="studio-heading">Thumbnail Feed Simulator</span>
          </div>

          <div className="layout-pills">
            <button className={`pill-btn ${activeLayout === 'desktop' ? 'active' : ''}`} onClick={() => setActiveLayout('desktop')}><Monitor size={14} /> Desktop</button>
            <button className={`pill-btn ${activeLayout === 'mobile' ? 'active' : ''}`} onClick={() => setActiveLayout('mobile')}><Smartphone size={14} /> Mobile</button>
            <button className={`pill-btn ${activeLayout === 'search' ? 'active' : ''}`} onClick={() => setActiveLayout('search')}><Search size={14} /> Search</button>
          </div>
        </div>

        <div className="studio-bar-right">
          <button className={`diag-btn ${isGrayscale ? 'active' : ''}`} onClick={() => setIsGrayscale(!isGrayscale)}>B&W Contrast</button>
          <div className="blur-control">
            <span className="control-label">Squint:</span>
            <input type="range" min="0" max="6" step="1" value={blurLevel} onChange={(e) => setBlurLevel(Number(e.target.value))} />
          </div>
          <button className="icon-toggle-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}</button>
        </div>
      </div>

      <div className="input-deck">
        <div className="upload-slots">
          <div className="slot-box">
            <button className="upload-trigger-btn" onClick={() => fileInputRefA.current?.click()}><Upload size={14} /><span>{thumbnailA ? 'Change A' : 'Upload A'}</span></button>
            <input type="file" ref={fileInputRefA} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'A')} />
          </div>
          
          <div className="slot-box">
            <button className={`upload-trigger-btn ${thumbnailB ? 'has-file' : ''}`} onClick={() => fileInputRefB.current?.click()}><Layers size={14} /><span>{thumbnailB ? 'Change B' : '+ Compare B'}</span></button>
            <input type="file" ref={fileInputRefB} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'B')} />
          </div>

          {thumbnailB && (
            <div className="variant-switch">
              <button className={`var-btn ${activeVariant === 'A' ? 'selected' : ''}`} onClick={() => setActiveVariant('A')}>A</button>
              <button className={`var-btn ${activeVariant === 'B' ? 'selected' : ''}`} onClick={() => setActiveVariant('B')}>B</button>
              <button className={`var-btn ${activeVariant === 'compare' ? 'selected' : ''}`} onClick={() => setActiveVariant('compare')}>Side-by-Side</button>
            </div>
          )}
        </div>

        <div className="meta-inputs">
          <div className="input-field-group">
            <div className="field-header">
              <label>Video Title</label>
            </div>
            <input 
              type="text" 
              value={videoTitle} 
              onChange={(e) => setVideoTitle(e.target.value)}
              className="title-input"
              maxLength={100}
            />
          </div>

          <div className="meta-row">
            <div className="small-field">
              <label>Channel Name</label>
              <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="sub-input" />
            </div>
            <div className="small-field">
              <label>Duration</label>
              <input type="text" value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="sub-input duration-input" />
            </div>
            <div className="small-field">
              <label>Views</label>
              <input type="text" value={viewCount} onChange={(e) => setViewCount(e.target.value)} className="sub-input" />
            </div>
          </div>
        </div>
      </div>

      <div className="simulator-stage" style={{ filter: isGrayscale ? 'grayscale(100%)' : undefined, minHeight: '800px' }}>
        
        {/* DESKTOP FEED */}
        {activeLayout === 'desktop' && (
          <div className="yt-desktop-feed">
            <div className="yt-grid">
                <div className="yt-card primary-creator-card" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
                    <div className="yt-thumb-wrapper">
                      <img src={activeThumb} alt="Your Thumbnail" className="yt-thumb-img" />
                      {showDurationBadge && <span className="yt-time-badge">{videoDuration}</span>}
                    </div>
                    <div className="yt-meta-row">
                      <div className="yt-avatar default-avatar">{channelName.charAt(0).toUpperCase()}</div>
                      <div className="yt-info">
                        <h3 className="yt-title">{videoTitle}</h3>
                        <div className="yt-channel-line"><span>{channelName}</span><Check size={11} className="yt-verified" /></div>
                        <div className="yt-stat-line"><span>{viewCount}</span><span className="yt-dot">•</span><span>{uploadTime}</span></div>
                      </div>
                    </div>
                </div>

                {activeVariant === 'compare' && thumbnailB && (
                  <div className="yt-card primary-creator-card variant-b" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
                    <div className="yt-thumb-wrapper">
                      <img src={thumbnailB} alt="Variant B" className="yt-thumb-img" />
                      <span className="variant-tag" style={{position: 'absolute', top: 5, left: 5, background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>Variant B</span>
                      {showDurationBadge && <span className="yt-time-badge">{videoDuration}</span>}
                    </div>
                    <div className="yt-meta-row">
                      <div className="yt-avatar default-avatar">{channelName.charAt(0).toUpperCase()}</div>
                      <div className="yt-info">
                        <h3 className="yt-title">{videoTitle}</h3>
                        <div className="yt-channel-line"><span>{channelName}</span><Check size={11} className="yt-verified" /></div>
                        <div className="yt-stat-line"><span>{viewCount}</span><span className="yt-dot">•</span><span>{uploadTime}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {mockVideos.map(video => {
                  if (video.isAd) {
                    return (
                      <div key={video.id} className="yt-card sponsored-card" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
                        <a href={video.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="yt-thumb-wrapper">
                            <img src={video.thumbnail} className="yt-thumb-img" alt={video.title} />
                            <span className="yt-time-badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }}>Ad</span>
                          </div>
                          <div className="yt-meta-row">
                            <img src={video.avatar} className="yt-avatar" alt={video.sponsor} />
                            <div className="yt-info">
                              <h3 className="yt-title">{video.title}</h3>
                              <div className="yt-channel-line">
                                <span className="ad-attribution" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Sponsored</span>
                                <span className="yt-dot">•</span>
                                <span>{video.sponsor}</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  }
                  return (
                    <div key={video.id} className="yt-card" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
                      <div className="yt-thumb-wrapper">
                        <img src={video.thumbnail} className="yt-thumb-img" />
                        <span className="yt-time-badge">{video.duration}</span>
                      </div>
                      <div className="yt-meta-row">
                        <img src={video.avatar} className="yt-avatar" />
                        <div className="yt-info">
                          <h3 className="yt-title">{video.title}</h3>
                          <div className="yt-channel-line"><span>{video.channel}</span><Check size={11} className="yt-verified" /></div>
                          <div className="yt-stat-line"><span>{video.views}</span><span className="yt-dot">•</span><span>{video.time}</span></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* MOBILE FEED */}
        {activeLayout === 'mobile' && (
          <div className="mobile-shell-frame">
            <div className="mobile-speaker"></div>
            <div className="mobile-screen">
              <div className="yt-mobile-topbar">
                <span className="yt-mobile-logo">YouTube</span>
                <div className="mobile-top-icons">
                  <Search size={16} />
                  <div className="mini-avatar"></div>
                </div>
              </div>

              <div className="mobile-feed-scroll" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
                <div className="yt-mobile-card">
                  <div className="yt-thumb-wrapper">
                    <img src={activeThumb} alt="Your Thumbnail" className="yt-thumb-img" />
                    {showDurationBadge && <span className="yt-time-badge">{videoDuration}</span>}
                  </div>
                  <div className="yt-mobile-meta">
                    <div className="yt-avatar default-avatar">{channelName.charAt(0).toUpperCase()}</div>
                    <div className="yt-mobile-info">
                      <h3 className="yt-mobile-title">{videoTitle}</h3>
                      <div className="yt-mobile-sub">
                        <span>{channelName}</span><span className="yt-dot">•</span><span>{viewCount}</span><span className="yt-dot">•</span><span>{uploadTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {mockVideos.slice(0, 4).map(video => (
                  <div key={video.id} className="yt-mobile-card">
                    <div className="yt-thumb-wrapper">
                      <img src={video.thumbnail} className="yt-thumb-img" alt={video.title} />
                      {video.isAd ? (
                        <span className="yt-time-badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }}>Ad</span>
                      ) : (
                        <span className="yt-time-badge">{video.duration}</span>
                      )}
                    </div>
                    <div className="yt-mobile-meta">
                      <img src={video.avatar} className="yt-avatar" alt={video.channel || video.sponsor} />
                      <div className="yt-mobile-info">
                        <h3 className="yt-mobile-title">{video.title}</h3>
                        <div className="yt-mobile-sub">
                          <span>{video.isAd ? `Sponsored • ${video.sponsor}` : video.channel}</span>
                          {!video.isAd && (
                            <>
                              <span className="yt-dot">•</span>
                              <span>{video.views}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH FEED */}
        {activeLayout === 'search' && (
          <div className="yt-search-feed" style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined }}>
            <div className="search-filter-bar">
              <button className="search-filter-chip active">All</button>
              <button className="search-filter-chip">Shorts</button>
              <button className="search-filter-chip">Videos</button>
              <button className="search-filter-chip">Unwatched</button>
              <button className="search-filter-chip">Recently uploaded</button>
            </div>

            {/* Creator's Primary Video in Search */}
            <div className="search-result-row primary-search-row">
              <span className="your-video-indicator">Your Video (Variant A)</span>
              <div className="search-thumb-wrapper">
                <img src={activeThumb} alt="Your Thumbnail" className="search-thumb-img" />
                {showDurationBadge && <span className="yt-time-badge">{videoDuration}</span>}
              </div>
              <div className="search-meta">
                <h3 className="search-title">{videoTitle || 'Untitled Video'}</h3>
                <div className="search-stats">
                  <span>{viewCount}</span>
                  <span className="yt-dot">•</span>
                  <span>{uploadTime}</span>
                </div>
                <div className="search-channel-row">
                  <div className="yt-avatar default-avatar small-av" style={{ width: 24, height: 24, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#3b82f6', color: 'white' }}>
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                  <span className="search-channel-name">{channelName}</span>
                  <Check size={12} className="yt-verified" />
                </div>
                <p className="search-description-snippet">
                  In-depth breakdown covering {videoTitle || 'this video'}. Real-world performance testing, benchmarks, and honest impressions.
                </p>
              </div>
            </div>

            {/* If comparing Variant B in Search */}
            {activeVariant === 'compare' && thumbnailB && (
              <div className="search-result-row primary-search-row" style={{ borderColor: '#ef4444' }}>
                <span className="your-video-indicator" style={{ background: '#ef4444' }}>Your Video (Variant B)</span>
                <div className="search-thumb-wrapper">
                  <img src={thumbnailB} alt="Variant B Thumbnail" className="search-thumb-img" />
                  {showDurationBadge && <span className="yt-time-badge">{videoDuration}</span>}
                </div>
                <div className="search-meta">
                  <h3 className="search-title">{videoTitle || 'Untitled Video'}</h3>
                  <div className="search-stats">
                    <span>{viewCount}</span>
                    <span className="yt-dot">•</span>
                    <span>{uploadTime}</span>
                  </div>
                  <div className="search-channel-row">
                    <div className="yt-avatar default-avatar small-av" style={{ width: 24, height: 24, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#ef4444', color: 'white' }}>
                      {channelName.charAt(0).toUpperCase()}
                    </div>
                    <span className="search-channel-name">{channelName}</span>
                    <Check size={12} className="yt-verified" />
                  </div>
                  <p className="search-description-snippet">
                    Comparing Variant B thumbnail against top search competition.
                  </p>
                </div>
              </div>
            )}

            {/* Competing Search Results */}
            {SEARCH_COMPETITORS.map(comp => (
              <div key={comp.id} className="search-result-row">
                <div className="search-thumb-wrapper">
                  <img src={comp.thumbnail} alt={comp.title} className="search-thumb-img" />
                  <span className="yt-time-badge">{comp.duration}</span>
                </div>
                <div className="search-meta">
                  <h3 className="search-title">{comp.title}</h3>
                  <div className="search-stats">
                    <span>{comp.views}</span>
                    <span className="yt-dot">•</span>
                    <span>{comp.time}</span>
                  </div>
                  <div className="search-channel-row">
                    <img src={comp.avatar} alt={comp.channel} className="search-channel-avatar" />
                    <span className="search-channel-name">{comp.channel}</span>
                    <Check size={12} className="yt-verified" />
                  </div>
                  <p className="search-description-snippet">{comp.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Official AdSense Footer Unit */}
      <div className="standard-ad-banner" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <span className="ad-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Advertisement</span>
        <AdBanner adSlot="8979592305" style={{ display: 'block', width: '100%', maxWidth: '970px', height: '250px', margin: '0 auto' }} />
      </div>
    </div>
  );
}
