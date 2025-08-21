import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  headerHeight: number;
  borderRadius: number;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
}

// Initial state
const initialState: ThemeState = {
  mode: (localStorage.getItem('theme') as ThemeMode) || 'system',
  isDark: false,
  primaryColor: '#3B82F6', // Blue
  accentColor: '#10B981', // Green
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  sidebarWidth: 280,
  headerHeight: 64,
  borderRadius: 8,
  fontSize: (localStorage.getItem('fontSize') as ThemeState['fontSize']) || 'medium',
  animations: localStorage.getItem('animations') !== 'false',
};

// Theme slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // Update isDark based on mode
      if (action.payload === 'system') {
        state.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        state.isDark = action.payload === 'dark';
      }
      
      // Apply theme to document
      document.documentElement.classList.toggle('dark', state.isDark);
    },
    toggleTheme: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      state.isDark = newMode === 'dark';
      localStorage.setItem('theme', newMode);
      document.documentElement.classList.toggle('dark', state.isDark);
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
      localStorage.setItem('primaryColor', action.payload);
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
      localStorage.setItem('accentColor', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString());
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', action.payload.toString());
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = action.payload;
    },
    setHeaderHeight: (state, action: PayloadAction<number>) => {
      state.headerHeight = action.payload;
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload;
      localStorage.setItem('borderRadius', action.payload.toString());
    },
    setFontSize: (state, action: PayloadAction<ThemeState['fontSize']>) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
      localStorage.setItem('animations', state.animations.toString());
    },
    setAnimations: (state, action: PayloadAction<boolean>) => {
      state.animations = action.payload;
      localStorage.setItem('animations', action.payload.toString());
    },
    resetTheme: (state) => {
      state.mode = 'system';
      state.primaryColor = '#3B82F6';
      state.accentColor = '#10B981';
      state.sidebarCollapsed = false;
      state.borderRadius = 8;
      state.fontSize = 'medium';
      state.animations = true;
      
      // Clear localStorage
      localStorage.removeItem('theme');
      localStorage.removeItem('primaryColor');
      localStorage.removeItem('accentColor');
      localStorage.removeItem('sidebarCollapsed');
      localStorage.removeItem('borderRadius');
      localStorage.removeItem('fontSize');
      localStorage.removeItem('animations');
      
      // Reset document classes
      document.documentElement.classList.remove('dark');
    },
    initializeTheme: (state) => {
      // Load saved values from localStorage
      const savedTheme = localStorage.getItem('theme') as ThemeMode;
      const savedPrimaryColor = localStorage.getItem('primaryColor');
      const savedAccentColor = localStorage.getItem('accentColor');
      const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
      const savedBorderRadius = localStorage.getItem('borderRadius');
      const savedFontSize = localStorage.getItem('fontSize');
      const savedAnimations = localStorage.getItem('animations');
      
      if (savedTheme) state.mode = savedTheme;
      if (savedPrimaryColor) state.primaryColor = savedPrimaryColor;
      if (savedAccentColor) state.accentColor = savedAccentColor;
      if (savedSidebarCollapsed !== null) {
        state.sidebarCollapsed = savedSidebarCollapsed === 'true';
      }
      if (savedBorderRadius) state.borderRadius = parseInt(savedBorderRadius);
      if (savedFontSize) state.fontSize = savedFontSize as ThemeState['fontSize'];
      if (savedAnimations !== null) {
        state.animations = savedAnimations === 'true';
      }
      
      // Set initial dark mode
      if (state.mode === 'system') {
        state.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        state.isDark = state.mode === 'dark';
      }
      
      // Apply theme to document
      document.documentElement.classList.toggle('dark', state.isDark);
    },
  },
});

export const {
  setThemeMode,
  toggleTheme,
  setPrimaryColor,
  setAccentColor,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarWidth,
  setHeaderHeight,
  setBorderRadius,
  setFontSize,
  toggleAnimations,
  setAnimations,
  resetTheme,
  initializeTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
