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
    { name: 'HOME', path: '/' },
    { name: 'HISTORY', path: '/history' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ] : [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const handleLogout = async () => {
    try { await logout(); navigate('/'); }
    catch { alert('Logout failed.'); }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative p-1.5 border border-neon-cyan/40 rounded group-hover:border-neon-cyan transition-all group-hover:shadow-neon-cyan">
                <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-orbitron text-lg font-bold">
                <span className="text-neon-cyan" style={{textShadow:'0 0 10px #00f0ff88'}}>VISION</span>
                <span className="text-white">SAFE</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `font-mono-jet text-xs tracking-widest transition-all relative group pb-1 ${
                      isActive ? 'text-neon-cyan' : 'text-slate-400 hover:text-neon-cyan'
                    }`
                  }
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px bg-neon-cyan transition-all shadow-neon-cyan ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </NavLink>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center space-x-3">
              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-neon-cyan/20 rounded hover:border-neon-cyan/50 transition-all"
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-neon-cyan" />
                    ) : (
                      <div className="w-6 h-6 rounded-full ring-1 ring-neon-cyan bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold font-orbitron">
                        {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-mono-jet text-xs text-slate-300">
                      {currentUser.displayName?.split(' ')[0] || 'USER'}
                    </span>
                  </button>
                  <button onClick={handleLogout} className="btn-danger px-4 py-1.5 text-xs font-mono-jet tracking-widest">
                    <span>LOGOUT</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber px-4 py-1.5 text-xs tracking-widest font-mono-jet">
                    <span>LOGIN</span>
                  </button>
                  <button onClick={() => setIsLoginModalOpen(true)} className="btn-cyber-solid px-4 py-1.5 text-xs tracking-widest font-mono-jet">
                    SIGN UP
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-400 hover:text-neon-cyan transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-neon-cyan/10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block font-mono-jet text-xs tracking-widest text-slate-400 hover:text-neon-cyan px-2 py-2 transition-colors"
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-2 flex gap-2">
                {currentUser ? (
                  <button onClick={handleLogout} className="btn-danger px-4 py-2 text-xs font-mono-jet tracking-widest w-full">LOGOUT</button>
                ) : (
                  <>
                    <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="btn-cyber px-4 py-2 text-xs w-full font-mono-jet"><span>LOGIN</span></button>
                    <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="btn-cyber-solid px-4 py-2 text-xs w-full font-mono-jet">SIGN UP</button>
                  </>
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
