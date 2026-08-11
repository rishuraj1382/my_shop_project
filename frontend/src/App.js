// frontend/src/App.js
import React, { useState, useRef, useEffect } from 'react';
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
import SuperAdminOverview from './SuperAdminOverview';
import SuperAdminUsers from './SuperAdminUsers';
import SuperAdminShops from './SuperAdminShops';
import SuperAdminOrders from './SuperAdminOrders';
import SuperAdminAnalytics from './SuperAdminAnalytics';
import CustomerOrdersPage from './CustomerOrdersPage';
import CustomerDashboard from './CustomerDashboard';
import CustomerProfilePage from './CustomerProfilePage';
import FavoritesPage from './FavoritesPage';
import GlobalSearchResults from './GlobalSearchResults';
import ProductDetailsPage from './ProductDetailsPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from './NotFoundPage';
import UnauthorizedPage from './UnauthorizedPage';
import { OrderProvider, useOrder } from './OrderContext';
import { ToastProvider } from './Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import NotificationPanel from './components/NotificationPanel';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Dropdown from './components/ui/Dropdown';
import ThemeToggle from './components/ui/ThemeToggle';
import io from 'socket.io-client';
import { API_URL } from './config';
import './App.css';

// Global socket for notifications
const socket = io(API_URL);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <OrderProvider>
            <ToastProvider>
              <Layout />
            </ToastProvider>
          </OrderProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link to={to} className={`nav-link${isActive ? ' active' : ''}`}>
      {children}
    </Link>
  );
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'computer' },
];

function MobileThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="px-4 py-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Theme</span>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPreference(opt.value)}
            aria-pressed={preference === opt.value}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              preference === opt.value
                ? 'bg-primary/10 text-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const { token, role, name, logout, user } = useAuth();
  const { lastTrackedOrderId } = useOrder();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  let notifId = useRef(0);

  const addNotification = (msg, type = 'default') => {
    const id = ++notifId.current;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [{ id, message: msg, type, time }, ...prev].slice(0, 20));
  };

  // Join rooms and listen for socket events
  useEffect(() => {
    if (!user?._id) return;
    if (role === 'customer') {
      socket.emit('joinCustomerRoom', user._id);
      const handler = (data) => {
        addNotification(data.message || `Your order status changed to ${data.status}.`, 'orderUpdate');
        setNotifPanelOpen(true);
      };
      socket.on(`customerNotification:${user._id}`, handler);
      return () => socket.off(`customerNotification:${user._id}`, handler);
    }
    if (role === 'shopkeeper') {
      socket.emit('joinShopRoom', user._id);
      const handler = (data) => {
        addNotification('New order received!', 'newOrder');
        setNotifPanelOpen(true);
      };
      socket.on('newOrder', handler);
      return () => socket.off('newOrder', handler);
    }
  }, [user, role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const trackLink = lastTrackedOrderId ? `/track/${lastTrackedOrderId}` : '/track';
  const unreadCount = notifications.length;

  return (
    <div className="bg-surface-container-low min-h-screen font-body text-on-surface antialiased">
      {/* ---- Glassmorphism Navbar ---- */}
      <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/20 shadow-sm shadow-on-surface/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          {/* Brand */}
          <Link to="/" className="flex items-center">
            <img src="/logo.jpg" alt="Marketplace" className="h-20 w-auto object-contain rounded-lg" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Shops</NavLink>
            <NavLink to="/search">Search Products</NavLink>
            <NavLink to={trackLink}>Track Order</NavLink>

            {/* Customer-specific links */}
            {token && role === 'customer' && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/my-orders">My Orders</NavLink>
                <NavLink to="/favorites">Favourites</NavLink>
              </>
            )}

            {/* Shopkeeper-specific links */}
            {token && role === 'shopkeeper' && (
              <>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/products">Manage Products</NavLink>
                <NavLink to="/admin/settings">Shop Settings</NavLink>
              </>
            )}

            {/* Super Admin-specific links */}
            {token && role === 'superadmin' && (
              <>
                <NavLink to="/super-admin">Overview</NavLink>
                <NavLink to="/super-admin/users">Users</NavLink>
                <NavLink to="/super-admin/shops">Shops</NavLink>
                <NavLink to="/super-admin/orders">Orders</NavLink>
                <NavLink to="/super-admin/analytics">Analytics</NavLink>
              </>
            )}
          </div>

          {/* Auth + Notification area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {/* Notification Bell */}
            {token && (
              <Dropdown
                align="right"
                open={notifPanelOpen}
                onOpenChange={setNotifPanelOpen}
                trigger={({ toggle }) => (
                  <button
                    onClick={toggle}
                    className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    aria-label="Notifications"
                    aria-haspopup="true"
                    aria-expanded={notifPanelOpen}
                  >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-error text-on-error text-[9px] font-extrabold flex items-center justify-center animate-bounce-once">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}
              >
                {() => (
                  <NotificationPanel
                    notifications={notifications}
                    onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                    onDismissAll={() => setNotifications([])}
                  />
                )}
              </Dropdown>
            )}

            {token ? (
              <div className="flex items-center gap-3">
                {role === 'customer' && (
                  <Link to="/profile">
                    <Badge variant="neutral" icon="person">{name || 'Customer'}</Badge>
                  </Link>
                )}
                {role === 'shopkeeper' && (
                  <Badge variant="neutral" icon="storefront">{name || 'Shopkeeper'}</Badge>
                )}
                {role === 'superadmin' && (
                  <Badge variant="neutral" icon="shield_person">{name || 'Super Admin'}</Badge>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-on-surface-variant font-medium px-3 py-2 hover:bg-surface-container-high rounded-lg transition-all"
                  title="Logout"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost">Login</Button>
                <Button as={Link} to="/register" variant="primary">Register</Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors duration-200"
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
            mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-1 bg-surface-container-lowest border-t border-outline-variant/20">
            {token && (
              <div className="px-4 py-2">
                <Badge
                  variant="neutral"
                  icon={role === 'shopkeeper' ? 'storefront' : role === 'superadmin' ? 'shield_person' : 'person'}
                >
                  {role === 'shopkeeper' ? (name || 'Shopkeeper') :
                   role === 'superadmin' ? (name || 'Super Admin') :
                   (name || 'Customer')}
                </Badge>
              </div>
            )}

            <MobileThemeSwitcher />

            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-lg mr-2">storefront</span>Shops
            </MobileNavLink>
            <MobileNavLink to="/search" onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-lg mr-2">search</span>Search Products
            </MobileNavLink>
            <MobileNavLink to={trackLink} onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-lg mr-2">local_shipping</span>Track Order
            </MobileNavLink>

            {token && role === 'customer' && (
              <>
                <MobileNavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">dashboard</span>Dashboard
                </MobileNavLink>
                <MobileNavLink to="/my-orders" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">receipt_long</span>My Orders
                </MobileNavLink>
                <MobileNavLink to="/favorites" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">favorite</span>Favourites
                </MobileNavLink>
                <MobileNavLink to="/profile" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">manage_accounts</span>Profile
                </MobileNavLink>
              </>
            )}

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

            {token && role === 'superadmin' && (
              <>
                <MobileNavLink to="/super-admin" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">dashboard</span>Overview
                </MobileNavLink>
                <MobileNavLink to="/super-admin/users" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">group</span>Users
                </MobileNavLink>
                <MobileNavLink to="/super-admin/shops" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">storefront</span>Shops
                </MobileNavLink>
                <MobileNavLink to="/super-admin/orders" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">receipt_long</span>Orders
                </MobileNavLink>
                <MobileNavLink to="/super-admin/analytics" onClick={() => setMobileOpen(false)}>
                  <span className="material-symbols-outlined text-lg mr-2">monitoring</span>Analytics
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
      {/* Mobile bottom nav — customers/guests only. Shopkeeper/superadmin nav sets are
          small and already served well by the hamburger; customers/guests otherwise had
          every destination, including the most common ones, buried two taps deep. */}
      {(!token || role === 'customer') && <MobileBottomNav token={token} />}

      <main className="pt-28 pb-24 md:pb-10 animate-fade-in">
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
            <Route path="/search" element={<GlobalSearchResults />} />
            <Route path="/product/:productId" element={<ProductDetailsPage />} />

            {/* Customer routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute requiredRole="customer"><CustomerOrdersPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute requiredRole="customer"><FavoritesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="customer"><CustomerProfilePage /></ProtectedRoute>} />

            {/* Shopkeeper routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="shopkeeper"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requiredRole="shopkeeper"><ProductManager /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="shopkeeper"><ShopSettingsPage /></ProtectedRoute>} />

            {/* Super Admin routes */}
            <Route path="/super-admin" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminOverview /></ProtectedRoute>} />
            <Route path="/super-admin/users" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminUsers /></ProtectedRoute>} />
            <Route path="/super-admin/shops" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminShops /></ProtectedRoute>} />
            <Route path="/super-admin/orders" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminOrders /></ProtectedRoute>} />
            <Route path="/super-admin/analytics" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminAnalytics /></ProtectedRoute>} />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

const BOTTOM_NAV_ITEMS = (token) => [
  { to: '/', icon: 'storefront', label: 'Shops' },
  { to: '/search', icon: 'search', label: 'Search' },
  token
    ? { to: '/my-orders', icon: 'receipt_long', label: 'Orders' }
    : { to: '/track', icon: 'local_shipping', label: 'Track' },
  token
    ? { to: '/profile', icon: 'person', label: 'Profile' }
    : { to: '/login', icon: 'login', label: 'Login' },
];

function MobileBottomNav({ token }) {
  const { pathname } = useLocation();
  const items = BOTTOM_NAV_ITEMS(token);
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/20 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {items.map(({ to, icon, label }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
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
          ? 'bg-primary/10 text-primary font-bold'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

export default App;
