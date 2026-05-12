import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import JobTracker from './pages/JobTracker';
import BulkSender from './pages/BulkSender';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden transition-colors duration-300">
            <Navbar />
            
            <main className="flex-1 flex flex-col min-w-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tracker" element={<JobTracker />} />
                <Route path="/bulk-sender" element={<BulkSender />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}
