import { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/home"
import Menu from "./pages/menu";
import Mealbox from "./pages/mealbox-pages/mealbox";
import CreateMenu from "./pages/create-menu";
// import Checkout from "./pages/checkout-pages/checkout";
// import Landing from "./pages/landing";
import BulkCheckout from "./pages/checkout-pages/bulkCheckout";
// import BulkOrder from "./pages/bulk";
// import CreateMealBox from "./pages/mealbox-pages/create-mealbox";
// import MealBoxCheckout from "./pages/checkout-pages/mealBoxCheckout";
import Celebrations from "./pages/celebration-pages/celebrations";
import CelebrationsMeals from "./pages/celebration-pages/celebrationsMeals";
import CelebrationsCheckout from "./pages/checkout-pages/celebrationsCheckout";
import MyOrders from "./pages/myOrders";
import AppLoader from "./components/app-Loader";

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
      <Route path="/menu" element={<Celebrations />} />
      <Route path="/create-menu" element={<CreateMenu />} />
      {/* <Route path="/menu/:id" element={<Menu />} /> */}
      {/* <Route path="/menu/checkout" element={<Checkout />} /> */}
      {/* <Route path="/bulk" element={<BulkOrder />} /> */}
      <Route path="/bulk/checkout" element={<BulkCheckout />} />
      {/* <Route path="/mealbox" element={<Mealbox />} /> */}
      {/* <Route path="/mealbox/create" element={<CreateMealBox />} /> */}
      {/* <Route path="/mealbox/checkout" element={<MealBoxCheckout />} /> */}
      <Route path="/celebrations" element={<Celebrations />} />
      <Route path="/meal" element={<CelebrationsMeals />} />
      <Route path="/celebrations/checkout" element={<CelebrationsCheckout />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="*" element={<Celebrations />} />
      {/* for style import */}
      <Route path="/qwertyuiop" element={<Mealbox />} />
      <Route path="/qwertyuiopz" element={<Home />} />
      <Route path="/qwertyuiopzz" element={<Menu />} />
    </Routes>
  );
};


export default App
