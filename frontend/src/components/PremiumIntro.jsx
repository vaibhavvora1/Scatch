import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';

export default function PremiumIntro() {
  const { introComplete, completeIntro } = useUIStore();

  return (
    <AnimatePresence>
      {!introComplete && (
        <motion.div
          className="premium-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          onAnimationComplete={(definition) => {
            if (definition?.opacity === 0) return;
          }}
        >
          <motion.div
            className="intro-door intro-door-left"
            initial={{ x: 0 }}
            animate={{ x: '-102%' }}
            transition={{ delay: 1.35, duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={completeIntro}
          />
          <motion.div
            className="intro-door intro-door-right"
            initial={{ x: 0 }}
            animate={{ x: '102%' }}
            transition={{ delay: 1.35, duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="intro-mark"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -12], scale: [0.96, 1, 1, 0.98] }}
            transition={{ duration: 1.55, times: [0, 0.32, 0.78, 1], ease: 'easeOut' }}
          >
            <span className="brand-icon">S</span>
            <span className="brand-word">Scatch</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
