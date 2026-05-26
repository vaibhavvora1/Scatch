import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiImage } from 'react-icons/fi';
import { sellerAPI } from '../api/client';

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    shopDescription: '',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await sellerAPI.getProfile();
      setProfile(data);
      setForm({
        shopDescription: data.shopDescription || '',
        contactNumber: data.contactNumber || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
      if (data.shopLogo) {
        setLogoPreview(data.shopLogo);
      }
    } catch (error) {
      toast.error('Error loading profile');
      navigate('/seller-dashboard');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setLogoPreview(evt.target.result);
        setForm({ ...form, shopLogo: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sellerAPI.updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '120px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}
      >
        {/* Header */}
        <button
          onClick={() => navigate('/seller-dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#5b7dff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <p className="section-label">Settings</p>
          <h1 className="section-heading">Edit Your Shop</h1>
        </div>

        {/* Profile Card */}
        <motion.div
          className="glass"
          style={{ borderRadius: '1.25rem', padding: '2rem', marginBottom: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#eee',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Shop Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiImage size={32} color="#999" />
              )}
            </div>

            <div>
              <h2 style={{ margin: '0 0 .5rem 0' }}>{profile.shopName}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 .5rem 0' }}>{profile.email}</p>
              <p style={{ color: '#34d399', margin: 0, fontWeight: 600 }}>✓ Verified Seller</p>
            </div>
          </div>

          {/* Shop Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(91,125,255,0.1)',
                borderRadius: '0.75rem',
                textAlign: 'center',
              }}
            >
              <strong style={{ fontSize: '1.5rem', color: '#5b7dff', display: 'block' }}>
                {profile.totalProducts}
              </strong>
              <small style={{ color: 'var(--text-secondary)' }}>Products</small>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(52,211,153,0.1)',
                borderRadius: '0.75rem',
                textAlign: 'center',
              }}
            >
              <strong style={{ fontSize: '1.5rem', color: '#34d399', display: 'block' }}>
                {profile.totalSold}
              </strong>
              <small style={{ color: 'var(--text-secondary)' }}>Sold</small>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(251,191,36,0.1)',
                borderRadius: '0.75rem',
                textAlign: 'center',
              }}
            >
              <strong style={{ fontSize: '1.5rem', color: '#fbbf24', display: 'block' }}>
                {profile.rating.toFixed(1)}⭐
              </strong>
              <small style={{ color: 'var(--text-secondary)' }}>Rating</small>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass"
          style={{ borderRadius: '1.25rem', padding: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Logo Upload */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '.75rem', fontWeight: 600, fontSize: '.9rem' }}>
              Shop Logo
            </label>
            <label className="admin-file-upload">
              <FiImage /> Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '.75rem', fontWeight: 600, fontSize: '.9rem' }}>
              Shop Description
            </label>
            <textarea
              className="input-luxury"
              rows="4"
              value={form.shopDescription}
              onChange={(e) => setForm({ ...form, shopDescription: e.target.value })}
              placeholder="Tell customers about your shop..."
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <input
              className="input-luxury"
              type="tel"
              placeholder="Contact Number"
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            />
            <input
              className="input-luxury"
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
            <input
              className="input-luxury"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              className="input-luxury"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: '2rem' }}>
            <textarea
              className="input-luxury"
              rows="2"
              placeholder="Full Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-magnetic btn-primary"
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
