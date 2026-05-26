import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiLogOut,
  FiAlertCircle,
} from 'react-icons/fi';
import { sellerAPI, authAPI } from '../api/client';
import { formatINR } from '../utils/format';

function MetricCard({ icon: Icon, label, value, index }) {
  return (
    <motion.div
      className="admin-metric"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="metric-icon blue">
        <Icon />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
    </motion.div>
  );
}

function ProductRow({ product, onEdit, onDelete }) {
  return (
    <motion.div
      className="admin-table-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr 0.8fr auto', gap: '1rem', alignItems: 'center' }}
    >
      <div style={{ width: '50px', height: '50px', borderRadius: '0.5rem', overflow: 'hidden', background: '#eee' }}>
        {product.image && product.image.startsWith('data:') ? (
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <FiImage color="#999" />
          </div>
        )}
      </div>

      <div>
        <strong style={{ display: 'block' }}>{product.name}</strong>
        <small style={{ color: 'var(--text-secondary)' }}>{product.category}</small>
      </div>

      <div>
        <strong style={{ color: '#5b7dff' }}>{formatINR(product.price)}</strong>
        {product.discount > 0 && <small style={{ display: 'block', color: '#34d399' }}>-{product.discount}%</small>}
      </div>

      <div>
        <strong>{product.stock}</strong>
        <small style={{ display: 'block', color: 'var(--text-secondary)' }}>in stock</small>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onEdit(product)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(91,125,255,0.1)',
            color: '#5b7dff',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <FiEdit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(product._id)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(248,113,113,0.1)',
            color: '#f87171',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    stock: '1',
    category: 'general',
    image: '',
    bgcolor: '#ffffff',
    panelcolor: '#000000',
    textcolor: '#ffffff',
  });
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await sellerAPI.getMyProducts();
      return response.data;
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await sellerAPI.getProfile();
      if (data.status !== 'approved') {
        navigate('/seller-onboarding');
      }
      setProfile(data);
    } catch (error) {
      navigate('/seller-onboarding');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        setForm({ ...form, image: base64 });
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setForm({
      name: '',
      description: '',
      price: '',
      discount: '0',
      stock: '1',
      category: 'general',
      image: '',
      bgcolor: '#ffffff',
      panelcolor: '#000000',
      textcolor: '#ffffff',
    });
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedProduct) {
        await sellerAPI.updateProduct(selectedProduct._id, form);
        toast.success('Product updated!');
      } else {
        await sellerAPI.createProduct(form);
        toast.success('Product created!');
      }

      queryClient.invalidateQueries(['seller-products']);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await sellerAPI.deleteProduct(productId);
      toast.success('Product deleted');
      queryClient.invalidateQueries(['seller-products']);
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image,
      bgcolor: product.bgcolor,
      panelcolor: product.panelcolor,
      textcolor: product.textcolor,
    });
    if (product.image) setPreview(product.image);
  };

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spin" />
      </div>
    );
  }

  return (
    <div className="admin-shell" style={{ gridTemplateColumns: '260px 1fr', paddingTop: '0' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ background: 'rgba(14, 24, 48, 0.96)', top: '90px', height: 'auto' }}>
        <div
          className="admin-brand"
          style={{ cursor: 'pointer', color: '#5b7dff', marginBottom: '1rem' }}
          onClick={() => navigate('/')}
        >
          🛍️ Scatch
        </div>

        <div>
          <p style={{ fontSize: '.75rem', color: 'var(--text-secondary)', marginBottom: '.5rem', textTransform: 'uppercase' }}>
            Your Shop
          </p>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{profile.shopName}</h3>
          <small style={{ color: '#34d399' }}>✓ Verified Seller</small>
        </div>

        <button
          onClick={() => navigate('/seller-profile')}
          style={{
            width: '100%',
            padding: '.8rem',
            borderRadius: '.8rem',
            border: 0,
            background: 'rgba(91,125,255,0.16)',
            color: '#5b7dff',
            cursor: 'pointer',
            fontWeight: 600,
            textAlign: 'left',
            marginTop: '1rem',
          }}
        >
          Edit Profile
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '.8rem',
            borderRadius: '.8rem',
            border: 0,
            background: 'transparent',
            color: '#f87171',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            marginTop: '1rem',
          }}
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main" style={{ paddingTop: '90px' }}>
        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}
        >
          <MetricCard
            icon={FiBox}
            label="Total Products"
            value={profile.totalProducts}
            index={0}
          />
          <MetricCard
            icon={FiDollarSign}
            label="Total Revenue"
            value={formatINR(profile.totalRevenue)}
            index={1}
          />
          <MetricCard
            icon={FiTrendingUp}
            label="Units Sold"
            value={profile.totalSold}
            index={2}
          />
          <MetricCard
            icon={FiTrendingUp}
            label="Rating"
            value={profile.rating ? `${profile.rating.toFixed(1)}⭐` : 'N/A'}
            index={3}
          />
        </motion.div>

        {/* Create Product Form */}
        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginTop: '2rem' }}
        >
          <div className="panel-title">
            <div>
              <p className="section-label">{selectedProduct ? 'Edit' : 'Create'}</p>
              <h2>{selectedProduct ? 'Update Product' : 'Add New Product'}</h2>
            </div>
            <FiPlus />
          </div>

          <form onSubmit={handleSubmit} className="admin-create-form">
            <div className="form-grid">
              <input
                className="input-luxury"
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input-luxury"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                className="input-luxury"
                type="number"
                placeholder="Discount %"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
              <input
                className="input-luxury"
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <select
                className="input-luxury"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="clothing">Clothing</option>
                <option value="footwear">Footwear</option>
                <option value="accessories">Accessories</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>

            <textarea
              className="input-luxury"
              placeholder="Product description"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ marginBottom: '1rem' }}
            />

            {/* Image Upload */}
            <label className="admin-file-upload" style={{ marginBottom: '1rem' }}>
              <FiImage /> Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="admin-image-preview"
                style={{ marginBottom: '1rem' }}
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-magnetic btn-primary"
                style={{ flex: 1, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : selectedProduct ? 'Update Product' : 'Add Product'}
              </button>
              {selectedProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-magnetic btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Products List */}
        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '2rem' }}
        >
          <div className="panel-title">
            <div>
              <h2>{productsData?.total || 0} Products Listed</h2>
            </div>
          </div>

          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spin" />
            </div>
          ) : productsData?.products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <p>No products yet. Create your first product!</p>
            </div>
          ) : (
            <div className="admin-list" style={{ marginTop: '1rem' }}>
              {productsData.products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
