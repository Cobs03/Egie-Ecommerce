import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./views/Components/Navbar/Navbar";
import SignUp from "./views/SignUp/SignUp";
import Landing from "./views/Landing/Landing";
import SignIn from "./views/SignIn/SignIn";
import Footer from "./views/Components/Footer/Footer";
import Products from "./views/Products/Products";
import ProductDetails from "./views/Products/ProductGrid/ProductDetails/ProductDetails";
import Cart from "./views/Cart/Cart";
import Checkout from "./views/Checkout/Checkout";
import ThankYou from "./views/Checkout/Thankyou";
import ScrollToTop from "./views/Components/ScrollToTop/ScrollToTop";
import SystemBuild from "./views/SystemBuild/SystemBuild";
import ContactUs from "./views/ContactUs/ContactUs";
import Notification from "./views/Notifications/Notification";
import Purchases from "./views/Purchases/Purchases";
import OrderDetails from "./views/Purchases/Purchase Components/OrderDetails";

import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

// Separate component so we can access route info
const Main = () => {
  const location = useLocation();

  // Detect if current route is sign-in/sign-up page
  const isAuthPage =
    location.pathname === "/auth" || location.pathname === "/signin";

  return (
    <>
      {!isAuthPage && <Navbar isAuth={isAuthPage} />}
      <ScrollToTop />
      <main className={!isAuthPage ? "pt-[70px]" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth"
            element={
              <div className="">
                <SignUp />
              </div>
            }
          />
          <Route
            path="/signin"
            element={
              <div className="">
                <SignIn />
              </div>
            }
          />
          <Route
            path="/products"
            element={
              <div className="pt-[20px]">
                <Products />
              </div>
            }
          />
          <Route
            path="/products/details/:id"
            element={
              <div className="pt-[20px]">
                <ProductDetails />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="pt-[20px]">
                <Cart />
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <div className="pt-[20px]">
                <Checkout />
              </div>
            }
          />
          <Route
            path="/thankyou"
            element={
              <div className="pt-[20px]">
                <ThankYou />
              </div>
            }
          />
          <Route
            path="/buildpc"
            element={
              <div className="pt-[20px]">
                <SystemBuild />
              </div>
            }
          />
          <Route
            path="/contactus"
            element={
              <div className="pt-[20px]">
                <ContactUs />
              </div>
            }
          />
          <Route
            path="/notification"
            element={
              <div className="pt-[20px]">
                <Notification />
              </div>
            }
          />
          <Route
            path="/purchases"
            element={
              <div className="pt-[20px]">
                <Purchases />
              </div>
            }
          />
          <Route
            path="/purchases/details/:id"
            element={
              <div className="pt-[20px]">
                <OrderDetails />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer isAuth={isAuthPage} />
      <Toaster richColors position="bottom-right" />
    </>
  );
};

export default App;
