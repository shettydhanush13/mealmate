import { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Checkout from "./pages/checkout-pages/checkout";
import Home from "./pages/home"
import Landing from "./pages/landing";
import Mealbox from "./pages/mealbox-pages/mealbox";
import CreateMenu from "./pages/create-menu";
import Menu from "./pages/menu";
import BulkCheckout from "./pages/checkout-pages/bulkCheckout";
import BulkOrder from "./pages/bulk";
import AppLoader from "./components/app-Loader";
import CreateMealBox from "./pages/mealbox-pages/create-mealbox";
import MealBoxCheckout from "./pages/checkout-pages/mealBoxCheckout";
import Celebrations from "./pages/celebration-pages/celebrations";
import CelebrationsMeals from "./pages/celebration-pages/celebrationsMeals";
import CelebrationsCheckout from "./pages/checkout-pages/celebrationsCheckout";
import MyOrders from "./pages/myOrders";

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
      <Route path="/" element={<Landing />} />
      <Route path="/menu" element={<Home />} />
      <Route path="/menu/:id" element={<Menu />} />
      <Route path="/menu/checkout" element={<Checkout />} />
      <Route path="/create-menu" element={<CreateMenu />} />
      <Route path="/bulk" element={<BulkOrder />} />
      <Route path="/bulk/checkout" element={<BulkCheckout />} />
      <Route path="/mealbox" element={<Mealbox />} />
      <Route path="/mealbox/create" element={<CreateMealBox />} />
      <Route path="/mealbox/checkout" element={<MealBoxCheckout />} />
      <Route path="/celebrations" element={<Celebrations />} />
      <Route path="/celebrations/meal" element={<CelebrationsMeals />} />
      <Route path="/celebrations/checkout" element={<CelebrationsCheckout />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
};


export default App
