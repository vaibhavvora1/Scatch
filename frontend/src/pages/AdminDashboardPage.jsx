import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiDollarSign, FiShoppingBag, FiUsers, FiLogOut, FiTrendingUp, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI, authAPI } from '../api/client';
import { formatINR, shortId } from '../utils/format';

const BADGE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'trending', label: 'Trending' },
  { value: 'featured', label: 'Featured' },
  { value: 'new-arrival', label: 'New Arrival' },
  { value: 'best-seller', label: 'Best Seller' },
];

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home' },
  { value: 'beauty', label: 'Beauty' },
];

const getEmptyProductForm = () => ({
  name: '',
  price: '',
  discount: '0',
  category: 'general',
  badge: 'none',
  description: '',
  stock: '1',
  bgcolor: '#101a32',
  panelcolor: '#121c35',
  textcolor: '#e8edf8',
});

function MetricCard({ icon: Icon, label, value, tone = 'gold', index }) {
  return (
    <motion.div
      className="admin-metric"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.55 }}
    >
      <div className={`metric-icon ${tone}`}><Icon /></div>
      <p>{label}</p>
      <strong>{value}</strong>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [stats, products, orders, users] = await Promise.all([
        adminAPI.stats(),
        adminAPI.products(),
        adminAPI.orders(),
        adminAPI.users(),
      ]);
      return {
        stats: stats.data,
        products: products.data.products || [],
        orders: orders.data.orders || [],
        users: users.data.users || [],
      };
    },
  });

  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(getEmptyProductForm());
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setSelectedProduct(null);
    setForm(getEmptyProductForm());
    setImageFile(null);
    setPreview('');
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Delete this product from inventory?');
    if (!confirmed) return;

    try {
      await adminAPI.deleteProduct(productId);
      toast.success('Product deleted');
      if (selectedProduct?._id === productId) {
        resetForm();
      }
      queryClient.invalidateQueries(['admin-dashboard']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleMarkDelivered = async (order) => {
    if (order.status === 'delivered') return;
    const confirmed = window.confirm('Mark this order as delivered?');
    if (!confirmed) return;

    try {
      await adminAPI.updateOrderStatus(order.user.id, order.orderId, 'delivered');
      toast.success('Order marked delivered');
      queryClient.invalidateQueries(['admin-dashboard']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  const loadProductIntoForm = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || '',
      price: product.price || '',
      discount: product.discount?.toString() || '0',
      category: product.category || 'general',
      badge: product.badge || 'none',
      description: product.description || '',
      stock: product.stock?.toString() || '1',
      bgcolor: product.bgcolor || '#101a32',
      panelcolor: product.panelcolor || '#121c35',
      textcolor: product.textcolor || '#e8edf8',
    });
    setPreview(product.image || '');
    setImageFile(null);
  };

  const stats = data?.stats?.stats || {};
  const monthly = data?.stats?.monthlyRevenue || [];
  const topProducts = data?.stats?.topProducts || [];
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue || 0), 1);

  const logout = async () => {
    try { await authAPI.adminLogout(); } catch {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const CreateProductPanel = () => {
    const isEditing = Boolean(selectedProduct);

    const handleChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const handleImage = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      setSaving(true);
      try {
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value));
        if (imageFile) payload.append('image', imageFile);

        if (isEditing) {
          await adminAPI.updateProduct(selectedProduct._id, payload);
          toast.success('Product updated successfully');
        } else {
          await adminAPI.createProduct(payload);
          toast.success('Product created successfully');
        }

        resetForm();
        queryClient.invalidateQueries(['admin-dashboard']);
      } catch (err) {
        toast.error(err.response?.data?.message || (isEditing ? 'Update failed' : 'Create product failed'));
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="admin-panel" id="create-product">
        <div className="panel-title">
          <div>
            <p className="section-label">{isEditing ? 'Edit' : 'Create'}</p>
            <h2>{isEditing ? 'Update Product' : 'Add New Product'}</h2>
          </div>
          <FiPlus />
        </div>
        <form onSubmit={handleSubmit} className="admin-create-form">
          <div className="form-grid">
            <input className="input-luxury" placeholder="Product name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
            <input className="input-luxury" type="number" placeholder="Price" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required />
            <input className="input-luxury" type="number" placeholder="Discount" value={form.discount} onChange={(e) => handleChange('discount', e.target.value)} />
            <select className="input-luxury" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select className="input-luxury" value={form.badge} onChange={(e) => handleChange('badge', e.target.value)}>
              {BADGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input className="input-luxury" type="number" placeholder="Stock" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} />
            <input className="input-luxury" type="color" title="Background color" value={form.bgcolor} onChange={(e) => handleChange('bgcolor', e.target.value)} />
            <input className="input-luxury" type="color" title="Panel color" value={form.panelcolor} onChange={(e) => handleChange('panelcolor', e.target.value)} />
            <input className="input-luxury" type="color" title="Text color" value={form.textcolor} onChange={(e) => handleChange('textcolor', e.target.value)} />
          </div>
          <textarea className="input-luxury" rows="4" placeholder="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
          <label className="admin-file-upload">
            <input type="file" accept="image/*" onChange={handleImage} />
            <span><FiImage /> {imageFile ? 'Change image' : 'Upload product image'}</span>
          </label>
          {preview && <img src={preview} alt="Preview" className="admin-image-preview" />}
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <button type="submit" className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="btn-magnetic btn-outline" style={{ minWidth: '160px' }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  if (isLoading) {
    return <div className="admin-shell"><div className="route-loader"><div className="brand-icon">S</div><p>Loading Command</p></div></div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="brand-icon">S</span><span>Scatch</span></div>
        <nav>
          {['Overview', 'Products', 'Orders', 'Customers', 'Analytics'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
        <button onClick={logout}><FiLogOut /> Logout</button>
      </aside>

      <main className="admin-main">
        <motion.header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="admin-hero">
          <p className="section-label">Executive Dashboard</p>
          <h1>Scatch Command Center</h1>
          <p>Revenue, inventory, orders and customers, wrapped around your existing backend APIs.</p>
        </motion.header>

        <section className="admin-metrics">
          <MetricCard icon={FiDollarSign} label="Revenue" value={formatINR(stats.totalRevenue)} index={0} />
          <MetricCard icon={FiShoppingBag} label="Orders" value={stats.totalOrders || 0} tone="blue" index={1} />
          <MetricCard icon={FiBox} label="Products" value={stats.totalProducts || 0} tone="green" index={2} />
          <MetricCard icon={FiUsers} label="Customers" value={stats.totalUsers || 0} tone="pink" index={3} />
        </section>

        <section className="admin-grid">
          <CreateProductPanel />

          <div className="admin-panel" id="analytics">
            <div className="panel-title">
              <div><p className="section-label">Revenue</p><h2>Six Month Signal</h2></div>
              <FiTrendingUp />
            </div>
            <div className="bar-chart">
              {monthly.length === 0 ? <p className="muted">No revenue data yet</p> : monthly.map((item) => (
                <div key={`${item._id.year}-${item._id.month}`}>
                  <span style={{ height: `${Math.max(10, ((item.revenue || 0) / maxRevenue) * 100)}%` }} />
                  <small>{item._id.month}/{String(item._id.year).slice(-2)}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-panel" id="products">
          <div className="panel-title"><div><p className="section-label">Products</p><h2>Top Inventory</h2></div></div>
          <div className="admin-list">
            {topProducts.length === 0 ? (
              <p className="muted">No top products available yet</p>
            ) : topProducts.map((p) => (
              <div key={p._id} className="admin-row">
                {p.image ? <img src={p.image} alt={p.name} /> : <span className="row-thumb" />}
                <div><strong>{p.name}</strong><small>{p.totalSold || 0} sold</small></div>
                <b>{formatINR(p.price)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel" id="current-products">
          <div className="panel-title"><div><p className="section-label">Manage</p><h2>Current Products</h2></div></div>
          <div className="admin-list">
            {data?.products?.length === 0 ? (
              <p className="muted">No products available yet</p>
            ) : data.products.map((product) => (
              <div key={product._id} className="admin-row admin-product-row">
                {product.image ? <img src={product.image} alt={product.name} /> : <span className="row-thumb" />}
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.category || 'general'}</small>
                </div>
                <span className={`product-badge ${product.badge === 'none' ? 'product-badge-none' : ''}`}>
                  {product.badge === 'none' ? 'No Badge' : product.badge.replace('-', ' ').toUpperCase()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-magnetic btn-outline" style={{ padding: '.5rem .9rem', fontSize: '.8rem' }} onClick={() => loadProductIntoForm(product)}>
                    Edit
                  </button>
                  <button type="button" className="btn-magnetic btn-outline" style={{ padding: '.5rem .9rem', fontSize: '.8rem', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.35)' }} onClick={() => handleDeleteProduct(product._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel" id="orders">
          <div className="panel-title"><div><p className="section-label">Operations</p><h2>Recent Orders</h2></div></div>
          <div className="admin-table">
            <div className="admin-table-head"><span>Order</span><span>Customer</span><span>Products</span><span>Status</span><span>Total</span><span>Action</span></div>
            {(data?.orders || []).slice(0, 8).map((order) => {
              const purchasedProducts = (order.products || [])
                .map((item) => item.product?.name || item.name || 'Unnamed')
                .join(', ');

              return (
                <div key={order.orderId} className="admin-table-row">
                  <span>#{shortId(order.orderId)}</span>
                  <span>{order.user?.name || 'Customer'}</span>
                  <span className="order-products" title={purchasedProducts}>{purchasedProducts || 'No products'}</span>
                  <span className="status-pill ">{order.status}</span>
                  <span>{formatINR(order.totalAmount)}</span>
                  <span>
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(order)}
                      className="btn-magnetic btn-outline"
                      style={{
                        width: '100%', padding: '.5rem .75rem', fontSize: '.75rem',
                        opacity: order.status === 'delivered' ? 0.6 : 1,
                        cursor: order.status === 'delivered' ? 'not-allowed' : 'pointer',
                      }}
                      disabled={order.status === 'delivered'}
                    >
                      {order.status === 'delivered' ? 'Delivered' : 'Mark Delivered'}
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
