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
import ShopSettingsPage from './ShopSettingsPage';
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
  const { lastTrackedOrderId } = useOrder();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const trackLink = lastTrackedOrderId ? `/track/${lastTrackedOrderId}` : '/track';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ---- Navbar ---- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              to="/"
              className="text-2xl font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 tracking-tight"
            >
              🛒 Marketplace
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Shops</NavLink>
              <NavLink to={trackLink}>Track Order</NavLink>
              {token && (
                <>
                  <NavLink to="/admin">Dashboard</NavLink>
                  <NavLink to="/admin/products">Products</NavLink>
                  <NavLink to="/admin/settings">Settings</NavLink>
                </>
              )}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="btn-danger text-sm"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-primary text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className="block w-5 h-0.5 bg-current mb-1 transition-all duration-200" />
              <span className="block w-5 h-0.5 bg-current mb-1 transition-all duration-200" />
              <span className="block w-5 h-0.5 bg-current transition-all duration-200" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-1 bg-white border-t border-gray-100">
            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>Shops</MobileNavLink>
            <MobileNavLink to={trackLink} onClick={() => setMobileOpen(false)}>Track Order</MobileNavLink>
            {token && (
              <>
                <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink to="/admin/products" onClick={() => setMobileOpen(false)}>Products</MobileNavLink>
                <MobileNavLink to="/admin/settings" onClick={() => setMobileOpen(false)}>Settings</MobileNavLink>
              </>
            )}
            <div className="pt-2 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="btn-danger w-full"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Main ---- */}
      <main className="py-10 animate-fade-in">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ShopListPage />} />
            <Route path="/shop/:shopId" element={<CheckoutForm />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><ShopSettingsPage /></ProtectedRoute>} />
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
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {children}
    </Link>
  );
}

export default App;

