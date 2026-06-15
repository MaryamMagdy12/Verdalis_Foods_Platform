import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "./hooks/useLenis";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClientNav } from "./components/ClientNav";
import { ClientFooter } from "./components/ClientFooter";
import { PageLoader } from "./components/PageLoader";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RetailerRegisterPage } from "./pages/RetailerRegisterPage";
import "./assets/css/platform-design.css";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import("./pages/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const FindAStorePage = lazy(() => import("./pages/FindAStorePage").then((m) => ({ default: m.FindAStorePage })));
const CartPage = lazy(() => import("./pages/CartPage").then((m) => ({ default: m.CartPage })));
const PaymentPage = lazy(() => import("./pages/PaymentPage").then((m) => ({ default: m.PaymentPage })));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage").then((m) => ({ default: m.TrackOrderPage })));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout").then((m) => ({ default: m.DashboardLayout })));
const DashboardOrders = lazy(() => import("./pages/dashboard/DashboardOrders").then((m) => ({ default: m.DashboardOrders })));
const DashboardProfile = lazy(() => import("./pages/dashboard/DashboardProfile").then((m) => ({ default: m.DashboardProfile })));
const Chatbot = lazy(() => import("./components/shared/Chatbot").then((m) => ({ default: m.Chatbot })));

const TRANSITION = { duration: 0.45, ease: [0.16, 1, 0.3, 1] };

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout() {
  const location = useLocation();
  useLenis(location.pathname);

  return (
    <div className="app-shell">
      <ClientNav />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
            style={{ minHeight: "100%" }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/find-a-store" element={<FindAStorePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<RequireAuth><PaymentPage /></RequireAuth>} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/brands" element={<Navigate to="/products" replace />} />
                <Route path="/partners" element={<Navigate to="/products" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <DashboardLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="orders" element={<DashboardOrders />} />
                  <Route path="profile" element={<DashboardProfile />} />
                </Route>
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <ClientFooter />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/retailer" element={<RetailerRegisterPage />} />
          <Route path="*" element={<MainLayout />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
