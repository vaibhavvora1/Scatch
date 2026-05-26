import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import { sellerAPI } from '../api/client';

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: info, 2: review, 3: confirmation
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    shopName: '',
    shopDescription: '',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await sellerAPI.getProfile();
      setProfile(data);
      setForm(data);

      // Redirect to dashboard if already approved
      if (data.status === 'approved') {
        navigate('/seller-dashboard');
      }
    } catch (error) {
      // Not a seller yet, stay on onboarding
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile) {
        // Update existing seller
        await sellerAPI.updateProfile(form);
        toast.success('Profile updated!');
      } else {
        // Register as new seller
        await sellerAPI.register(form);
        toast.success('Seller application submitted! Please wait for admin approval.');
        setStep(3);
      }
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.status === 'approved') {
    navigate('/seller-dashboard');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '120px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label" style={{ marginBottom: '.5rem' }}>Seller Program</p>
          <h1 className="section-heading">Become a Seller</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Join thousands of sellers on our platform
          </p>
        </div>

        {/* Status Card */}
        {profile && (
          <motion.div
            className="glass"
            style={{
              borderRadius: '1.25rem',
              padding: '2rem',
              marginBottom: '2rem',
              borderLeftWidth: '4px',
              borderLeftStyle: 'solid',
              borderLeftColor:
                profile.status === 'approved'
                  ? '#34d399'
                  : profile.status === 'rejected'
                  ? '#f87171'
                  : '#fbbf24',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {profile.status === 'approved' && (
                <FiCheckCircle style={{ fontSize: '2rem', color: '#34d399' }} />
              )}
              {profile.status === 'rejected' && (
                <FiAlertCircle style={{ fontSize: '2rem', color: '#f87171' }} />
              )}
              {profile.status === 'pending' && (
                <FiClock style={{ fontSize: '2rem', color: '#fbbf24' }} />
              )}

              <div>
                <h3 style={{ margin: '0 0 .5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                  {profile.status === 'approved' && '✓ Account Approved'}
                  {profile.status === 'pending' && '⏳ Under Review'}
                  {profile.status === 'rejected' && '✗ Application Rejected'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '.9rem' }}>
                  {profile.status === 'approved' && 'Your seller account is active!'}
                  {profile.status === 'pending' && 'Admin is reviewing your application. This usually takes 1-2 business days.'}
                  {profile.status === 'rejected' &&
                    'Please review the requirements and reapply with correct information.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass"
          style={{ borderRadius: '1.25rem', padding: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <input
              className="input-luxury"
              placeholder="Shop Name *"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              required
            />

            <input
              className="input-luxury"
              type="tel"
              placeholder="Contact Number"
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
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

            <input
              className="input-luxury"
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />

            <input
              className="input-luxury"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <textarea
            className="input-luxury"
            placeholder="Shop Description (150-500 characters)"
            rows="4"
            value={form.shopDescription}
            onChange={(e) => setForm({ ...form, shopDescription: e.target.value })}
            style={{ marginBottom: '2rem' }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-magnetic btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: '.5rem',
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Submitting...' : 'Submit Application'} {!loading && <FiArrowRight />}
          </button>
        </motion.form>

        {/* Confirmation */}
        {step === 3 && (
          <motion.div
            className="glass"
            style={{
              borderRadius: '1.25rem',
              padding: '2rem',
              marginTop: '2rem',
              textAlign: 'center',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <h2 style={{ marginBottom: '1rem' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Thank you for applying. Our team will review your application within 1-2 business days.
              We'll send you an email with the decision.
            </p>
            <button
              className="btn-magnetic btn-outline"
              onClick={() => navigate('/shop')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
            >
              Back to Shop <FiArrowRight />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
