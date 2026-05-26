import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function WishlistPage() {
  const { wishlist, fetchWishlist } = useWishlist();

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <p className="section-label" style={{ marginBottom: '.5rem' }}>Saved</p>
        <h1 className="section-heading" style={{ marginBottom: '2.5rem' }}>My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤍</p>
            <p style={{ fontSize: '1.1rem', marginBottom: '.75rem', color: 'var(--text-secondary)' }}>Your wishlist is empty</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Heart products to save them here</p>
            <Link to="/shop" className="btn-magnetic btn-primary" style={{ textDecoration: 'none' }}>Explore Shop</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
