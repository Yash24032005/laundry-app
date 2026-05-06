import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import api from './api'; 

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>👔</div>
        <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  // Backend ko 'wake up' karne ke liye hit
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await api.get('/'); 
        console.log("Backend is awake!");
      } catch (err) {
        console.log("Backend waking up...");
      }
    };
    wakeUpBackend();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14, borderRadius: 10 }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
          {/* Catch-all route for better UX */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;