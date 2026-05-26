import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { productsAPI } from '../api/client';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const BRAND_LOGO = '/media/scatch-logo.png';
const HERO_VIDEO = '/media/scatch-hero.mp4';
const SHOWCASE_VIDEO = '/media/scatch-showcase.mp4';

// Three.js animated blob
function AnimatedBlob() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.15;
      mesh.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={mesh} args={[1.8, 100, 200]}>
        <MeshDistortMaterial
          color="#a89166"
          attach="material"
          distort={0.55}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          opacity={0.18}
          transparent
        />
      </Sphere>
    </Float>
  );
}

// Particle field
function Particles() {
  const points = useRef();
  const positions = new Float32Array(600).map(() => (Math.random() - 0.5) * 20);
  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.getElapsedTime() * 0.02;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a89166" transparent opacity={0.5} />
    </points>
  );
}

export default function HomePage() {
  const heroRef    = useRef(null);
  const headRef    = useRef(null);
  const subRef     = useRef(null);
  const ctaRef     = useRef(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);

  // Hero text entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: .2 });
    tl.from(headRef.current, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out' })
      .from(subRef.current,  { y: 40, opacity: 0, duration: .8,  ease: 'expo.out' }, '-=.6')
      .from(ctaRef.current,  { y: 30, opacity: 0, duration: .6,  ease: 'expo.out' }, '-=.4');
  }, []);

  // Product scroll animation — starts large, shrinks on scroll
  useEffect(() => {
    const cards = document.querySelectorAll('.product-card-scroll');
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { scale: 1.12, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 40%', scrub: false, once: true },
        }
      );
    });
  }, [featured]);

  // Fetch products
  useEffect(() => {
    productsAPI.getAll({ badge: 'featured', limit: 4 }).then(({ data }) => setFeatured(data.products || []));
    productsAPI.getAll({ badge: 'trending', limit: 4 }).then(({ data }) => setTrending(data.products || []));
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        
        {/* Three.js canvas background (subtle background element) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: .4 }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#a89166" />
            <AnimatedBlob />
            <Particles />
          </Canvas>
        </div>

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 2,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center', gap: '4rem',
          width: '100%', maxWidth: '1400px', margin: '0 auto',
          padding: '120px clamp(1rem, 5vw, 4rem) 60px'
        }}>
          
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'expo.out' }}
          >
            <p className="section-label" style={{ marginBottom: '1.5rem' }}>Premium Ecommerce</p>
            <h1 ref={headRef} className="hero-title">
              Discover <span className="grad-text">Luxury</span><br />Redefined
            </h1>
            <p ref={subRef} style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: '520px', lineHeight: 1.8, marginBottom: '3rem' }}>
              Curated collections. Exceptional quality. An experience crafted for those who appreciate the finer things in life.
            </p>
            <div ref={ctaRef} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn-magnetic btn-primary" style={{ textDecoration: 'none' }}>
                Explore Collection
              </Link>
              <Link to="/shop?badge=new-arrival" className="btn-magnetic btn-outline" style={{ textDecoration: 'none' }}>
                New Arrivals
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stat-row" style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
              {[['500+', 'Products'], ['10K+', 'Customers'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="hero-stat-value">{val}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.7rem', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Contained Video Media */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: 'expo.out' }}
            style={{ position: 'relative' }}
          >
            <div className="hero-video-card" style={{
              position: 'relative',
              borderRadius: '2rem',
              overflow: 'hidden',
              aspectRatio: '4/5',
              boxShadow: '0 40px 100px rgba(0,0,0,0.12)',
              border: '8px solid #ffffff',
              transform: 'rotate(2deg)'
            }}>
              <video 
                src={HERO_VIDEO} 
                autoPlay muted loop playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 40%)'
              }} />
            </div>
            
            {/* Decorative element */}
            <div style={{
              position: 'absolute', zIndex: -1,
              top: '-10%', right: '-10%', width: '120%', height: '120%',
              background: 'var(--accent-soft)', borderRadius: '3rem',
              transform: 'rotate(-4deg)'
            }} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
          <p style={{ fontSize: '.65rem', letterSpacing: '.2em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Scroll</p>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, var(--accent), transparent)' }} />
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      {/* ── Brand Film ────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--bg-primary)' }}>
        <div className="brand-film-container" style={{
          position: 'relative', maxWidth: '1400px', margin: '0 auto',
          borderRadius: '2.5rem', overflow: 'hidden', minHeight: '60vh',
          display: 'flex', alignItems: 'center', padding: '4rem clamp(1rem, 5vw, 4rem)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.08)'
        }}>
          <video
            className="brand-film"
            src={SHOWCASE_VIDEO}
            autoPlay muted loop playsInline
            style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', 
              objectFit: 'cover', zIndex: 0, opacity: 0.8
            }}
          />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.4) 60%, transparent)'
          }} />

          <div className="brand-film-copy" style={{ position: 'relative', zIndex: 2 }}>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Scatch Studio</p>
            <h2 className="section-heading" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Style in Motion</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Modern bags, sharp details, and everyday luxury shaped for the way you move. Crafted with obsession.
            </p>
            <div style={{ marginTop: '2.5rem' }}>
              <Link to="/shop" className="btn-magnetic btn-outline" style={{ textDecoration: 'none' }}>
                Shop the Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-marquee" aria-hidden="true">
        <div>
          {['SCATCH', 'CINEMATIC COMMERCE', 'LIMITED EDITS', 'LUXURY DAILY CARRY', 'INDIA'].map((item) => (
            <span key={item}>{item}</span>
          ))}
          {['SCATCH', 'CINEMATIC COMMERCE', 'LIMITED EDITS', 'LUXURY DAILY CARRY', 'INDIA'].map((item) => (
            <span key={`${item}-2`}>{item}</span>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section style={{ padding: '6rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label" style={{ marginBottom: '.75rem' }}>Handpicked</p>
            <h2 className="section-heading">Featured Products</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
            {featured.map((p) => (
              <div key={p._id} className="product-card-scroll">
                <ProductCard product={p} index={featured.indexOf(p)} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop?badge=featured" className="btn-magnetic btn-outline" style={{ textDecoration: 'none' }}>
              View All Featured
            </Link>
          </div>
        </section>
      )}

      {/* ── Categories banner ────────────────────────────── */}
      {/* ── Categories banner ────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label" style={{ marginBottom: '.75rem' }}>Curated</p>
          <h2 className="section-heading">Browse Collections</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {['Clothing', 'Footwear', 'Accessories', 'Electronics', 'Home', 'Beauty'].map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${cat.toLowerCase()}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="glass category-card" style={{
                borderRadius: '1.5rem', padding: '2rem 1rem',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all .4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'var(--accent)'; 
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 145, 102, 0.1)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'var(--border)'; 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.8 }}>
                  {cat === 'Clothing' && '👕'}
                  {cat === 'Footwear' && '👟'}
                  {cat === 'Accessories' && '👜'}
                  {cat === 'Electronics' && '⌚'}
                  {cat === 'Home' && '🏠'}
                  {cat === 'Beauty' && '✨'}
                </div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending ─────────────────────────────────────── */}
      {trending.length > 0 && (
        <section style={{ padding: '6rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label" style={{ marginBottom: '.75rem' }}>What's Hot</p>
            <h2 className="section-heading">Trending Now</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
            {trending.map((p) => (
              <div key={p._id} className="product-card-scroll">
                <ProductCard product={p} index={trending.indexOf(p)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA banner ───────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(168, 145, 102, 0.08) 0%, rgba(168, 145, 102, 0.04) 100%)',
          border: '1px solid rgba(168, 145, 102, 0.16)', borderRadius: '2rem', padding: '4rem 2rem',
        }}>
          <p className="section-label" style={{ marginBottom: '1rem' }}>Limited Time</p>
          <h2 className="section-heading" style={{ marginBottom: '1.5rem' }}>Exclusive Members Get<br /><span className="grad-text">20% Off</span> Everything</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.8 }}>
            Join thousands of satisfied customers. Create your account and unlock premium benefits.
          </p>
          <Link to="/register" className="btn-magnetic btn-primary" style={{ textDecoration: 'none' }}>
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
