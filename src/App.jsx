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
import LoadingSpinner from "./components/LoadingSpinner";
import AIChatBox from "./components/AIChatBox";

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
      <LoadingSpinner />
      {!isAuthPage && (
        <Navbar
          className="fixed top-0 left-0 right-0 z-[500]"
          isAuth={isAuthPage}
        />
      )}
      <ScrollToTop />
      <main className={!isAuthPage ? "container-responsive" : ""}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <Landing />
              </div>
            }
          />
          <Route
            path="/auth"
            element={
              <div className="container-responsive">
                <SignUp />
              </div>
            }
          />
          <Route
            path="/signin"
            element={
              <div className="container-responsive">
                <SignIn />
              </div>
            }
          />
          <Route
            path="/products"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <Products />
              </div>
            }
          />
          <Route
            path="/products/details"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <ProductDetails />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <Cart />
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <Checkout />
              </div>
            }
          />
          <Route
            path="/thankyou"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <ThankYou />
              </div>
            }
          />
          <Route
            path="/buildpc"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <SystemBuild />
              </div>
            }
          />
          <Route
            path="/contactus"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <ContactUs />
              </div>
            }
          />
          <Route
            path="/notification"
            element={
              <div className="mt-32.5 max-md:mt-22.5 container-responsive">
                <Notification />
              </div>
            }
          />
          <Route
            path="/purchases"
            element={
              <div className="pt-[20px] container-responsive">
                <Purchases />
              </div>
            }
          />
          <Route
            path="/purchases/details/:id"
            element={
              <div className="pt-[20px] container-responsive">
                <OrderDetails />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer isAuth={isAuthPage} />
      <AIChatBox />
      <Toaster richColors position="bottom-right" />
    </>
  );
};

export default App;
