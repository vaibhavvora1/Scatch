import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { discountedPrice, formatINR } from '../utils/format';

const BADGE_MAP = {
  trending: { label: 'Trending', cls: 'badge-trending' },
  featured: { label: 'Featured', cls: 'badge-featured' },
  'new-arrival': { label: 'New Arrival', cls: 'badge-new-arrival' },
  'best-seller': { label: 'Best Seller', cls: 'badge-best-seller' },
};

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const salePrice = discountedPrice(product);
  const badge = BADGE_MAP[product.badge];
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setAdding(true);
    const result = await addToCart(product._id);
    setAdding(false);
    result?.success ? toast.success('Added to cart') : toast.error(result?.message || 'Failed to add');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const result = await toggle(product._id);
    if (result) toast.success(result.message);
  };

  return (
    <>
      <motion.article
        className="luxury-product-card"
        initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.72, delay: Math.min(index * 0.055, 0.35), ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -10 }}
      >
        {badge && <span className={`luxury-badge ${badge.cls}`}>{badge.label}</span>}

        <motion.button
          type="button"
          className={`wishlist-pill ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          whileTap={{ scale: 0.86 }}
          aria-label="Toggle wishlist"
        >
          <FiHeart style={{ fill: wishlisted ? 'currentColor' : 'none' }} />
        </motion.button>

        <Link to={`/product/${product._id}`} className="product-media-link">
          <div className="luxury-product-media" style={{ background: product.bgcolor || '#f5f5f4' }}>
            {product.image ? (
              <motion.img
                src={product.image}
                alt={product.name}
                loading="lazy"
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <span>No Image</span>
            )}
            <button type="button" className="quick-preview" onClick={(e) => { e.preventDefault(); setPreviewOpen(true); }}>
              <FiEye /> Preview
            </button>
          </div>

          <div className="luxury-product-body">
            <p className="product-category">{product.category || 'Scatch'}</p>
            <h3>{product.name}</h3>
            
            {/* Seller Info */}
            {product.seller && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--accent-soft)',
                borderRadius: '0.5rem',
                marginBottom: '0.75rem',
              }}>
                {product.seller.shopLogo ? (
                  <img 
                    src={product.seller.shopLogo}
                    alt={product.seller.shopName}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '0.3rem',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '0.3rem',
                    background: 'var(--accent-soft)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.8rem',
                  }}>
                    🏪
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Sold by
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}>
                    {product.seller.shopName}
                  </p>
                </div>
                {product.seller.rating && (
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                  }}>
                    {product.seller.rating.toFixed(1)}⭐
                  </div>
                )}
              </div>
            )}

            <div className="price-row">
              <span>{formatINR(salePrice)}</span>
              {Number(product.discount) > 0 && <del>{formatINR(product.price)}</del>}
            </div>
          </div>
        </Link>

        <motion.button
          type="button"
          className="add-cart-luxury"
          onClick={handleAddToCart}
          disabled={adding}
          whileTap={{ scale: 0.97 }}
        >
          <FiShoppingBag />
          {adding ? 'Adding' : 'Add to Cart'}
        </motion.button>
      </motion.article>

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="preview-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              className="preview-modal"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="modal-close" onClick={() => setPreviewOpen(false)}><FiX /></button>
              <div className="preview-image" style={{ background: product.bgcolor || '#f5f5f4' }}>
                {product.image && <img src={product.image} alt={product.name} />}
              </div>
              <div>
                <p className="section-label">Quick Preview</p>
                <h2>{product.name}</h2>
                <p>{product.description || 'A refined Scatch piece crafted for daily luxury.'}</p>
                <strong>{formatINR(salePrice)}</strong>
                <div className="preview-actions">
                  <button className="btn-magnetic btn-primary" onClick={handleAddToCart}>Add to Cart</button>
                  <Link to={`/product/${product._id}`} className="btn-magnetic btn-outline" onClick={() => setPreviewOpen(false)}>View Details</Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
