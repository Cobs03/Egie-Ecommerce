import React, { useState } from "react";
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
import BundleDetails from "./views/Products/ProductGrid/ProductDetails/BundleDetails";
import Cart from "./views/Cart/Cart";
import Checkout from "./views/Checkout/Checkout";
import ThankYou from "./views/Checkout/Thankyou";
import ScrollToTop from "./views/Components/ScrollToTop/ScrollToTop";
import SystemBuild from "./views/SystemBuild/SystemBuild";
import ContactUs from "./views/ContactUs/ContactUs";
import Notification from "./views/Notifications/Notification";
import Purchases from "./views/Purchases/Purchases";
import OrderDetails from "./views/Purchases/Purchase Components/OrderDetails";
import MyInquiries from "./views/MyInquiries/MyInquiries";
import LoadingSpinner from "./components/LoadingSpinner";
import AIChatBox from "./components/AIChatBox";
import PopupAdModal from "./components/PopupAdModal";
import { OrderProvider } from "./views/Purchases/Purchase Components/OrderContext";
import { AuthProvider } from "./contexts/AuthContext";
import Tracking from "./views/Purchases/Purchase Components/Tracking";
import Notfound from "./views/Notfound/Notfound";
import Compare from "./views/Compare/Compare";
import ForgotPassword from "./views/ForgotPassword/ForgotPassword";
import ResetPassword from "./views/ResetPassword/ResetPassword";
import Terms from "./views/Policy and Terms/Terms";
import Policy from "./views/Policy and Terms/Policy";
import Settings from "./views/Settings/Settings";
import PaymentSuccess from "./views/Payment/PaymentSuccess";
import PaymentFailed from "./views/Payment/PaymentFailed";

import { Toaster } from "../src/components/ui/sonner";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <OrderProvider>
            <div className="bg-[#F3F7F6] min-h-screen">
              <Main />
            </div>
          </OrderProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
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
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
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
            path="/forgot-password"
            element={
              <div className="container-responsive">
                <ForgotPassword />
              </div>
            }
          />
          <Route
            path="/reset-password"
            element={
              <div className="container-responsive">
                <ResetPassword />
              </div>
            }
          />
          <Route
            path="/products"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Products />
              </div>
            }
          />
          <Route
            path="/products/details"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <ProductDetails />
              </div>
            }
          />
          <Route
            path="/products/bundle-details/:bundleId"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <BundleDetails />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Cart />
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Checkout />
              </div>
            }
          />
          <Route
            path="/thankyou"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <ThankYou />
              </div>
            }
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment-failed"
            element={<PaymentFailed />}
          />
          <Route
            path="/buildpc"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <SystemBuild />
              </div>
            }
          />
          <Route
            path="/contactus"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <ContactUs />
              </div>
            }
          />
          <Route
            path="/notification"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Notification />
              </div>
            }
          />
          <Route
            path="/purchases"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Purchases />
              </div>
            }
          />
          <Route
            path="/purchases/details/:id"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <OrderDetails />
              </div>
            }
          />
          <Route
            path="/purchases/tracking/:id"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Tracking />
              </div>
            }
          />
          <Route
            path="/my-inquiries"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <MyInquiries />
              </div>
            }
          />
          <Route
            path="/compare"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Compare />
              </div>
            }
          />
          <Route
            path="/terms"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Terms />
              </div>
            }
          />
          <Route
            path="/privacy"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Policy />
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Settings />
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="mt-[120px] max-md:mt-[65px] container-responsive">
                <Notfound />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer isAuth={isAuthPage} />
      <AIChatBox />
      <PopupAdModal page={location.pathname === "/" ? "home" : location.pathname.includes("/products") ? "products" : "all"} />
      <Toaster richColors position="bottom-right" />
    </>
  );
};

export default App;
