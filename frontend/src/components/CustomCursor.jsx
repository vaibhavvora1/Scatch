import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Premium Animated Custom Cursor
 * Features:
 * - Elastic trailing ring
 * - Reactive center dot
 * - Click pulse animation
 * - Sophisticated hover states
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot    = dotRef.current;
    const ring   = ringRef.current;
    if (!cursor || !dot || !ring) return;

    // State
    const mouse = { x: 0, y: 0 };
    const pos   = { x: 0, y: 0 };
    const ratio = 0.15;

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Instant dot move
      gsap.to(dot, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const onMouseDown = () => {
      gsap.to(dot, { scale: 1.5, duration: 0.1 });
      gsap.to(ring, { scale: 0.5, opacity: 0.8, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
    };

    // Hover effects (Simplified - removed expansion)
    const onMouseEnter = () => {
      gsap.to(ring, {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(ring, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.in'
      });
    };

    // Smooth ring follow loop
    const render = () => {
      pos.x += (mouse.x - pos.x) * ratio;
      pos.y += (mouse.y - pos.y) * ratio;
      
      gsap.set(ring, { x: pos.x, y: pos.y });
      requestAnimationFrame(render);
    };

    const ticker = requestAnimationFrame(render);

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const refreshHovers = () => {
      const hoverables = document.querySelectorAll('a, button, [data-cursor="hover"], .btn-magnetic');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });
    };

    refreshHovers();
    
    // Observer for dynamic content
    const observer = new MutationObserver(refreshHovers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(ticker);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor-container pointer-events-none hidden md:block">
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}
