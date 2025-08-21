import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { initializeTheme } from '@/store/slices/themeSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.theme);

  useEffect(() => {
    // Initialize theme from localStorage or default
    dispatch(initializeTheme());
  }, [dispatch]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Apply theme mode
    if (theme.mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme.mode);
    }

    // Apply theme color
    root.setAttribute('data-theme', theme.primaryColor.split('-')[0]); // Extract color name from 'blue-500'
  }, [theme.mode, theme.primaryColor]);

  return <>{children}</>;
}

export default ThemeProvider;
