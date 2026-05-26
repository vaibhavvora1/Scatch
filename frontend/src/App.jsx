import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import PremiumIntro from './components/PremiumIntro';
import PageTransition from './components/PageTransition';
import { GuestRoute, ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AuthPages = lazy(() => import('./pages/AuthPages'));

function BrandedLoader() {
  return (
    <div className="route-loader">
      <div className="brand-icon">S</div>
      <p>Scatch</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <SmoothScroll />
      <PremiumIntro />
      <CustomCursor />
      {!isAdmin && <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <Suspense fallback={<BrandedLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
            <Route path="/login" element={<GuestRoute><AuthPages mode="login" /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><AuthPages mode="register" /></GuestRoute>} />
            <Route path="/admin/login" element={<AuthPages mode="admin" />} />
            <Route path="/admin/register" element={<AuthPages mode="admin-register" />} />
            <Route path="/cart" element={<ProtectedRoute><PageTransition><CartPage /></PageTransition></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><PageTransition><OrdersPage /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><PageTransition><WishlistPage /></PageTransition></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}
