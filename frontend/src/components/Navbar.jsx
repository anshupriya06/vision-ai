import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import LoginModal from './LoginModal';


const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

const Navbar = ({ currentUser: propUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentUser: authUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentUser = propUser || authUser;
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = currentUser ? [
    { name: 'HOME',    path: '/' },
    { name: 'HISTORY', path: '/history' },
    { name: 'PRICING', path: '/pricing' },
    { name: 'ABOUT',   path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ] : [
    { name: 'HOME',         path: '/' },
    { name: 'FEATURES',     path: '/features' },
    { name: 'HOW IT WORKS', path: '/how-it-works' },
    { name: 'TESTIMONIALS', path: '/testimonials' },
    { name: 'PRICING',      path: '/pricing' },
    { name: 'ABOUT',        path: '/about' },
    { name: 'CONTACT',      path: '/contact' },
  ];

  const handleLogout = async () => {
    try { await logout(); navigate('/'); setIsMenuOpen(false); }
    catch { alert('Logout failed.'); }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">

            {/* Logo — pinned left */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="relative p-1.5 border border-neon-cyan/40 rounded group-hover:border-neon-cyan transition-all group-hover:shadow-neon-cyan">
                <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-sora text-base sm:text-lg font-bold">
                <span className="text-neon-cyan" style={{ textShadow: '0 0 10px #00f0ff88' }}>VISION</span>
                <span className="text-white">SAFE</span>
              </span>
            </Link>

            {/* Desktop nav — truly centered */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `font-inter text-xs font-semibold tracking-widest transition-all relative group pb-1 ${
                      link.highlight
                        ? isActive ? 'text-neon-red' : 'text-neon-red/70 hover:text-neon-red'
                        : isActive ? 'text-neon-cyan' : 'text-slate-400 hover:text-neon-cyan'
                    }`
                  }
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px transition-all ${link.highlight ? 'bg-neon-red shadow-neon-red' : 'bg-neon-cyan shadow-neon-cyan'} ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </NavLink>
              ))}
            </div>

            {/* Auth + Theme — pinned right */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-neon-cyan/20 rounded hover:border-neon-cyan/50 transition-all"
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-neon-cyan" />
                    ) : (
                      <div className="w-6 h-6 rounded-full ring-1 ring-neon-cyan bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold font-sora">
                        {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-inter text-xs text-slate-300 max-w-[100px] truncate">
                      {currentUser.displayName?.split(' ')[0] || 'USER'}
                    </span>
                  </button>
                  <button onClick={handleLogout} className="btn-danger px-4 py-1.5 text-xs font-inter font-semibold tracking-widest">
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber px-4 py-1.5 text-xs font-inter font-semibold tracking-widest">
                    <span>LOGIN</span>
                  </button>
                  <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber-solid px-4 py-1.5 text-xs font-inter font-bold tracking-widest">
                    SIGN UP
                  </button>
                </>
              )}
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="lg:hidden flex flex-1 items-center justify-end gap-2">
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-neon-cyan transition-colors p-1"
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-1 border-t border-neon-cyan/10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block font-inter text-xs font-semibold tracking-widest px-3 py-2.5 rounded transition-colors ${
                      link.highlight
                        ? isActive ? 'text-neon-red bg-neon-red/5' : 'text-neon-red/70 hover:text-neon-red hover:bg-neon-red/5'
                        : isActive ? 'text-neon-cyan bg-neon-cyan/5' : 'text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/5'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="pt-3 flex flex-col gap-2 px-1">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 border border-neon-cyan/20 rounded hover:border-neon-cyan/40 transition-all"
                    >
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-neon-cyan" />
                      ) : (
                        <div className="w-6 h-6 rounded-full ring-1 ring-neon-cyan bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold">
                          {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-inter text-xs text-slate-300 truncate">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </button>
                    <button onClick={handleLogout} className="btn-danger px-4 py-2.5 text-xs font-inter font-semibold tracking-widest w-full">
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="btn-cyber flex-1 px-4 py-2.5 text-xs font-inter font-semibold">
                      <span>LOGIN</span>
                    </button>
                    <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="btn-cyber-solid flex-1 px-4 py-2.5 text-xs font-inter font-bold">
                      SIGN UP
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Navbar;
