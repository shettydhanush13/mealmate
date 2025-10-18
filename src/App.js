import { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom"
import CreateMenu from "./pages/create-menu";
import Checkout from "./pages/checkout";
import Celebrations from "./pages/celebrations";
import CelebrationsMeals from "./pages/celebrationsMeals";
import AppLoader from "./components/app-Loader";
import AdminRegionsPage from "./pages/adminPage";
import OrdersPage from "./pages/orders";
import OrderDetailsPage from "./pages/orderDetails";
import FoodInventoryOrders from "./pages/adminPage/foodInventory";
import DecorationsInventory from "./pages/adminPage/decorationInventory";
import ArtistsInventory from "./pages/adminPage/artistsInventory";
import LiveStationsInventory from "./pages/adminPage/liveStationsInventory";

const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    localStorage.clear('celebration-services');
    const timer = setTimeout(() => setIsAppLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {isAppLoading ? (
        <AppLoader />
      ) : (
        <AppContent />
      )}
    </BrowserRouter>
  )
}

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Celebrations />} />
      <Route path="/add-meal" element={<CelebrationsMeals />} />
      <Route path="/create-menu" element={<CreateMenu />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<Celebrations />} />
      <Route path='/admin' element={<AdminRegionsPage />} />
      <Route path='/admin/orders' element={<OrdersPage />} />
      <Route path="/admin/orders/:orderId" element={<OrderDetailsPage />} />
      <Route path="/admin/inventory/food" element={<FoodInventoryOrders />} />
      <Route path="/admin/inventory/decorations" element={<DecorationsInventory />} />
      <Route path="/admin/inventory/artists" element={<ArtistsInventory />} />
      <Route path="/admin/inventory/livestations" element={<LiveStationsInventory />} />
    </Routes>
  );
};


export default App
