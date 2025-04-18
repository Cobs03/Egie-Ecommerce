import React from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom'
import Navbar from './views/Components/Navbar/Navbar'
import SignUp from './views/SignUp/SignUp'  
import Landing from './views/Landing/Landing'
import SignIn from './views/SignIn/SignIn'
import Footer from './views/Components/Footer/Footer'
import Products from './views/Products/Products'
import ProductDetails from './views/Products/ProductGrid/ProductDetails/ProductDetails';
import Cart from './views/Cart/Cart';
import Checkout from './views/Checkout/Checkout';
import ThankYou from './views/Thankyou/Thankyou';

function App() {

  return (
    <Router>
      <Main />
    </Router>
  )
}

// Separate component so we can access route info
const Main = () => {
  const location = useLocation();

  // Detect if current route is sign-in/sign-up page
  const isAuthPage =location.pathname === "/auth" || location.pathname === "/signin";


  return (
    <>
      <Navbar isAuth={isAuthPage} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/details/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/thankyou" element={<ThankYou />} />
        {/* Add more routes as needed */}
      </Routes>
      <Footer isAuth={isAuthPage}/>
    </>
  );
};

export default App
