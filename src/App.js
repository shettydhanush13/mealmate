import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AppLoader from "./components/app-Loader";
import ErrorBoundary from "./components/errorBoundary";
import ScrollToTop from "./components/scrollToTop";
import { AdminAuthProvider } from "./components/adminAuth/context";

// Route-based code splitting — each page ships as its own chunk and the heavy
// admin tree never loads for a public visitor.
const Celebrations = lazy(() => import("./pages/celebrations"));
const CreateMenu = lazy(() => import("./pages/create-menu"));
const CreateSubscription = lazy(() => import("./pages/createSubscription"));
const Checkout = lazy(() => import("./pages/checkout"));
const TrackOrder = lazy(() => import("./pages/trackOrder"));
const LegalPage = lazy(() => import("./pages/legal"));
const AboutPage = lazy(() => import("./pages/about"));
const RequireAdmin = lazy(() => import("./components/requireAdmin"));
const AdminRegionsPage = lazy(() => import("./pages/adminPage"));
const AdminCombosPage = lazy(() => import("./pages/adminPage/combos"));
const AdminVendorsPage = lazy(() => import("./pages/adminPage/vendors"));
const AdminSettingsPage = lazy(() => import("./pages/adminPage/settings"));
const AdminPincodesPage = lazy(() => import("./pages/adminPage/pincodes"));
const OrdersPage = lazy(() => import("./pages/orders"));
const OrderDetailsPage = lazy(() => import("./pages/orderDetails"));
const SubscriptionDetailsPage = lazy(() => import("./pages/subscriptionDetails"));
const ActiveSubscriptionPage = lazy(() => import("./pages/activeSubscription"));
const FoodInventoryOrders = lazy(() => import("./pages/adminPage/foodInventory"));
const DecorationsInventory = lazy(() => import("./pages/adminPage/decorationInventory"));
const ArtistsInventory = lazy(() => import("./pages/adminPage/artistsInventory"));
const LiveStationsInventory = lazy(() => import("./pages/adminPage/liveStationsInventory"));
const VendorLogin = lazy(() => import("./pages/vendorLogin"));
const FullAdminOnly = lazy(() => import("./components/adminAuth/FullAdminOnly"));

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <ScrollToTop />
      <AdminAuthProvider>
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/" element={<Celebrations />} />
          <Route path="/create-menu" element={<CreateMenu />} />
          <Route path="/caterbox-subscription" element={<CreateSubscription />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/privacy-policy" element={<LegalPage doc="privacy" />} />
          <Route path="/terms" element={<LegalPage doc="terms" />} />
          <Route path="/refund-policy" element={<LegalPage doc="refund" />} />
          <Route element={<RequireAdmin />}>
            {/* vendor-admins can reach these (restricted UI inside) */}
            <Route path="/admin" element={<AdminRegionsPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/admin/combos" element={<AdminCombosPage />} />
            <Route path="/admin/inventory/food" element={<FoodInventoryOrders />} />

            {/* full-admin only — vendors are redirected to the dashboard */}
            <Route element={<FullAdminOnly />}>
              <Route path="/admin/vendors" element={<AdminVendorsPage />} />
              <Route path="/admin/pincodes" element={<AdminPincodesPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/inventory/decorations" element={<DecorationsInventory />} />
              <Route path="/admin/inventory/artists" element={<ArtistsInventory />} />
              <Route path="/admin/inventory/livestations" element={<LiveStationsInventory />} />
              <Route path="/admin/subscriptions/:id" element={<SubscriptionDetailsPage />} />
              <Route path="/admin/subscriptions/:id/active" element={<ActiveSubscriptionPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Celebrations />} />
        </Routes>
      </Suspense>
      </AdminAuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
