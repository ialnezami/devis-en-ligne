import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/Provider';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationCreate from './pages/Quotations/QuotationCreate';
import QuotationView from './pages/Quotations/QuotationView';
import QuotationEdit from './pages/Quotations/QuotationEdit';
import ClientList from './pages/Clients/ClientList';
import ClientCreate from './pages/Clients/ClientCreate';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={<Analytics />} />
                  
                  {/* Quotations */}
                  <Route path="/quotations" element={<QuotationList />} />
                  <Route path="/quotations/create" element={<QuotationCreate />} />
                  <Route path="/quotations/:id" element={<QuotationView />} />
                  <Route path="/quotations/:id/edit" element={<QuotationEdit />} />
                  
                  {/* Clients */}
                  <Route path="/clients" element={<ClientList />} />
                  <Route path="/clients/create" element={<ClientCreate />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
