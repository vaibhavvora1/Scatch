import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { FiHeart, FiShoppingBag, FiArrowLeft, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { discountedPrice, formatINR } from '../utils/format';

const BADGE_MAP = {
  trending:     { label: 'Trending',    cls: 'badge-trending'    },
  featured:     { label: 'Featured',    cls: 'badge-featured'    },
  'new-arrival':{ label: 'New Arrival', cls: 'badge-new-arrival' },
  'best-seller':{ label: 'Best Seller', cls: 'badge-best-seller' },
};

export default function ProductDetailPage() {
  const { id }                       = useParams();
  const navigate                     = useNavigate();
  const { addToCart }                = useCart();
  const { toggle, isWishlisted }     = useWishlist();
  const { isLoggedIn }               = useAuth();
  const [product, setProduct]        = useState(null);
  const [loading, setLoading]        = useState(true);
  const [adding, setAdding]          = useState(false);
  const imgRef                       = useRef(null);
  const contentRef                   = useRef(null);

  useEffect(() => {
    setLoading(true);
    productsAPI.getOne(id)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!product) return;
    gsap.from(imgRef.current,     { x: -60, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.from(contentRef.current, { x: 60,  opacity: 0, duration: 1, ease: 'expo.out' });
  }, [product]);

  const handleAdd = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setAdding(true);
    const r = await addToCart(product._id);
    setAdding(false);
    r?.success ? toast.success('Added to cart!') : toast.error(r?.message || 'Error');
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const r = await toggle(product._id);
    if (r) toast.success(r.message);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spin" />
    </div>
  );

  if (!product) return null;

  const discounted = discountedPrice(product);
  const badge      = BADGE_MAP[product.badge];
  const wishlisted = isWishlisted(product._id);

  const imageBg = (() => {
    const bgcolor = product.bgcolor;
    if (typeof bgcolor !== 'string') return '#1a1a24';
    const color = bgcolor.trim().toLowerCase();
    if (!color || color === '#fff' || color === '#ffffff' || color === 'white' || color === 'rgb(255, 255, 255)') {
      return '#1a1a24';
    }
    return bgcolor;
  })();

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: 'rgba(15, 23, 34, 0.03)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '.5rem',
          fontSize: '.88rem', marginBottom: '2rem', transition: 'color .2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#5b7dff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <FiArrowLeft /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'start',
            background: 'rgba(255,255,255,0)',
            borderRadius: '2rem',
            padding: '2rem',
            border: '1px solid rgba(15, 23, 34, 0.08)',
            boxShadow: '0 40px 140px rgba(15, 23, 34, 0.08)',
          }}
        >
          {/* Image */}
          <div ref={imgRef}>
            <div style={{
              background: imageBg,
              borderRadius: '1.5rem', overflow: 'hidden',
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(15, 23, 34, 0.08)',
              boxShadow: '0 30px 65px rgba(15, 23, 34, 0.08)',
            }}>
              {product.image
                ? <motion.img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1.5rem' }} whileHover={{ scale: 1 }} transition={{ duration: .7 }} />
                : <p style={{ color: product.textcolor || '#fff', opacity: .4 }}>No Image</p>
              }
            </div>
          </div>

          {/* Details */}
          <div ref={contentRef} style={{
            background: 'rgba(255,255,255,0)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 30px 60px rgba(15, 23, 34, 0.07)',
          }}>
            {badge && (
              <span className={badge.cls} style={{
                display: 'inline-block', padding: '.3rem .85rem', borderRadius: '9999px',
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: '1rem', color: badge.cls === 'badge-featured' ? '#0a0a0f' : '#fff',
              }}>
                {badge.label}
              </span>
            )}

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              {product.name}
            </h1>

            {product.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, color: '#5b7dff' }}>
                {formatINR(discounted)}
              </span>
              {product.discount > 0 && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatINR(product.price)}</span>
                  <span style={{
                    background: 'rgba(74,222,128,.1)', color: '#4ade80',
                    padding: '.25rem .65rem', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700,
                  }}>
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                ['Category', product.category || 'General'],
                ['Stock',    product.stock > 0 ? `${product.stock} available` : 'Out of stock'],
                ['Rating',   product.rating ? `${product.rating} ★ (${product.reviewCount} reviews)` : 'No reviews yet'],
                ['Sold',     `${product.totalSold || 0} units`],
              ].map(([k, v]) => (
                <div key={k} className="glass" style={{ borderRadius: '.75rem', padding: '.75rem 1rem' }}>
                  <p style={{ fontSize: '.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.25rem' }}>{k}</p>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={handleAdd} disabled={adding || product.stock === 0} className="btn-magnetic btn-primary" style={{
                flex: 1, minWidth: '160px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                opacity: product.stock === 0 ? .5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              }}>
                <FiShoppingBag /> {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={handleWishlist} style={{
                width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                background: wishlisted ? 'rgba(91,125,255,.15)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${wishlisted ? '#5b7dff' : 'rgba(255,255,255,.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: wishlisted ? '#5b7dff' : 'var(--text-secondary)', fontSize: '1.2rem',
                transition: 'all .2s',
              }}>
                <FiHeart style={{ fill: wishlisted ? '#5b7dff' : 'none' }} />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.section
          className="reviews-luxury"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .65 }}
        >
          <p className="section-label">Reviews</p>
          <h2>Customer Signals</h2>
          <div>
            {['Immaculate finish and premium feel.', 'Fast delivery, beautiful packaging.', 'The product looks even better in person.'].map((copy, index) => (
              <article key={copy}>
                <FiStar />
                <p>{copy}</p>
                <span>Verified Buyer {index + 1}</span>
              </article>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
