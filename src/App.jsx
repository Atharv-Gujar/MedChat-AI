import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import ScanAnalysis from './pages/ScanAnalysis';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('medchat-theme') || 'dark');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('medchat-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      <div className="h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--on-surface)' }}>
        <div className="relative z-10 flex h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} theme={theme} toggleTheme={toggleTheme} />

          {sidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="flex flex-col flex-1 min-w-0">
            <TopBar onMenuClick={() => setSidebarOpen(true)} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-1 flex flex-col min-h-0">
              <Routes>
                <Route path="/" element={<Dashboard theme={theme} />} />
                <Route path="/general" element={<ChatPage sectionKey="general" theme={theme} />} />
                <Route path="/xray" element={<ScanAnalysis sectionKey="xray" theme={theme} />} />
                <Route path="/mri" element={<ScanAnalysis sectionKey="mri" theme={theme} />} />
                <Route path="/ct" element={<ScanAnalysis sectionKey="ct" theme={theme} />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
