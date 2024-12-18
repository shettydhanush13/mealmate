import { Routes, Route, BrowserRouter } from "react-router-dom"
import Checkout from "./pages/checkout";
import Home from "./pages/home"
import Landing from "./pages/landing";
import Mealbox from "./pages/mealbox";
import CreateMenu from "./pages/create-menu";
import Menu from "./pages/menu";
// import CreateMealBox from "./pages/create-mealbox";
// import MealBoxCheckout from "./pages/mealBoxCheckout";
import BulkCheckout from "./pages/bulkCheckout";
import BulkOrder from "./pages/bulk";

const App = () => {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/menu" element={<Home />} />
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/qwertyytrewq432" element={<Mealbox />} />
        <Route path="/bulk" element={<BulkOrder />} />
        <Route path="/qwertyytrewq123" element={<CreateMenu />} />
        {/* <Route path="/mealbox/create" element={<CreateMealBox />} /> */}
        <Route path="/bulk-checkout" element={<BulkCheckout />} />
        <Route path="*" element={<BulkOrder />} />
      </Routes>
    </BrowserRouter>
 )
}

export default App
