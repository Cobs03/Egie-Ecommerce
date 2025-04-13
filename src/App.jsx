import React from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom'
import Navbar from './views/Components/Navbar/Navbar'
import SignUp from './views/SignUp/SignUp'  
import Landing from './views/Landing/Landing'
import SignIn from './views/SignIn/SignIn'

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
      </Routes>
    </>
  );
};

export default App
