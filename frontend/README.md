# Online Quotation Tool - Frontend

This is the frontend application for the Online Quotation Tool, built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern React Stack**: Built with React 18, TypeScript, and Vite
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript support with strict configuration
- **Performance**: Code splitting, lazy loading, and optimized builds
- **Developer Experience**: Hot reload, ESLint, Prettier, and comprehensive tooling
- **Accessibility**: WCAG compliant components and keyboard navigation
- **Internationalization**: Ready for multi-language support
- **Testing Ready**: Jest and React Testing Library setup ready

## 🛠️ Tech Stack

### Core
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript 5** - Type-safe JavaScript development
- **Vite 4** - Fast build tool and development server

### Styling
- **Tailwind CSS 3** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization
- **Custom Components** - Reusable UI component library

### State Management
- **React Context** - Lightweight state management
- **Custom Hooks** - Reusable logic and state
- **Local Storage** - Persistent user preferences

### Routing
- **React Router 6** - Client-side routing with code splitting
- **Route Guards** - Protected routes and authentication
- **Lazy Loading** - On-demand component loading

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Build & Deployment
- **Vite** - Fast development and optimized production builds
- **Environment Variables** - Configuration management
- **Path Aliases** - Clean import statements

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── routes/            # Routing configuration
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── services/          # API services
│   ├── styles/            # Global styles and CSS
│   ├── assets/            # Images, icons, and media
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global CSS with Tailwind
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node.js TypeScript configuration
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
└── env.example            # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Backend**: Running NestJS backend (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint
- **`npm run lint:fix`** - Fix ESLint errors
- **`npm run format`** - Format code with Prettier
- **`npm run type-check`** - Check TypeScript types

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Online Quotation Tool
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_WEBSOCKETS=true
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- **Strict mode** enabled
- **Path mapping** for clean imports (`@/components`, `@/utils`, etc.)
- **Modern ES features** (ES2020)
- **JSX support** for React components

### Tailwind CSS Configuration

Custom Tailwind configuration includes:

- **Custom color palette** with primary, secondary, success, warning, and danger colors
- **Custom animations** for smooth transitions
- **Responsive breakpoints** for mobile-first design
- **Custom component classes** for buttons, forms, and cards

### ESLint Configuration

Comprehensive linting rules for:

- **React best practices** and hooks rules
- **TypeScript** specific rules
- **Import organization** and sorting
- **Accessibility** (jsx-a11y)
- **Code quality** and consistency

## 🎨 Design System

### Color Palette

- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray shades for text and backgrounds
- **Success**: Green shades for positive actions
- **Warning**: Yellow/Orange shades for caution
- **Danger**: Red shades for errors and destructive actions

### Component Library

- **Buttons**: Primary, secondary, outline, and variant styles
- **Forms**: Input fields, labels, validation, and error states
- **Cards**: Headers, bodies, and footers with consistent spacing
- **Typography**: Consistent font sizes, weights, and line heights

### Responsive Design

- **Mobile-first** approach
- **Breakpoint system** (sm, md, lg, xl, 2xl)
- **Flexible layouts** that adapt to screen sizes
- **Touch-friendly** interactions for mobile devices

## 🔧 Development Workflow

### Code Quality

1. **ESLint** runs automatically on save
2. **Prettier** formats code consistently
3. **TypeScript** provides compile-time error checking
4. **Git hooks** (if configured) ensure quality before commits

### Component Development

1. **Create component** in appropriate directory
2. **Add TypeScript interfaces** for props
3. **Include JSDoc comments** for documentation
4. **Add to index files** for easy importing
5. **Test component** in isolation

### State Management

1. **Use React Context** for global state
2. **Custom hooks** for reusable logic
3. **Local state** for component-specific data
4. **Local storage** for persistent preferences

## 📱 Responsive Design

### Breakpoints

- **sm**: 640px and up (small tablets)
- **md**: 768px and up (tablets)
- **lg**: 1024px and up (laptops)
- **xl**: 1280px and up (desktops)
- **2xl**: 1536px and up (large screens)

### Mobile Considerations

- **Touch targets** minimum 44px
- **Swipe gestures** for navigation
- **Responsive images** and media
- **Mobile-first** CSS approach

## ♿ Accessibility

### WCAG Compliance

- **Semantic HTML** for screen readers
- **Keyboard navigation** support
- **Color contrast** ratios
- **Focus indicators** and management
- **ARIA labels** and descriptions

### Best Practices

- **Alt text** for images
- **Form labels** and error messages
- **Skip links** for navigation
- **Screen reader** friendly content

## 🧪 Testing

### Testing Setup

The project is configured for testing with:

- **Jest** as the test runner
- **React Testing Library** for component testing
- **TypeScript** support in tests
- **Mock service worker** for API testing

### Running Tests

```bash
npm test              # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci       # Run tests once for CI
```

## 🚀 Build & Deployment

### Development Build

```bash
npm run dev
```

- **Hot reload** enabled
- **Source maps** for debugging
- **Fast refresh** for React components
- **Proxy** to backend API

### Production Build

```bash
npm run build
```

- **Code splitting** for optimal loading
- **Tree shaking** to remove unused code
- **Minification** and optimization
- **Asset optimization** and compression

### Preview Production Build

```bash
npm run preview
```

- **Local preview** of production build
- **Performance testing** environment
- **Final validation** before deployment

## 🔍 Performance

### Optimization Features

- **Code splitting** by routes and components
- **Lazy loading** for non-critical components
- **Tree shaking** to eliminate dead code
- **Asset optimization** and compression
- **Bundle analysis** tools

### Monitoring

- **Bundle size** tracking
- **Loading performance** metrics
- **Runtime performance** monitoring
- **User experience** metrics

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change port in `vite.config.ts`
2. **Type errors**: Run `npm run type-check`
3. **Linting errors**: Run `npm run lint:fix`
4. **Build failures**: Check TypeScript compilation

### Debug Mode

Enable debug mode in `.env`:

```env
VITE_ENABLE_DEBUG_MODE=true
```

### Performance Issues

1. **Check bundle size** with build analysis
2. **Monitor network requests** in browser dev tools
3. **Profile component rendering** with React DevTools
4. **Analyze bundle** with `npm run build:analyze`

## 📚 Additional Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools

- **React DevTools** - Browser extension for debugging
- **TypeScript Playground** - Online TypeScript editor
- **Vite Inspector** - Visualize Vite's dependency graph

## 🤝 Contributing

### Development Guidelines

1. **Follow TypeScript** best practices
2. **Use ESLint rules** consistently
3. **Write meaningful** commit messages
4. **Test components** before submitting
5. **Update documentation** for new features

### Code Style

- **Prettier** handles formatting
- **ESLint** enforces rules
- **TypeScript** ensures type safety
- **Consistent naming** conventions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy coding! 🚀**
