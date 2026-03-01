import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { useReportStore } from './store/useReportStore';
import { Preview } from './components/Preview/Preview';

const SharedReportViewer = () => {
  const { slug } = useParams();
  const { setReport } = useReportStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/share?slug=${slug}`);
        if (!response.ok) throw new Error('Report not found');
        const data = await response.json();
        setReport(data.content);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReport();
  }, [slug, setReport]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>This report link may have expired or is incorrect.</p>
          <a href="/" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Go to Editor</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--color-bg-app)', display: 'flex', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
      <div className="layout-preview-wrapper" style={{ height: 'auto', display: 'block', width: 'auto', maxWidth: '100%' }}>
        <Preview />
      </div>
    </div>
  );
};

function AppContent() {
  const { report } = useReportStore();

  useEffect(() => {
    document.title = `${report.reportTitle} - PDF Maker`;
  }, [report.reportTitle]);

  return (
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="/share/:slug" element={<SharedReportViewer />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
