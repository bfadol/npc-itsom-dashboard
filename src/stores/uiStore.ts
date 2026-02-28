import { create } from 'zustand';

interface UIState {
  lang: 'en' | 'ar';
  toggleLang: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  lang: 'en',
  toggleLang: () => set((s) => ({ lang: s.lang === 'en' ? 'ar' : 'en' })),
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
