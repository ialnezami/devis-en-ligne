// CSS-in-JS solution with styled components and theme integration
import { css, keyframes } from '@emotion/react';
import { lightTheme, type Theme } from './theme';

// Emotion CSS-in-JS utilities
export const styled = {
  // Base styles
  base: css`
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  `,
  
  // Layout utilities
  flex: (direction: 'row' | 'column' = 'row', align: string = 'center', justify: string = 'flex-start') => css`
    display: flex;
    flex-direction: ${direction};
    align-items: ${align};
    justify-content: ${justify};
  `,
  
  grid: (columns: number | string = 1, gap: string = '1rem') => css`
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap};
  `,
  
  center: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  // Spacing utilities
  padding: (size: keyof Theme['spacing'] | string) => css`
    padding: ${typeof size === 'string' ? size : lightTheme.spacing[size]};
  `,
  
  margin: (size: keyof Theme['spacing'] | string) => css`
    margin: ${typeof size === 'string' ? size : lightTheme.spacing[size]};
  `,
  
  // Typography utilities
  text: (size: keyof Theme['typography']['fontSize'] | string, weight?: keyof Theme['typography']['fontWeight']) => css`
    font-size: ${typeof size === 'string' ? size : lightTheme.typography.fontSize[size]};
    font-weight: ${weight ? lightTheme.typography.fontWeight[weight] : 'inherit'};
    line-height: ${lightTheme.typography.lineHeight.normal};
  `,
  
  heading: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const sizes = {
      1: lightTheme.typography.fontSize['4xl'],
      2: lightTheme.typography.fontSize['3xl'],
      3: lightTheme.typography.fontSize['2xl'],
      4: lightTheme.typography.fontSize.xl,
      5: lightTheme.typography.fontSize.lg,
      6: lightTheme.typography.fontSize.base,
    };
    
    return css`
      font-size: ${sizes[level]};
      font-weight: ${level <= 3 ? lightTheme.typography.fontWeight.bold : lightTheme.typography.fontWeight.semibold};
      line-height: ${lightTheme.typography.lineHeight.tight};
      margin-bottom: ${lightTheme.spacing.md};
    `;
  },
  
  // Color utilities
  color: (color: keyof Theme['colors'], shade: keyof Theme['colors']['primary'] = '500') => css`
    color: ${lightTheme.colors[color][shade]};
  `,
  
  bgColor: (color: keyof Theme['colors'], shade: keyof Theme['colors']['primary'] = '500') => css`
    background-color: ${lightTheme.colors[color][shade]};
  `,
  
  // Border utilities
  border: (width: string = '1px', style: string = 'solid', color: keyof Theme['colors'] = 'gray', shade: keyof Theme['colors']['primary'] = '300') => css`
    border: ${width} ${style} ${lightTheme.colors[color][shade]};
  `,
  
  borderRadius: (radius: keyof Theme['borderRadius'] | string) => css`
    border-radius: ${typeof radius === 'string' ? radius : lightTheme.borderRadius[radius]};
  `,
  
  // Shadow utilities
  shadow: (level: keyof Theme['shadows'] | string) => css`
    box-shadow: ${typeof level === 'string' ? level : lightTheme.shadows[level]};
  `,
  
  // Transition utilities
  transition: (property: string = 'all', duration: keyof Theme['transitions']['duration'] | string = '200', easing: keyof Theme['transitions']['easing'] = 'inOut') => css`
    transition: ${property} ${typeof duration === 'string' ? duration : lightTheme.transitions.duration[duration]} ${lightTheme.transitions.easing[easing]};
  `,
  
  // Responsive utilities
  responsive: (breakpoint: keyof Theme['breakpoints'], styles: any) => css`
    @media (min-width: ${lightTheme.breakpoints[breakpoint]}) {
      ${styles}
    }
  `,
  
  // Hover and focus states
  hover: (styles: any) => css`
    &:hover {
      ${styles}
    }
  `,
  
  focus: (styles: any) => css`
    &:focus {
      ${styles}
    }
  `,
  
  active: (styles: any) => css`
    &:active {
      ${styles}
    }
  `,
  
  disabled: (styles: any) => css`
    &:disabled {
      ${styles}
    }
  `,
  
  // Dark mode support
  dark: (styles: any) => css`
    @media (prefers-color-scheme: dark) {
      ${styles}
    }
  `,
  
  // Print styles
  print: (styles: any) => css`
    @media print {
      ${styles}
    }
  `,
};

// Keyframe animations
export const animations = {
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,
  
  slideInUp: keyframes`
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  
  slideInDown: keyframes`
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  
  slideInLeft: keyframes`
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  
  slideInRight: keyframes`
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  
  scaleIn: keyframes`
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  
  rotate: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,
  
  bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  `,
  
  pulse: keyframes`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  `,
  
  shake: keyframes`
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-10px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(10px);
    }
  `,
};

// Common component styles
export const componentStyles = {
  button: {
    base: css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: ${lightTheme.borderRadius.md};
      font-weight: ${lightTheme.typography.fontWeight.medium};
      cursor: pointer;
      transition: all ${lightTheme.transitions.duration[200]} ${lightTheme.transitions.easing.inOut};
      
      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `,
    
    primary: css`
      background-color: ${lightTheme.colors.primary[500]};
      color: white;
      
      &:hover:not(:disabled) {
        background-color: ${lightTheme.colors.primary[600]};
      }
      
      &:active:not(:disabled) {
        background-color: ${lightTheme.colors.primary[700]};
      }
    `,
    
    secondary: css`
      background-color: ${lightTheme.colors.secondary[100]};
      color: ${lightTheme.colors.secondary[800]};
      border: 1px solid ${lightTheme.colors.secondary[300]};
      
      &:hover:not(:disabled) {
        background-color: ${lightTheme.colors.secondary[200]};
        border-color: ${lightTheme.colors.secondary[400]};
      }
    `,
    
    outline: css`
      background-color: transparent;
      color: ${lightTheme.colors.primary[600]};
      border: 1px solid ${lightTheme.colors.primary[300]};
      
      &:hover:not(:disabled) {
        background-color: ${lightTheme.colors.primary[50]};
        border-color: ${lightTheme.colors.primary[400]};
      }
    `,
  },
  
  input: {
    base: css`
      width: 100%;
      padding: ${lightTheme.spacing.sm} ${lightTheme.spacing.md};
      border: 1px solid ${lightTheme.colors.gray[300]};
      border-radius: ${lightTheme.borderRadius.md};
      font-size: ${lightTheme.typography.fontSize.base};
      transition: border-color ${lightTheme.transitions.duration[200]} ${lightTheme.transitions.easing.inOut};
      
      &:focus {
        outline: none;
        border-color: ${lightTheme.colors.primary[500]};
        box-shadow: 0 0 0 3px ${lightTheme.colors.primary[100]};
      }
      
      &:disabled {
        background-color: ${lightTheme.colors.gray[100]};
        cursor: not-allowed;
      }
    `,
    
    error: css`
      border-color: ${lightTheme.colors.error[500]};
      
      &:focus {
        border-color: ${lightTheme.colors.error[500]};
        box-shadow: 0 0 0 3px ${lightTheme.colors.error[100]};
      }
    `,
  },
  
  card: {
    base: css`
      background-color: white;
      border-radius: ${lightTheme.borderRadius.lg};
      box-shadow: ${lightTheme.shadows.md};
      overflow: hidden;
      transition: box-shadow ${lightTheme.transitions.duration[200]} ${lightTheme.transitions.easing.inOut};
      
      &:hover {
        box-shadow: ${lightTheme.shadows.lg};
      }
    `,
    
    header: css`
      padding: ${lightTheme.spacing.lg};
      border-bottom: 1px solid ${lightTheme.colors.gray[200]};
    `,
    
    body: css`
      padding: ${lightTheme.spacing.lg};
    `,
    
    footer: css`
      padding: ${lightTheme.spacing.lg};
      border-top: 1px solid ${lightTheme.colors.gray[200]};
      background-color: ${lightTheme.colors.gray[50]};
    `,
  },
};

// Utility function to create responsive styles
export const createResponsiveStyles = (
  styles: Record<string, any>,
  breakpoints: Record<string, string>
) => {
  const responsiveStyles = css``;
  
  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint === 'base') {
      Object.assign(responsiveStyles, style);
    } else if (breakpoints[breakpoint]) {
      responsiveStyles.push(
        css`
          @media (min-width: ${breakpoints[breakpoint]}) {
            ${style}
          }
        `
      );
    }
  });
  
  return responsiveStyles;
};

// Export everything
export { css, keyframes };
export default styled;
