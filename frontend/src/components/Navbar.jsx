import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

const Navbar = ({ currentUser: propUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentUser: authUser, logout } = useAuth();
  const currentUser = propUser || authUser;
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = currentUser ? [
    { name: 'Home', path: '/' },
    { name: 'History', path: '/history' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glassmorphism border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-accent rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-accent to-safe p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-bold text-gradient">VisionSafe</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `text-lg font-semibold text-gray-300 hover:text-white transition-colors relative group ${
                    isActive ? 'text-accent' : ''
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </NavLink>
              ))}
            </div>

            {/* Auth Button / User Avatar */}
            <div className="hidden md:block">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-3 glassmorphism px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName}
                        className="w-8 h-8 rounded-full border-2 border-accent"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center text-white font-bold">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-lg font-medium">{currentUser.displayName?.split(' ')[0] || 'User'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all text-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all text-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="relative px-6 py-2 bg-accent text-white font-semibold rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-accent/50 transition-all text-lg"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    <span className="relative">Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 animate-fade-in">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-accent/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
              {currentUser ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 glassmorphism px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName}
                        className="w-10 h-10 rounded-full border-2 border-accent"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center text-white font-bold text-lg">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{currentUser.displayName || 'User'}</div>
                      <div className="text-xs text-gray-400">{currentUser.email}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;
