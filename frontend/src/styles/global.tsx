import React from 'react';
import { Global } from '@emotion/react';

const globalStyles = `
  /* CSS Variables for Theme System */
  :root {
    /* Colors */
    --color-primary-50: #eff6ff;
    --color-primary-100: #dbeafe;
    --color-primary-200: #bfdbfe;
    --color-primary-300: #93c5fd;
    --color-primary-400: #60a5fa;
    --color-primary-500: #3b82f6;
    --color-primary-600: #2563eb;
    --color-primary-700: #1d4ed8;
    --color-primary-800: #1e40af;
    --color-primary-900: #1e3a8a;
    --color-primary-950: #172554;

    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e5e7eb;
    --color-gray-300: #d1d5db;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-700: #374151;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;
    --color-gray-950: #030712;

    --color-success-50: #f0fdf4;
    --color-success-100: #dcfce7;
    --color-success-200: #bbf7d0;
    --color-success-300: #86efac;
    --color-success-400: #4ade80;
    --color-success-500: #22c55e;
    --color-success-600: #16a34a;
    --color-success-700: #15803d;
    --color-success-800: #166534;
    --color-success-900: #14532d;
    --color-success-950: #052e16;

    --color-warning-50: #fffbeb;
    --color-warning-100: #fef3c7;
    --color-warning-200: #fde68a;
    --color-warning-300: #fcd34d;
    --color-warning-400: #fbbf24;
    --color-warning-500: #f59e0b;
    --color-warning-600: #d97706;
    --color-warning-700: #b45309;
    --color-warning-800: #92400e;
    --color-warning-900: #78350f;
    --color-warning-950: #451a03;

    --color-error-50: #fef2f2;
    --color-error-100: #fee2e2;
    --color-error-200: #fecaca;
    --color-error-300: #fca5a5;
    --color-error-400: #f87171;
    --color-error-500: #ef4444;
    --color-error-600: #dc2626;
    --color-error-700: #b91c1c;
    --color-error-800: #991b1b;
    --color-error-900: #7f1d1d;
    --color-error-950: #450a0a;

    /* Typography */
    --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    --font-size-6xl: 3.75rem;
    
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;
    
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;

    /* Spacing */
    --spacing-0: 0;
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    --spacing-24: 6rem;
    --spacing-32: 8rem;
    --spacing-40: 10rem;
    --spacing-48: 12rem;
    --spacing-56: 14rem;
    --spacing-64: 16rem;

    /* Border Radius */
    --radius-none: 0;
    --radius-sm: 0.125rem;
    --radius-base: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 250ms ease-in-out;
    --transition-slow: 350ms ease-in-out;
    --transition-slower: 500ms ease-in-out;

    /* Z-Index */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    --z-toast: 1080;
  }

  /* Dark Mode Variables */
  .dark {
    --color-gray-50: #030712;
    --color-gray-100: #111827;
    --color-gray-200: #1f2937;
    --color-gray-300: #374151;
    --color-gray-400: #4b5563;
    --color-gray-500: #6b7280;
    --color-gray-600: #9ca3af;
    --color-gray-700: #d1d5db;
    --color-gray-800: #e5e7eb;
    --color-gray-900: #f3f4f6;
    --color-gray-950: #f9fafb;
  }

  /* Base Styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-gray-900);
    background-color: var(--color-gray-50);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .dark body {
    color: var(--color-gray-100);
    background-color: var(--color-gray-900);
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-gray-900);
  }

  .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
    color: var(--color-gray-100);
  }

  h1 {
    font-size: var(--font-size-4xl);
  }

  h2 {
    font-size: var(--font-size-3xl);
  }

  h3 {
    font-size: var(--font-size-2xl);
  }

  h4 {
    font-size: var(--font-size-xl);
  }

  h5 {
    font-size: var(--font-size-lg);
  }

  h6 {
    font-size: var(--font-size-base);
  }

  p {
    margin: 0 0 var(--spacing-4) 0;
    color: var(--color-gray-700);
  }

  .dark p {
    color: var(--color-gray-300);
  }

  a {
    color: var(--color-primary-600);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-primary-700);
  }

  .dark a {
    color: var(--color-primary-400);
  }

  .dark a:hover {
    color: var(--color-primary-300);
  }

  /* Lists */
  ul, ol {
    margin: 0 0 var(--spacing-4) 0;
    padding-left: var(--spacing-6);
  }

  li {
    margin-bottom: var(--spacing-2);
    color: var(--color-gray-700);
  }

  .dark li {
    color: var(--color-gray-300);
  }

  /* Forms */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  /* Focus Styles */
  :focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-gray-100);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-gray-300);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-400);
  }

  .dark ::-webkit-scrollbar-track {
    background: var(--color-gray-800);
  }

  .dark ::-webkit-scrollbar-thumb {
    background: var(--color-gray-600);
  }

  .dark ::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    
    a, a:visited {
      text-decoration: underline;
    }
    
    a[href]:after {
      content: " (" attr(href) ")";
    }
    
    abbr[title]:after {
      content: " (" attr(title) ")";
    }
    
    pre, blockquote {
      border: 1px solid #999;
      page-break-inside: avoid;
    }
    
    thead {
      display: table-header-group;
    }
    
    tr, img {
      page-break-inside: avoid;
    }
    
    img {
      max-width: 100% !important;
    }
    
    p, h2, h3 {
      orphans: 3;
      widows: 3;
    }
    
    h2, h3 {
      page-break-after: avoid;
    }
  }
`;

export const GlobalStyles: React.FC = () => {
  return <Global styles={globalStyles} />;
};

export default GlobalStyles;
