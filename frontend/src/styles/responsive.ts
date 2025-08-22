// Responsive design system with breakpoint utilities
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

// Container max-widths
export const containerMaxWidths = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// Responsive spacing scale
export const responsiveSpacing = {
  xs: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  sm: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  md: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  },
  lg: {
    xs: '1.5rem',
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '6rem',
  },
  xl: {
    xs: '2rem',
    sm: '3rem',
    md: '4rem',
    lg: '6rem',
    xl: '8rem',
  },
  '2xl': {
    xs: '3rem',
    sm: '4rem',
    md: '6rem',
    lg: '8rem',
    xl: '12rem',
  },
} as const;

// Responsive typography scale
export const responsiveTypography = {
  xs: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-medium',
    h4: 'text-base font-medium',
    h5: 'text-sm font-medium',
    h6: 'text-xs font-medium',
    body: 'text-sm',
    small: 'text-xs',
  },
  sm: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-medium',
    h4: 'text-lg font-medium',
    h5: 'text-base font-medium',
    h6: 'text-sm font-medium',
    body: 'text-base',
    small: 'text-sm',
  },
  md: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-medium',
    h4: 'text-xl font-medium',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
    body: 'text-lg',
    small: 'text-base',
  },
  lg: {
    h1: 'text-5xl font-bold',
    h2: 'text-4xl font-semibold',
    h3: 'text-3xl font-medium',
    h4: 'text-2xl font-medium',
    h5: 'text-xl font-medium',
    h6: 'text-lg font-medium',
    body: 'text-xl',
    small: 'text-lg',
  },
  xl: {
    h1: 'text-6xl font-bold',
    h2: 'text-5xl font-semibold',
    h3: 'text-4xl font-medium',
    h4: 'text-3xl font-medium',
    h5: 'text-2xl font-medium',
    h6: 'text-xl font-medium',
    body: 'text-2xl',
    small: 'text-xl',
  },
  '2xl': {
    h1: 'text-7xl font-bold',
    h2: 'text-6xl font-semibold',
    h3: 'text-5xl font-medium',
    h4: 'text-4xl font-medium',
    h5: 'text-3xl font-medium',
    h6: 'text-2xl font-medium',
    body: 'text-3xl',
    small: 'text-2xl',
  },
} as const;

// Grid system
export const gridSystem = {
  columns: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 12,
    '2xl': 12,
  },
  gutters: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem',
  },
} as const;

// Utility functions
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(mediaQueries[breakpoint].replace('@media ', '')).matches;
};

export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'lg';
  
  if (isBreakpoint('2xl')) return '2xl';
  if (isBreakpoint('xl')) return 'xl';
  if (isBreakpoint('lg')) return 'lg';
  if (isBreakpoint('md')) return 'md';
  if (isBreakpoint('sm')) return 'sm';
  return 'xs';
};

export const isMobile = (): boolean => {
  return getCurrentBreakpoint() === 'xs' || getCurrentBreakpoint() === 'sm';
};

export const isTablet = (): boolean => {
  return getCurrentBreakpoint() === 'md';
};

export const isDesktop = (): boolean => {
  return getCurrentBreakpoint() === 'lg' || getCurrentBreakpoint() === 'xl' || getCurrentBreakpoint() === '2xl';
};

// CSS-in-JS helpers
export const responsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T => {
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Find the closest breakpoint value
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return defaultValue;
};

// Export types
export type { Breakpoint };
