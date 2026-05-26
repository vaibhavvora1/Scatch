import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiGithub, FiMail } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(15,23,42,.06)',
      background: 'var(--bg-primary)',
      padding: '4rem 1.5rem 2rem',
      marginTop: '6rem',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.8rem', fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              marginBottom: '1rem',
            }}>
              Scatch
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem', lineHeight: 1.7, maxWidth: '240px' }}>
              A premium shopping experience crafted for those who demand excellence.
            </p>
            <div className="newsletter-row" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { Icon: FiInstagram, href: 'https://www.instagram.com/ivaibhavvora?igsh=MWo1ZWQzZXduMW5iYw==', label: 'Instagram' },
                { Icon: FiGithub, href: 'https://github.com/vaibhavvora1', label: 'GitHub' },
                { Icon: FiTwitter, href: 'https://x.com/ivaibhavvora', label: 'X' },
                { Icon: FiMail, href: 'mailto:vrvora11@gmail.com', label: 'Email' },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  style={{
                    background: 'var(--accent-soft)', border: '1px solid var(--border)',
                    borderRadius: '50%', width: '38px', height: '38px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem',
                    transition: 'all .2s', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <item.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '.9rem', letterSpacing: '.05em' }}>Shop</h4>
            {[
              { label: 'All Products',  to: '/shop' },
              { label: 'New Arrivals',  to: '/shop?badge=new-arrival' },
              { label: 'Trending',      to: '/shop?badge=trending' },
              { label: 'Best Sellers',  to: '/shop?badge=best-seller' },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: 'var(--text-secondary)', textDecoration: 'none',
                fontSize: '.85rem', marginBottom: '.65rem',
                transition: 'color .2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '.9rem', letterSpacing: '.05em' }}>Account</h4>
            {[
              { label: 'My Profile', to: '/profile'  },
              { label: 'My Orders',  to: '/orders'   },
              { label: 'Wishlist',   to: '/wishlist'  },
              { label: 'Cart',       to: '/cart'      },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: 'var(--text-secondary)', textDecoration: 'none',
                fontSize: '.85rem', marginBottom: '.65rem', transition: 'color .2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '.9rem', letterSpacing: '.05em' }}>Stay Updated</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Subscribe for exclusive drops and offers.
            </p>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input
                className="input-luxury"
                placeholder="your@email.com"
                style={{ flex: 1, padding: '.65rem 1rem', fontSize: '.85rem' }}
              />
              <button className="btn-magnetic btn-primary" style={{ padding: '.65rem 1rem', fontSize: '.75rem', whiteSpace: 'nowrap' }}>
                Join
              </button>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(15,23,42,.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>
            © {year} Scatch. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>
            Crafted with precision &amp; care.
          </p>
        </div>
      </div>
    </footer>
  );
}
