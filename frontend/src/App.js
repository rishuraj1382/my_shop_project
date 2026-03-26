// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CheckoutForm from './CheckoutForm';
import ProductManager from './ProductManager';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ShopListPage from './ShopListPage';
import OrderTrackingPage from './OrderTrackingPage';
import OrderSuccessPage from './OrderSuccessPage';
import ShopSettingsPage from './ShopSettingsPage';
import CustomerOrdersPage from './CustomerOrdersPage';
import ProtectedRoute from './ProtectedRoute';
import { OrderProvider, useOrder } from './OrderContext';
import { ToastProvider } from './Toast';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <OrderProvider>
        <ToastProvider>
          <Layout />
        </ToastProvider>
      </OrderProvider>
    </BrowserRouter>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`nav-link${isActive ? ' active' : ''}`}
    >
      {children}
    </Link>
  );
}

function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const { lastTrackedOrderId } = useOrder();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    navigate('/login');
  };

  const trackLink = lastTrackedOrderId ? `/track/${lastTrackedOrderId}` : '/track';

  return (
    <div className="bg-surface-container-low min-h-screen font-body text-on-surface antialiased">
      {/* ---- Glassmorphism Navbar ---- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/20 shadow-sm shadow-indigo-500/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center"
          >
            <img src="/logo.jpg" alt="Marketplace" className="h-20 w-auto object-contain rounded-lg" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Public & Customer links */}
            <NavLink to="/">Shops</NavLink>
            <NavLink to={trackLink}>Track Order</NavLink>
            
            {/* Customer-specific links */}
            {token && role === 'customer' && (
              <NavLink to="/my-orders">My Orders</NavLink>
            )}
            
            {/* Shopkeeper-specific links */}
            {token && role === 'shopkeeper' && (
              <>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/products">Manage Products</NavLink>
                <NavLink to="/admin/settings">Shop Settings</NavLink>
              </>
            )}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  role === 'shopkeeper' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {role === 'shopkeeper' ? `🏪 ${name || 'Shopkeeper'}` : `👤 ${name || 'Customer'}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-600 font-medium px-3 py-2 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 font-medium px-4 py-2.5 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-95 active:scale-90 transition-transform"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-1 bg-white border-t border-slate-100">
            {/* Role badge */}
            {token && (
              <div className="px-4 py-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  role === 'shopkeeper' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {role === 'shopkeeper' ? `🏪 ${name || 'Shopkeeper'}` : `👤 ${name || 'Customer'}`}
                </span>
              </div>
            )}
            
            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-lg mr-2">storefront</span>Shops
            </MobileNavLink>
            <MobileNavLink to={trackLink} onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-lg mr-2">local_shipping</span>Track Order
            </MobileNavLink>
            
            {/* Customer-specific mobile links */}
            {token && role === 'customer' && (
              <MobileNavLink to="/my-orders" onClick={() => setMobileOpen(false)}>
                <span className="material-symbols-outlined text-lg mr-2">receipt_long</span>My Orders
              </MobileNavLink>
            )}
            
            {/* Shopkeeper-specific mobile links */}
            {token && role === 'shopkeeper' && (
              <>
                <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">dashboard</span>Dashboard
                </MobileNavLink>
                <MobileNavLink to="/admin/products" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">inventory_2</span>Products
                </MobileNavLink>
                <MobileNavLink to="/admin/settings" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">settings</span>Settings
                </MobileNavLink>
              </>
            )}
            <div className="pt-3 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-error font-bold bg-error-container/20 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 px-4 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-all">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Main ---- */}
      <main className="pt-24 pb-10 animate-fade-in">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<ShopListPage />} />
            <Route path="/shop/:shopId" element={<CheckoutForm />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Customer routes */}
            <Route path="/my-orders" element={<ProtectedRoute><CustomerOrdersPage /></ProtectedRoute>} />
            
            {/* Shopkeeper routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="shopkeeper"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requiredRole="shopkeeper"><ProductManager /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="shopkeeper"><ShopSettingsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function MobileNavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-indigo-50 text-indigo-700 font-bold'
          : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {children}
    </Link>
  );
}

export default App;
