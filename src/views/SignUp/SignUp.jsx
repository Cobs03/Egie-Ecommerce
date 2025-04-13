import React from "react";
import "./SignUp.css";
import { Link } from "react-router-dom";

const SignIn = () => {
    return (
      <>
      <button>
        <Link to="/">Back to Home Page</Link>
      </button>
        <div className="signup-container">
          <div className="form-container">
            <h2>Sign Up</h2>
            <input type="text" placeholder="Username or Email" />
            <input type="password" placeholder="Password" />
            <a href="#" className="forgot-password">
              Forgot your Password?
            </a>
            <button className="signup-button">Sign Up</button>
            <p className="toggle-signin">
              Don't have an account?
              <Link to="/signin">
                <a href="#">Sign In here</a>
              </Link>
            </p>
          </div>

          <div className="social-signup">
            <h3>Sign Up with</h3>
            <button className="google-button">Google</button>
            <button className="facebook-button">Facebook</button>
          </div>
        </div>
      </>
    );
}


export default SignIn;