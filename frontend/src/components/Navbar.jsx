import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import gsap from 'gsap';
import { FiShoppingBag, FiSearch, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { cartCount }                = useCart();
  const location                     = useLocation();
  const navigate                     = useNavigate();
  const navRef                       = useRef(null);
  const [menuOpen, setMenuOpen]      = useState(false);
  const [searchOpen, setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery]= useState('');
  const [scrolled, setScrolled]      = useState(false);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (event) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // Slide in on mount
  useEffect(() => {
    gsap.from(navRef.current, { y: -80, opacity: 0, duration: 1, ease: 'expo.out' });
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const links = [
    { label: 'Shop',     to: '/shop'      },
    { label: 'New In',   to: '/shop?badge=new-arrival' },
    { label: 'Trending', to: '/shop?badge=trending'    },
    { label: 'Featured', to: '/shop?badge=featured'    },
  ];

  const getLinkPath = (to) => {
    const current = `${location.pathname}${location.search}`;
    return current === to;
  };

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 premium-navbar ${scrolled ? 'nav-blur' : ''}`}
        style={{ padding: '1rem clamp(1rem, 4vw, 2rem)' }}
      >
        <div className="nav-inner" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="nav-logo">
              <span className="brand-icon">S</span>
              Scatch
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="nav-desktop-links">
            {links.map((l) => (
              <li key={l.to}>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: .98 }}>
                <Link
                  to={l.to}
                  className={`nav-link${getLinkPath(l.to) ? ' nav-link-active' : ''}`}
                >
                  {l.label}
                </Link>
                </motion.div>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            {/* Search */}
            <button aria-label="Search products" onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              <FiSearch />
            </button>

            {isLoggedIn ? (
              <>
                <Link to="/wishlist" aria-label="Wishlist" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', textDecoration: 'none' }}>
                  <FiHeart />
                </Link>
                <Link to="/cart" aria-label="Cart" style={{ position: 'relative', color: 'var(--text-secondary)', fontSize: '1.2rem', textDecoration: 'none' }}>
                  <FiShoppingBag />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      background: 'var(--accent)', color: '#ffffff',
                      borderRadius: '50%', width: '18px', height: '18px',
                      fontSize: '.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <div style={{ position: 'relative' }} className="group">
                  <button aria-label="Account menu" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {user?.picture
                      ? <img src={user.picture} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)' }} />
                      : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '.75rem', fontWeight: 700 }}>
                          {user?.fullname?.[0]?.toUpperCase()}
                        </div>
                    }
                  </button>
                  {/* Dropdown */}
                  <div className="group-hover:block hidden" style={{
                    position: 'absolute', right: 0, top: '120%',
                    background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(0,0,0,.08)',
                    borderRadius: '.75rem', minWidth: '180px', padding: '.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,.08)',
                  }}>
                    {[
                      { label: 'My Profile', to: '/profile' },
                      { label: 'My Orders',  to: '/orders'  },
                      { label: 'Wishlist',   to: '/wishlist'},
                    ].map((item) => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'block', padding: '.6rem 1rem',
                        color: 'var(--text-primary)', textDecoration: 'none',
                        fontSize: '.85rem', borderRadius: '.5rem',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(91,125,255,.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,.08)', margin: '.5rem 0' }} />
                    <button onClick={handleLogout} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '.6rem 1rem', color: '#f87171',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '.85rem', borderRadius: '.5rem',
                    }}>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-magnetic btn-primary" style={{ padding: '.5rem 1.25rem', fontSize: '.75rem' }}>
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="nav-menu-toggle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nav-mobile-panel"
            style={{ borderTop: '1px solid rgba(0,0,0,.08)', padding: '1rem 1rem', overflow: 'hidden' }}
          >
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className={`nav-link nav-link-mobile${getLinkPath(l.to) ? ' nav-link-active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
        </AnimatePresence>
      </motion.nav>

      {/* Search overlay */}
      <AnimatePresence>
      {searchOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <motion.div initial={{ y: 22, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: .98 }} style={{ width: '100%', maxWidth: '600px' }}>
            <p style={{ textAlign: 'center', fontSize: '.7rem', letterSpacing: '.2em', color: 'var(--accent)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              Search Products
            </p>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                autoFocus
                className="input-luxury"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '1.1rem', paddingRight: '4rem' }}
              />
              <button type="submit" style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '1.2rem',
              }}>
                <FiSearch />
              </button>
            </form>
            <button onClick={() => setSearchOpen(false)} style={{
              display: 'block', margin: '1.5rem auto 0',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '.85rem', letterSpacing: '.05em',
            }}>
              Press ESC to close
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

