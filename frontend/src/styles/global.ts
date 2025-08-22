// Global styles using CSS-in-JS
import { Global, css } from '@emotion/react';
import { lightTheme, darkTheme } from './theme';

// Global CSS variables for theme switching
const globalStyles = css`
  :root {
    /* Light theme variables */
    --color-primary-50: ${lightTheme.colors.primary[50]};
    --color-primary-100: ${lightTheme.colors.primary[100]};
    --color-primary-200: ${lightTheme.colors.primary[200]};
    --color-primary-300: ${lightTheme.colors.primary[300]};
    --color-primary-400: ${lightTheme.colors.primary[400]};
    --color-primary-500: ${lightTheme.colors.primary[500]};
    --color-primary-600: ${lightTheme.colors.primary[600]};
    --color-primary-700: ${lightTheme.colors.primary[700]};
    --color-primary-800: ${lightTheme.colors.primary[800]};
    --color-primary-900: ${lightTheme.colors.primary[900]};
    --color-primary-950: ${lightTheme.colors.primary[950]};
    
    --color-secondary-50: ${lightTheme.colors.secondary[50]};
    --color-secondary-100: ${lightTheme.colors.secondary[100]};
    --color-secondary-200: ${lightTheme.colors.secondary[200]};
    --color-secondary-300: ${lightTheme.colors.secondary[300]};
    --color-secondary-400: ${lightTheme.colors.secondary[400]};
    --color-secondary-500: ${lightTheme.colors.secondary[500]};
    --color-secondary-600: ${lightTheme.colors.secondary[600]};
    --color-secondary-700: ${lightTheme.colors.secondary[700]};
    --color-secondary-800: ${lightTheme.colors.secondary[800]};
    --color-secondary-900: ${lightTheme.colors.secondary[900]};
    --color-secondary-950: ${lightTheme.colors.secondary[950]};
    
    --color-gray-50: ${lightTheme.colors.gray[50]};
    --color-gray-100: ${lightTheme.colors.gray[100]};
    --color-gray-200: ${lightTheme.colors.gray[200]};
    --color-gray-300: ${lightTheme.colors.gray[300]};
    --color-gray-400: ${lightTheme.colors.gray[400]};
    --color-gray-500: ${lightTheme.colors.gray[500]};
    --color-gray-600: ${lightTheme.colors.gray[600]};
    --color-gray-700: ${lightTheme.colors.gray[700]};
    --color-gray-800: ${lightTheme.colors.gray[800]};
    --color-gray-900: ${lightTheme.colors.gray[900]};
    --color-gray-950: ${lightTheme.colors.gray[950]};
    
    --color-success-50: ${lightTheme.colors.success[50]};
    --color-success-100: ${lightTheme.colors.success[100]};
    --color-success-200: ${lightTheme.colors.success[200]};
    --color-success-300: ${lightTheme.colors.success[300]};
    --color-success-400: ${lightTheme.colors.success[400]};
    --color-success-500: ${lightTheme.colors.success[500]};
    --color-success-600: ${lightTheme.colors.success[600]};
    --color-success-700: ${lightTheme.colors.success[700]};
    --color-success-800: ${lightTheme.colors.success[800]};
    --color-success-900: ${lightTheme.colors.success[900]};
    --color-success-950: ${lightTheme.colors.success[950]};
    
    --color-warning-50: ${lightTheme.colors.warning[50]};
    --color-warning-100: ${lightTheme.colors.warning[100]};
    --color-warning-200: ${lightTheme.colors.warning[200]};
    --color-warning-300: ${lightTheme.colors.warning[300]};
    --color-warning-400: ${lightTheme.colors.warning[400]};
    --color-warning-500: ${lightTheme.colors.warning[500]};
    --color-warning-600: ${lightTheme.colors.warning[600]};
    --color-warning-700: ${lightTheme.colors.warning[700]};
    --color-warning-800: ${lightTheme.colors.warning[800]};
    --color-warning-900: ${lightTheme.colors.warning[900]};
    --color-warning-950: ${lightTheme.colors.warning[950]};
    
    --color-error-50: ${lightTheme.colors.error[50]};
    --color-error-100: ${lightTheme.colors.error[100]};
    --color-error-200: ${lightTheme.colors.error[200]};
    --color-error-300: ${lightTheme.colors.error[300]};
    --color-error-400: ${lightTheme.colors.error[400]};
    --color-error-500: ${lightTheme.colors.error[500]};
    --color-error-600: ${lightTheme.colors.error[600]};
    --color-error-700: ${lightTheme.colors.error[700]};
    --color-error-800: ${lightTheme.colors.error[800]};
    --color-error-900: ${lightTheme.colors.error[900]};
    --color-error-950: ${lightTheme.colors.error[950]};
    
    --color-info-50: ${lightTheme.colors.info[50]};
    --color-info-100: ${lightTheme.colors.info[100]};
    --color-info-200: ${lightTheme.colors.info[200]};
    --color-info-300: ${lightTheme.colors.info[300]};
    --color-info-400: ${lightTheme.colors.info[400]};
    --color-info-500: ${lightTheme.colors.info[500]};
    --color-info-600: ${lightTheme.colors.info[600]};
    --color-info-700: ${lightTheme.colors.info[700]};
    --color-info-800: ${lightTheme.colors.info[800]};
    --color-info-900: ${lightTheme.colors.info[900]};
    --color-info-950: ${lightTheme.colors.info[950]};
    
    /* Spacing variables */
    --spacing-xs: ${lightTheme.spacing.xs};
    --spacing-sm: ${lightTheme.spacing.sm};
    --spacing-md: ${lightTheme.spacing.md};
    --spacing-lg: ${lightTheme.spacing.lg};
    --spacing-xl: ${lightTheme.spacing.xl};
    --spacing-2xl: ${lightTheme.spacing['2xl']};
    --spacing-3xl: ${lightTheme.spacing['3xl']};
    --spacing-4xl: ${lightTheme.spacing['4xl']};
    --spacing-5xl: ${lightTheme.spacing['5xl']};
    --spacing-6xl: ${lightTheme.spacing['6xl']};
    --spacing-7xl: ${lightTheme.spacing['7xl']};
    --spacing-8xl: ${lightTheme.spacing['8xl']};
    --spacing-9xl: ${lightTheme.spacing['9xl']};
    
    /* Typography variables */
    --font-family-sans: ${lightTheme.typography.fontFamily.sans.join(', ')};
    --font-family-serif: ${lightTheme.typography.fontFamily.serif.join(', ')};
    --font-family-mono: ${lightTheme.typography.fontFamily.mono.join(', ')};
    
    --font-size-xs: ${lightTheme.typography.fontSize.xs};
    --font-size-sm: ${lightTheme.typography.fontSize.sm};
    --font-size-base: ${lightTheme.typography.fontSize.base};
    --font-size-lg: ${lightTheme.typography.fontSize.lg};
    --font-size-xl: ${lightTheme.typography.fontSize.xl};
    --font-size-2xl: ${lightTheme.typography.fontSize['2xl']};
    --font-size-3xl: ${lightTheme.typography.fontSize['3xl']};
    --font-size-4xl: ${lightTheme.typography.fontSize['4xl']};
    --font-size-5xl: ${lightTheme.typography.fontSize['5xl']};
    --font-size-6xl: ${lightTheme.typography.fontSize['6xl']};
    --font-size-7xl: ${lightTheme.typography.fontSize['7xl']};
    --font-size-8xl: ${lightTheme.typography.fontSize['8xl']};
    --font-size-9xl: ${lightTheme.typography.fontSize['9xl']};
    
    --font-weight-thin: ${lightTheme.typography.fontWeight.thin};
    --font-weight-extralight: ${lightTheme.typography.fontWeight.extralight};
    --font-weight-light: ${lightTheme.typography.fontWeight.light};
    --font-weight-normal: ${lightTheme.typography.fontWeight.normal};
    --font-weight-medium: ${lightTheme.typography.fontWeight.medium};
    --font-weight-semibold: ${lightTheme.typography.fontWeight.semibold};
    --font-weight-bold: ${lightTheme.typography.fontWeight.bold};
    --font-weight-extrabold: ${lightTheme.typography.fontWeight.extrabold};
    --font-weight-black: ${lightTheme.typography.fontWeight.black};
    
    --line-height-none: ${lightTheme.typography.lineHeight.none};
    --line-height-tight: ${lightTheme.typography.lineHeight.tight};
    --line-height-snug: ${lightTheme.typography.lineHeight.snug};
    --line-height-normal: ${lightTheme.typography.lineHeight.normal};
    --line-height-relaxed: ${lightTheme.typography.lineHeight.relaxed};
    --line-height-loose: ${lightTheme.typography.lineHeight.loose};
    
    /* Border radius variables */
    --radius-none: ${lightTheme.borderRadius.none};
    --radius-sm: ${lightTheme.borderRadius.sm};
    --radius-default: ${lightTheme.borderRadius.default};
    --radius-md: ${lightTheme.borderRadius.md};
    --radius-lg: ${lightTheme.borderRadius.lg};
    --radius-xl: ${lightTheme.borderRadius.xl};
    --radius-2xl: ${lightTheme.borderRadius['2xl']};
    --radius-3xl: ${lightTheme.borderRadius['3xl']};
    --radius-full: ${lightTheme.borderRadius.full};
    
    /* Shadow variables */
    --shadow-sm: ${lightTheme.shadows.sm};
    --shadow-default: ${lightTheme.shadows.default};
    --shadow-md: ${lightTheme.shadows.md};
    --shadow-lg: ${lightTheme.shadows.lg};
    --shadow-xl: ${lightTheme.shadows.xl};
    --shadow-2xl: ${lightTheme.shadows['2xl']};
    --shadow-inner: ${lightTheme.shadows.inner};
    --shadow-none: ${lightTheme.shadows.none};
    
    /* Transition variables */
    --transition-duration-75: ${lightTheme.transitions.duration[75]};
    --transition-duration-100: ${lightTheme.transitions.duration[100]};
    --transition-duration-150: ${lightTheme.transitions.duration[150]};
    --transition-duration-200: ${lightTheme.transitions.duration[200]};
    --transition-duration-300: ${lightTheme.transitions.duration[300]};
    --transition-duration-500: ${lightTheme.transitions.duration[500]};
    --transition-duration-700: ${lightTheme.transitions.duration[700]};
    --transition-duration-1000: ${lightTheme.transitions.duration[1000]};
    
    --transition-easing-linear: ${lightTheme.transitions.easing.linear};
    --transition-easing-in: ${lightTheme.transitions.easing.in};
    --transition-easing-out: ${lightTheme.transitions.easing.out};
    --transition-easing-inOut: ${lightTheme.transitions.easing.inOut};
    
    /* Breakpoint variables */
    --breakpoint-sm: ${lightTheme.breakpoints.sm};
    --breakpoint-md: ${lightTheme.breakpoints.md};
    --breakpoint-lg: ${lightTheme.breakpoints.lg};
    --breakpoint-xl: ${lightTheme.breakpoints.xl};
    --breakpoint-2xl: ${lightTheme.breakpoints['2xl']};
  }
  
  /* Dark theme variables */
  .dark {
    --color-gray-50: ${darkTheme.colors.gray[50]};
    --color-gray-100: ${darkTheme.colors.gray[100]};
    --color-gray-200: ${darkTheme.colors.gray[200]};
    --color-gray-300: ${darkTheme.colors.gray[300]};
    --color-gray-400: ${darkTheme.colors.gray[400]};
    --color-gray-500: ${darkTheme.colors.gray[500]};
    --color-gray-600: ${darkTheme.colors.gray[600]};
    --color-gray-700: ${darkTheme.colors.gray[700]};
    --color-gray-800: ${darkTheme.colors.gray[800]};
    --color-gray-900: ${darkTheme.colors.gray[900]};
    --color-gray-950: ${darkTheme.colors.gray[950]};
  }
  
  /* Base styles */
  * {
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-gray-900);
    background-color: var(--color-gray-50);
    transition: color 0.2s ease, background-color 0.2s ease;
  }
  
  /* Dark mode body styles */
  .dark body {
    color: var(--color-gray-100);
    background-color: var(--color-gray-900);
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 var(--spacing-md) 0;
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-gray-900);
  }
  
  .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
    color: var(--color-gray-100);
  }
  
  h1 { font-size: var(--font-size-4xl); }
  h2 { font-size: var(--font-size-3xl); }
  h3 { font-size: var(--font-size-2xl); }
  h4 { font-size: var(--font-size-xl); }
  h5 { font-size: var(--font-size-lg); }
  h6 { font-size: var(--font-size-base); }
  
  p {
    margin: 0 0 var(--spacing-md) 0;
    line-height: var(--line-height-relaxed);
  }
  
  a {
    color: var(--color-primary-600);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  a:hover {
    color: var(--color-primary-700);
    text-decoration: underline;
  }
  
  /* Lists */
  ul, ol {
    margin: 0 0 var(--spacing-md) 0;
    padding-left: var(--spacing-lg);
  }
  
  li {
    margin-bottom: var(--spacing-xs);
  }
  
  /* Forms */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }
  
  /* Focus styles */
  *:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
  
  /* Selection */
  ::selection {
    background-color: var(--color-primary-200);
    color: var(--color-primary-900);
  }
  
  .dark ::selection {
    background-color: var(--color-primary-800);
    color: var(--color-primary-100);
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
