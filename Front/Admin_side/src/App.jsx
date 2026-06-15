import React, { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminTopBar } from "./components/AdminTopBar";
import { AdminNav } from "./components/AdminNav";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
const ProductDashboardPage = lazy(() => import("./pages/ProductDashboardPage").then((m) => ({ default: m.ProductDashboardPage })));
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboardPage").then((m) => ({ default: m.AnalyticsDashboardPage })));
const StoreDashboardPage = lazy(() => import("./pages/StoreDashboardPage").then((m) => ({ default: m.StoreDashboardPage })));
const ContactMessagesDashboardPage = lazy(() => import("./pages/ContactMessagesDashboardPage").then((m) => ({ default: m.ContactMessagesDashboardPage })));
const QuestionsDashboardPage = lazy(() => import("./pages/QuestionsDashboardPage").then((m) => ({ default: m.QuestionsDashboardPage })));
const AddProductPage = lazy(() => import("./pages/AddProductPage").then((m) => ({ default: m.AddProductPage })));
const AddStorePage = lazy(() => import("./pages/AddStorePage").then((m) => ({ default: m.AddStorePage })));
const AddCategoryPage = lazy(() => import("./pages/AddCategoryPage").then((m) => ({ default: m.AddCategoryPage })));
const CategoryDashboardPage = lazy(() => import("./pages/CategoryDashboardPage").then((m) => ({ default: m.CategoryDashboardPage })));
const OrdersDashboardPage = lazy(() => import("./pages/OrdersDashboardPage").then((m) => ({ default: m.OrdersDashboardPage })));
const ClientsDashboardPage = lazy(() => import("./pages/ClientsDashboardPage").then((m) => ({ default: m.ClientsDashboardPage })));
const ShippersDashboardPage = lazy(() => import("./pages/ShippersDashboardPage").then((m) => ({ default: m.ShippersDashboardPage })));
const AddShipperPage = lazy(() => import("./pages/AddShipperPage").then((m) => ({ default: m.AddShipperPage })));
const PaymentsDashboardPage = lazy(() => import("./pages/PaymentsDashboardPage").then((m) => ({ default: m.PaymentsDashboardPage })));
const AdminsDashboardPage = lazy(() => import("./pages/AdminsDashboardPage").then((m) => ({ default: m.AdminsDashboardPage })));
const AddAdminPage = lazy(() => import("./pages/AddAdminPage").then((m) => ({ default: m.AddAdminPage })));

const ADMIN_LOGIN_PATH = "/admin/login";
const PAGE_TRANSITION = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

function AdminPageLoader() {
  return <div className="admin-app-main" style={{ padding: "2rem" }}>Loading…</div>;
}

function AdminLoginRoute() {
  const { authenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <AdminPageLoader />;
  if (authenticated) {
    const target = location.state?.from?.pathname || "/admin/analytics";
    return <Navigate to={target} replace />;
  }

  return <AdminLoginPage />;
}

function AdminShell() {
  const { authenticated, loading } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <AdminPageLoader />;
  if (!authenticated) {
    return <Navigate to={ADMIN_LOGIN_PATH} state={{ from: location }} replace />;
  }

  return (
    <div className="admin-app">
      <AdminNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-app-content">
        <AdminTopBar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="admin-app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={PAGE_TRANSITION}
              style={{ minHeight: "100%" }}
            >
              <Suspense fallback={<AdminPageLoader />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AdminRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname === ADMIN_LOGIN_PATH ? "login" : "app"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={PAGE_TRANSITION}
      >
        <Suspense fallback={<AdminPageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/admin/analytics" replace />} />
            <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginRoute />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
              <Route path="products" element={<ProductDashboardPage />} />
              <Route path="stores" element={<StoreDashboardPage />} />
              <Route path="contact-messages" element={<ContactMessagesDashboardPage />} />
              <Route path="questions" element={<QuestionsDashboardPage />} />
              <Route path="add-product" element={<AddProductPage />} />
              <Route path="add-store" element={<AddStorePage />} />
              <Route path="categories" element={<CategoryDashboardPage />} />
              <Route path="add-category" element={<AddCategoryPage />} />
              <Route path="orders" element={<OrdersDashboardPage />} />
              <Route path="clients" element={<ClientsDashboardPage />} />
              <Route path="admins" element={<AdminsDashboardPage />} />
              <Route path="add-admin" element={<AddAdminPage />} />
              <Route path="shippers" element={<ShippersDashboardPage />} />
              <Route path="add-shipper" element={<AddShipperPage />} />
              <Route path="payments" element={<PaymentsDashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/analytics" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  );
}
