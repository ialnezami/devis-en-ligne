import { lazy } from 'react';

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  protected: boolean;
  requiredRoles?: string[];
  children?: RouteConfig[];
}

// Lazy load all page components
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Quotations = lazy(() => import('@/pages/Quotations/Quotations'));
const QuotationCreate = lazy(() => import('@/pages/Quotations/QuotationCreate/QuotationCreate'));
const QuotationTemplates = lazy(() => import('@/pages/Quotations/QuotationTemplates/QuotationTemplates'));
const Clients = lazy(() => import('@/pages/Clients/Clients'));
const ClientCreate = lazy(() => import('@/pages/Clients/ClientCreate/ClientCreate'));
const Analytics = lazy(() => import('@/pages/Analytics/Analytics'));
const AnalyticsReports = lazy(() => import('@/pages/Analytics/AnalyticsReports/AnalyticsReports'));
const AnalyticsExport = lazy(() => import('@/pages/Analytics/AnalyticsExport/AnalyticsExport'));
const Files = lazy(() => import('@/pages/Files/Files'));
const Settings = lazy(() => import('@/pages/Settings/Settings'));
const Profile = lazy(() => import('@/pages/Settings/Profile/Profile'));
const Company = lazy(() => import('@/pages/Settings/Company/Company'));
const Notifications = lazy(() => import('@/pages/Settings/Notifications/Notifications'));
const Integrations = lazy(() => import('@/pages/Settings/Integrations/Integrations'));
const Login = lazy(() => import('@/pages/Auth/Login/Login'));
const Register = lazy(() => import('@/pages/Auth/Register/Register'));
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/Auth/ResetPassword/ResetPassword'));
const NotFound = lazy(() => import('@/pages/Error/NotFound/NotFound'));

// Public routes configuration
export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    component: Login,
    protected: false
  },
  {
    path: '/register',
    component: Register,
    protected: false
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    protected: false
  },
  {
    path: '/reset-password',
    component: ResetPassword,
    protected: false
  }
];

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
      },
      {
        path: '/quotations/templates',
        component: QuotationTemplates,
        protected: true,
        requiredRoles: ['admin', 'manager']
      }
    ]
  },
  {
    path: '/clients',
    component: Clients,
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
    protected: true,
    children: [
      {
        path: '/analytics/reports',
        component: AnalyticsReports,
        protected: true,
        requiredRoles: ['admin', 'manager']
      },
      {
        path: '/analytics/export',
        component: AnalyticsExport,
        protected: true,
        requiredRoles: ['admin', 'manager']
      }
    ]
  },
  {
    path: '/files',
    component: Files,
    protected: true
  },
  {
    path: '/settings',
    component: Settings,
    protected: true,
    children: [
      {
        path: '/settings/profile',
        component: Profile,
        protected: true
      },
      {
        path: '/settings/company',
        component: Company,
        protected: true,
        requiredRoles: ['admin', 'manager']
      },
      {
        path: '/settings/notifications',
        component: Notifications,
        protected: true
      },
      {
        path: '/settings/integrations',
        component: Integrations,
        protected: true,
        requiredRoles: ['admin']
      }
    ]
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
