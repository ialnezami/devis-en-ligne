import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import QuotationsPage from './pages/quotations/QuotationsPage';
import QuotationDetailPage from './pages/quotations/QuotationDetailPage';
import CreateQuotationPage from './pages/quotations/CreateQuotationPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <DashboardPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/quotations"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <QuotationsPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/quotations/:id"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <QuotationDetailPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/quotations/create"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <CreateQuotationPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SettingsPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                
                {/* Global toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
