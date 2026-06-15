import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ShipperLayout } from "./components/ShipperLayout";
import { LoginPage } from "./pages/LoginPage";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const ScanPage = lazy(() => import("./pages/ScanPage").then((m) => ({ default: m.ScanPage })));
const RoutePage = lazy(() => import("./pages/RoutePage").then((m) => ({ default: m.RoutePage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage").then((m) => ({ default: m.HistoryPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const DeliveryConfirmPage = lazy(() => import("./pages/DeliveryConfirmPage").then((m) => ({ default: m.DeliveryConfirmPage })));
const FailedDeliveryPage = lazy(() => import("./pages/FailedDeliveryPage").then((m) => ({ default: m.FailedDeliveryPage })));

function PageLoader() {
  return <div className="sp-app sp-app--loading">Loading…</div>;
}

export function App() {
  return (
    <Routes>
      <Route element={<ShipperLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/orders"
          element={
            <Suspense fallback={<PageLoader />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="/scan"
          element={
            <Suspense fallback={<PageLoader />}>
              <ScanPage />
            </Suspense>
          }
        />
        <Route
          path="/route"
          element={
            <Suspense fallback={<PageLoader />}>
              <RoutePage />
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense fallback={<PageLoader />}>
              <HistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/deliver/:orderNumber"
          element={
            <Suspense fallback={<PageLoader />}>
              <DeliveryConfirmPage />
            </Suspense>
          }
        />
        <Route
          path="/failed/:orderNumber"
          element={
            <Suspense fallback={<PageLoader />}>
              <FailedDeliveryPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
