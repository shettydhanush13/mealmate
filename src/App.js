import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./pages/home"
import OTPLogin from "./pages/login"
import Menu from "./pages/menu";

const App = () => {
 return (
   <div className="App">
     <BrowserRouter>
       <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu/:id" element={<Menu />} />
          <Route path="/login" element={<OTPLogin />} />
       </Routes>
     </BrowserRouter>
   </div>
 )
}

export default App
