import { useEffect, useState, useRef } from 'react';
import { usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { FiEdit2, FiCamera, FiSave, FiX } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser }       = useAuth();
  const [profile, setProfile]      = useState(null);
  const [loading, setLoading]      = useState(true);
  const [editing, setEditing]      = useState(false);
  const [form, setForm]            = useState({ fullname: '', contactnumber: '' });
  const [saving, setSaving]        = useState(false);
  const deliveredCount              = profile?.orders?.filter((order) => order.status === 'delivered').length || 0;
  const fileRef                    = useRef(null);

  useEffect(() => {
    usersAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.user);
        setForm({ fullname: data.user.fullname, contactnumber: data.user.contactnumber || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await usersAPI.updateProfile(form);
      setProfile(data.user);
      updateUser({ fullname: data.user.fullname });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('picture', file);
    try {
      const { data } = await usersAPI.uploadPicture(fd);
      setProfile((p) => ({ ...p, picture: data.picture }));
      updateUser({ picture: data.picture });
      toast.success('Picture updated!');
    } catch {
      toast.error('Failed to upload');
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spin" /></div>;

  const initials = profile?.fullname?.[0]?.toUpperCase();

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <p className="section-label" style={{ marginBottom: '.5rem' }}>Account</p>
        <h1 className="section-heading" style={{ marginBottom: '2.5rem' }}>My Profile</h1>

        <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem', marginBottom: '2rem' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile?.picture
                ? <img src={profile.picture} alt="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #5b7dff' }} />
                : <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#5b7dff,#bfd2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#0a0a0f', border: '3px solid rgba(91,125,255,.24)' }}>
                    {initials}
                  </div>
              }
              <button onClick={() => fileRef.current?.click()} style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#5b7dff', border: '2px solid #0a0a0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#0a0a0f', fontSize: '.85rem',
              }}>
                <FiCamera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePicture} style={{ display: 'none' }} />
            </div>

            {/* Info / Edit */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '.4rem' }}>Full Name</label>
                    <input className="input-luxury" value={form.fullname} onChange={(e) => setForm(f => ({ ...f, fullname: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '.4rem' }}>Phone Number</label>
                    <input className="input-luxury" value={form.contactnumber} onChange={(e) => setForm(f => ({ ...f, contactnumber: e.target.value }))} placeholder="+91 00000 00000" />
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button onClick={handleSave} disabled={saving} className="btn-magnetic btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-magnetic btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <FiX size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: '.4rem' }}>{profile?.fullname}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '.3rem' }}>{profile?.email}</p>
                  {profile?.contactnumber && <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{profile.contactnumber}</p>}
                  <button onClick={() => setEditing(true)} className="btn-magnetic btn-outline" style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <FiEdit2 size={14} /> Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            {[
              ['Orders',    profile?.orders?.length || 0],
              ['Delivered', deliveredCount],
              ['Wishlist',  profile?.wishlist?.length || 0],
              ['Cart Items', profile?.cart?.length || 0],
            ].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#5b7dff' }}>{val}</p>
                <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

