import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cinematic "door opening" intro animation.
 * Two panels slide apart revealing the site.
 */
export default function DoorIntro({ onComplete }) {
  const leftRef   = useRef(null);
  const rightRef  = useRef(null);
  const logoRef   = useRef(null);
  const wrapRef   = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (wrapRef.current) wrapRef.current.style.display = 'none';
        onComplete?.();
      },
    });

    // Logo fades in
    tl.from(logoRef.current, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' })
      .to(logoRef.current,   { opacity: 0, y: -20, duration: 0.5, ease: 'power3.in' }, '+=0.6')
      // Doors slide apart
      .to(leftRef.current,  { xPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.1')
      .to(rightRef.current, { xPercent: 100,  duration: 1.2, ease: 'expo.inOut' }, '<');
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Left door */}
      <div ref={leftRef} className="door-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '2px' }}>
        <div style={{ width: '1px', height: '100%', background: 'linear-gradient(to bottom, transparent, #5b7dff, transparent)' }} />
      </div>

      {/* Right door */}
      <div ref={rightRef} className="door-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '2px' }}>
        <div style={{ width: '1px', height: '100%', background: 'linear-gradient(to bottom, transparent, #5b7dff, transparent)' }} />
      </div>

      {/* Center logo */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', zIndex: 10000,
        }}
      >
        <p style={{ fontSize: '.7rem', letterSpacing: '.3em', color: '#5b7dff', marginBottom: '.5rem', textTransform: 'uppercase' }}>
          Welcome to
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg,#5b7dff,#bfd2ff,#5b7dff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Scatch
        </h1>
        <p style={{ fontSize: '.75rem', letterSpacing: '.2em', color: 'var(--text-secondary)', marginTop: '.5rem', textTransform: 'uppercase' }}>
          Premium Experience
        </p>
      </div>
    </div>
  );
}

