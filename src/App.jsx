import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './Layout';
import Home from './Home';
import BgRemoverTool from './BgRemoverTool';
import ThumbnailStudio from './ThumbnailStudio';
import DocToMdTool from './DocToMdTool';
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
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
