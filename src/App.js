import { Routes, Route, BrowserRouter } from "react-router-dom"
import Checkout from "./pages/checkout";
import Home from "./pages/home"
import Landing from "./pages/landing";
import Mealbox from "./pages/mealbox";
import CreateMenu from "./pages/create-menu";
import Menu from "./pages/menu";
import CreateMealBox from "./pages/create-mealbox";
import MealBoxCheckout from "./pages/mealBoxCheckout";

const App = () => {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/menu" element={<Home />} />
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/mealbox" element={<Mealbox />} />
        <Route path="/create-menu" element={<CreateMenu />} />
        <Route path="/mealbox/create" element={<CreateMealBox />} />
        <Route path="/mealbox/checkout" element={<MealBoxCheckout />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
 )
}

export default App
