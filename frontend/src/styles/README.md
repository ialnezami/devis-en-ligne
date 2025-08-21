# Styling & UI Framework Documentation

This document outlines the comprehensive styling system implemented for the online quotation tool frontend.

## Overview

Our styling system is built on:
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **CSS Variables** - Dynamic theming system
- **Component Library** - Reusable UI components

## Architecture

### 1. CSS Variables System

The theming system uses CSS variables to enable dynamic color switching:

```css
:root {
  --color-primary-500: 59 130 246; /* RGB values without commas */
  --color-background: 255 255 255;
  --color-foreground: 15 23 42;
  /* ... */
}

.dark {
  --color-background: 2 6 23;
  --color-foreground: 248 250 252;
  /* ... */
}
```

### 2. File Structure

```
src/styles/
├── globals.css          # Main stylesheet with all styles
└── README.md           # This documentation

src/components/ui/       # Reusable UI components
├── Button.tsx          # Button component with variants
├── Input.tsx           # Form input with validation
├── Card.tsx            # Card layout components
├── Badge.tsx           # Status badges
├── Modal.tsx           # Modal/dialog component
├── Dropdown.tsx        # Dropdown menus
├── Loading.tsx         # Loading states
├── Grid.tsx            # Layout utilities
└── index.ts            # Exports all components
```

## Theming System

### Color Themes

Support for multiple color themes:
- **Blue** (default)
- **Green** 
- **Purple**
- **Orange**

Apply themes using CSS classes:
```tsx
<div className="theme-blue"> {/* or theme-green, theme-purple, theme-orange */}
  {/* Your content */}
</div>
```

### Dark Mode

Dark mode is controlled via CSS classes:
```tsx
<html className="dark"> {/* Enables dark mode */}
  {/* Your app */}
</html>
```

Integrated with Redux theme slice for persistent preferences.

## Component Library

### Button

Flexible button component with multiple variants and sizes:

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons and loading
<Button icon={<PlusIcon />} iconPosition="left">Add Item</Button>
<Button loading>Loading...</Button>
```

### Input

Form input with validation and icons:

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  leftIcon={<MailIcon />}
  error="Invalid email format"
  description="We'll never share your email"
/>
```

### Card

Layout component for content organization:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal

Accessible modal component with Headless UI:

```tsx
import { Modal } from '@/components/ui';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Modal description"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

### Dropdown

Context menus and dropdowns:

```tsx
import { Dropdown, DropdownButton } from '@/components/ui';

const items = [
  { label: 'Edit', onClick: () => {} },
  { label: 'Delete', onClick: () => {} },
  { divider: true },
  { label: 'Archive', onClick: () => {} },
];

<DropdownButton items={items}>
  Actions
</DropdownButton>
```

### Loading States

Various loading indicators:

```tsx
import { LoadingSpinner, LoadingSkeleton, LoadingOverlay } from '@/components/ui';

<LoadingSpinner size="md" />
<LoadingSkeleton lines={3} />
<LoadingOverlay isLoading={true}>
  <div>Content with overlay</div>
</LoadingOverlay>
```

### Layout Components

Grid and flex utilities:

```tsx
import { Grid, GridItem, Container, Flex } from '@/components/ui';

<Grid cols={3} gap="md" responsive={{ sm: 1, md: 2, lg: 3 }}>
  <GridItem span={2}>Content</GridItem>
  <GridItem>Sidebar</GridItem>
</Grid>

<Container size="xl" padding="md">
  <Flex direction="row" align="center" justify="between" gap="md">
    <div>Left content</div>
    <div>Right content</div>
  </Flex>
</Container>
```

## Responsive Design

### Breakpoints

Following Tailwind CSS breakpoint system:
- `sm`: 640px and up
- `md`: 768px and up  
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up
- `3xl`: 1600px and up (custom)

### Responsive Components

Components include responsive variants:

```tsx
// Responsive grid
<Grid cols={1} responsive={{ sm: 2, lg: 3, xl: 4 }}>

// Responsive text
<h1 className="text-responsive-3xl">Responsive Heading</h1>

// Mobile navigation
<div className="mobile-menu-button sm:hidden">
<nav className="desktop-navigation hidden sm:flex">
```

## Utility Classes

### Custom Utilities

Extended Tailwind with custom utilities:

```css
/* Text utilities */
.text-gradient          /* Gradient text effect */
.text-responsive-xl     /* Responsive typography */

/* Layout utilities */
.center                 /* Center content */
.center-x              /* Center horizontally */
.center-y              /* Center vertically */

/* Animation utilities */
.animate-in            /* Fade in animation */
.animate-out           /* Fade out animation */

/* Scrollbar utilities */
.scrollbar-none        /* Hide scrollbar */
.scrollbar-thin        /* Thin scrollbar */

/* Glass morphism */
.glass                 /* Glass effect */
.glass-dark           /* Dark glass effect */
```

### Application-Specific Classes

```css
/* Dashboard */
.dashboard-grid        /* Dashboard card grid */
.dashboard-card        /* Dashboard card styling */

/* Forms */
.form-grid            /* Form field grid */
.form-grid-full       /* Full-width form field */

/* Loading */
.loading-shimmer      /* Shimmer loading effect */

/* Navigation */
.sidebar-enter        /* Sidebar animation */
.sidebar-exit         /* Sidebar exit animation */
```

## Accessibility

### Focus Management

Consistent focus styles across all interactive elements:

```css
*:focus-visible {
  outline: none;
  ring: 2px solid rgb(var(--color-ring));
  ring-offset: 2px;
}
```

### Reduced Motion

Respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast

Support for high contrast mode:

```css
@media (prefers-contrast: high) {
  .high-contrast {
    border: 2px solid currentColor;
  }
}
```

## Performance

### CSS Organization

- Layered CSS structure (base, components, utilities)
- Minimal runtime CSS-in-JS
- Efficient CSS variables for theming
- Tree-shaking for unused styles

### Font Loading

Optimized font loading with `font-display: swap`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
```

## Development Workflow

### Adding New Components

1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Add styles to `src/styles/globals.css` if needed
4. Document usage patterns

### Theming Guidelines

1. Use CSS variables for all color values
2. Support both light and dark modes
3. Test with all color themes
4. Ensure accessibility compliance

### Testing Components

Visit `/demo` route to see all components in action with:
- Different variants and states
- Theme switching
- Responsive behavior
- Accessibility features

## Best Practices

### Component Design

1. **Composition over inheritance** - Small, focused components
2. **Consistent API** - Similar props across components
3. **Accessibility first** - ARIA attributes, keyboard navigation
4. **Performance** - Minimal re-renders, efficient styles

### Styling Conventions

1. **Utility classes** for simple styling
2. **Component classes** for complex patterns
3. **CSS variables** for dynamic values
4. **Responsive design** mobile-first approach

### Maintenance

1. **Regular audits** of unused styles
2. **Performance monitoring** of bundle size
3. **Accessibility testing** with screen readers
4. **Cross-browser testing** on supported browsers

## Browser Support

- Chrome 88+ 
- Firefox 85+
- Safari 14+
- Edge 88+

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Headless UI Documentation](https://headlessui.dev)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
