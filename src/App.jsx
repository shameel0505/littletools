import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './Layout';
import Home from './Home';
import BgRemoverTool from './BgRemoverTool';
import ThumbnailStudio from './ThumbnailStudio';
import DocToMdTool from './DocToMdTool';
import CineGradeTool from './CineGradeTool';
import AboutUs from './AboutUs';
import Contact from './Contact';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="bg-remover" element={<BgRemoverTool />} />
            <Route path="thumbnail-tester" element={<ThumbnailStudio />} />
            <Route path="doc-to-md" element={<DocToMdTool />} />
            <Route path="cinegrade" element={<CineGradeTool />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="about-us" element={<Navigate to="/about" replace />} />
            <Route path="contact" element={<Contact />} />
            <Route path="contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="doc-to-markdown" element={<Navigate to="/doc-to-md" replace />} />
            <Route path="thumbnail-studio" element={<Navigate to="/thumbnail-tester" replace />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="privacy-policy" element={<Navigate to="/privacy" replace />} />
            <Route path="terms" element={<Terms />} />
            <Route path="terms-of-service" element={<Navigate to="/terms" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
