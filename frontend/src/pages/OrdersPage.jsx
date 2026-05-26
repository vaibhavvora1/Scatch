import { useEffect, useState } from 'react';
import { ordersAPI } from '../api/client';
import Footer from '../components/Footer';
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiXCircle } from 'react-icons/fi';
import { formatINR, shortId } from '../utils/format';

const STATUS_STYLES = {
  pending:    { icon: FiClock,       color: '#f59e0b', bg: 'rgba(245,158,11,.1)'   },
  processing: { icon: FiPackage,     color: '#6366f1', bg: 'rgba(99,102,241,.1)'   },
  shipped:    { icon: FiTruck,       color: '#3b82f6', bg: 'rgba(59,130,246,.1)'   },
  delivered:  { icon: FiCheckCircle, color: '#4ade80', bg: 'rgba(74,222,128,.1)'   },
  cancelled:  { icon: FiXCircle,     color: '#f87171', bg: 'rgba(248,113,113,.1)'  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.myOrders()
      .then(({ data }) => setOrders([...(data.orders || [])].reverse()))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spin" /></div>;

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <p className="section-label" style={{ marginBottom: '.5rem' }}>Account</p>
        <h1 className="section-heading" style={{ marginBottom: '2.5rem' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No orders yet. Start shopping!</p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const statusInfo = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            const StatusIcon = statusInfo.icon;
            const total = typeof order.totalAmount === 'number' ? order.totalAmount : 0;

            return (
              <div key={order._id || idx} className="glass" style={{ borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.25rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ fontSize: '.7rem', color: 'var(--text-secondary)', marginBottom: '.3rem' }}>Order #{shortId(order._id)}</p>
                    <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: statusInfo.bg, padding: '.35rem .85rem', borderRadius: '9999px' }}>
                    <StatusIcon size={14} style={{ color: statusInfo.color }} />
                    <span style={{ fontSize: '.75rem', fontWeight: 600, color: statusInfo.color, textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                </div>

                {/* Products */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.25rem' }}>
                  {(order.products || []).map((item, i) => {
                    const p = item.product;
                    if (!p) return null;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '.5rem', overflow: 'hidden', background: p.bgcolor || '#1a1a24', flexShrink: 0 }}>
                          {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500, marginBottom: '.2rem', fontSize: '.9rem' }}>{p.name || 'Product'}</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>Qty: {item.quantity} x {formatINR(item.price)}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: '#5b7dff' }}>{formatINR(Number(item.price || 0) * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontWeight: 700 }}>Total: <span style={{ color: '#5b7dff' }}>{formatINR(total)}</span></p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Footer />
    </div>
  );
}

