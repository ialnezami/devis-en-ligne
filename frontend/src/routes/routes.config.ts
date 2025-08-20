import { lazy } from 'react';

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  protected: boolean;
  requiredRoles?: string[];
  children?: RouteConfig[];
}

// Lazy load page components
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Quotations = lazy(() => import('@/pages/Quotations/Quotations'));
const QuotationCreate = lazy(() => import('@/pages/Quotations/QuotationCreate/QuotationCreate'));
const ClientList = lazy(() => import('@/pages/Clients/ClientList/ClientList'));
const ClientCreate = lazy(() => import('@/pages/Clients/ClientCreate/ClientCreate'));
const Analytics = lazy(() => import('@/pages/Analytics/Analytics'));
const NotFound = lazy(() => import('@/pages/Error/NotFound/NotFound'));

// Public routes configuration
export const publicRoutes: RouteConfig[] = [];

// Protected routes configuration
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Dashboard,
    protected: true
  },
  {
    path: '/quotations',
    component: Quotations,
    protected: true,
    children: [
      {
        path: '/quotations/create',
        component: QuotationCreate,
        protected: true,
        requiredRoles: ['admin', 'manager', 'sales_rep']
      }
    ]
  },
  {
    path: '/clients',
    component: ClientList,
    protected: true,
    children: [
      {
        path: '/clients/create',
        component: ClientCreate,
        protected: true,
        requiredRoles: ['admin', 'manager', 'sales_rep']
      }
    ]
  },
  {
    path: '/analytics',
    component: Analytics,
    protected: true
  }
];

// Error routes
export const errorRoutes: RouteConfig[] = [
  {
    path: '*',
    component: NotFound,
    protected: false
  }
];

// Helper function to flatten nested routes
export const flattenRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  const flattened: RouteConfig[] = [];
  
  routes.forEach(route => {
    flattened.push(route);
    if (route.children) {
      flattened.push(...flattenRoutes(route.children));
    }
  });
  
  return flattened;
};

// Get all routes (public + protected + error)
export const allRoutes = [
  ...publicRoutes,
  ...protectedRoutes,
  ...errorRoutes
];

// Get flattened routes for navigation purposes
export const flattenedRoutes = flattenRoutes(allRoutes);
