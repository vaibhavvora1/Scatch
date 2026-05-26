import { create } from 'zustand';

export const useUIStore = create((set) => ({
  introComplete: sessionStorage.getItem('scatch-intro-complete') === 'true',
  completeIntro: () => {
    sessionStorage.setItem('scatch-intro-complete', 'true');
    set({ introComplete: true });
  },
}));
