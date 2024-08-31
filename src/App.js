import { Routes, Route, BrowserRouter } from "react-router-dom"
import Checkout from "./pages/checkout";
import Home from "./pages/home"
import OTPLogin from "./pages/login"
import Menu from "./pages/menu";

const App = () => {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/login" element={<OTPLogin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
 )
}

export default App
