import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api/client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import Footer from '../components/Footer';
import { discountedPrice, formatINR } from '../utils/format';

export default function CartPage() {
  const { cart, cartTotal, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await ordersAPI.checkout({ address: '' });
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '4rem' }}>🛍️</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Discover our premium collection</p>
      <Link to="/shop" className="btn-magnetic btn-primary" style={{ textDecoration: 'none' }}>Browse Shop</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="section-heading">Shopping Cart</h1>
          <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <FiTrash2 /> Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Items */}
          <div style={{ gridColumn: 'span 2' }}>
            {cart.map((item) => {
              if (!item.product) return null;
              const p    = item.product;
              const disc = discountedPrice(p);
              return (
                <div key={item._id} className="glass" style={{
                  borderRadius: '1.25rem', padding: '1.25rem',
                  display: 'flex', gap: '1.5rem', alignItems: 'center',
                  marginBottom: '1rem', flexWrap: 'wrap',
                }}>
                  {/* Image */}
                  <div style={{ width: '90px', height: '90px', borderRadius: '.75rem', overflow: 'hidden', background: p.bgcolor || '#1a1a24', flexShrink: 0 }}>
                    {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, marginBottom: '.3rem' }}>{p.name}</h3>
                    <p style={{ color: '#5b7dff', fontWeight: 700, fontSize: '1.05rem' }}>{formatINR(disc)}</p>
                    {p.discount > 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', textDecoration: 'line-through' }}>{formatINR(p.price)}</p>}
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <button onClick={() => updateItem(item._id, 'decrease')} style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)',
                      background: 'rgba(255,255,255,.05)', cursor: 'pointer', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><FiMinus size={14} /></button>
                    <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item._id, 'increase')} style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)',
                      background: 'rgba(255,255,255,.05)', cursor: 'pointer', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><FiPlus size={14} /></button>
                  </div>

                  {/* Line total */}
                  <p style={{ fontWeight: 700, color: '#5b7dff', minWidth: '80px', textAlign: 'right' }}>
                    {formatINR(disc * item.quantity)}
                  </p>

                  {/* Remove */}
                  <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '1.1rem' }}>
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '1.5rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>{formatINR(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: '#4ade80' }}>Free</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.08)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: '#5b7dff' }}>{formatINR(cartTotal)}</span>
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '.5rem' }}>
              <FiShoppingBag />
              {checkingOut ? 'Placing Order...' : 'Place Order'}
              <FiArrowRight />
            </button>
            <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.85rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

