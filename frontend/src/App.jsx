import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Testimonials from './components/Testimonials';

import About from './pages/About';
import Contact from './pages/Contact';
import History from './pages/History';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import StaticPage from './pages/StaticPage';
import FeatureDetails from './pages/FeatureDetails';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import AdminPanel from './pages/AdminPanel';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ADMIN_EMAILS = ['anshu@stellatone.com', 'admin@visionsafe.io'];

/* All routes shared between logged-in and logged-out layouts */
const SharedRoutes = ({ currentUser }) => {
  const ProtectedRoute = ({ children }) =>
    currentUser ? children : <Navigate to="/" replace />;

  const Home = () => currentUser ? <Dashboard /> : <><Hero /><Features /></>;

  return (
    <Routes>
      <Route path="/"              element={<Home />} />
      <Route path="/features"      element={<FeaturesPage />} />
      <Route path="/how-it-works"  element={<HowItWorks />} />
      <Route path="/testimonials"  element={<Testimonials />} />
      <Route path="/pricing"       element={<Pricing />} />
      <Route path="/about"         element={<About />} />
      <Route path="/contact"       element={<Contact />} />
      <Route path="/feature-details" element={<FeatureDetails />} />
      <Route path="/api"           element={<StaticPage page="api" />} />
      <Route path="/documentation" element={<StaticPage page="documentation" />} />
      <Route path="/blog"          element={<StaticPage page="blog" />} />
      <Route path="/careers"       element={<StaticPage page="careers" />} />
      <Route path="/help-center"   element={<StaticPage page="help-center" />} />
      <Route path="/community"     element={<StaticPage page="community" />} />
      <Route path="/guides"        element={<StaticPage page="guides" />} />
      <Route path="/partners"      element={<StaticPage page="partners" />} />
      <Route path="/privacy"       element={<StaticPage page="privacy" />} />
      <Route path="/terms"         element={<StaticPage page="terms" />} />
      <Route path="/security"      element={<StaticPage page="security" />} />
      <Route path="/compliance"    element={<StaticPage page="compliance" />} />
      <Route path="/cookies"       element={<StaticPage page="cookies" />} />
      <Route path="/admin"         element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/history"       element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit"  element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isDashboard = currentUser && location.pathname === '/';

  return (
    <div className={`gradient-bg ${isDashboard ? '' : 'min-h-screen overflow-x-hidden'}`}>
      {/* Ambient glow — fixed, behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full filter blur-[120px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-safe rounded-full filter blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10">
        <ScrollToTop />
        <Navbar currentUser={currentUser} />
        <SharedRoutes currentUser={currentUser} />
        {!isDashboard && <Footer />}
      </div>

      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
