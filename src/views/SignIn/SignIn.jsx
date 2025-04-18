import React from "react";
import "./SignIn.css";
import { Link } from "react-router-dom";

const SignIn = () => {

    return (
      <>
        <button>
        <Link to="/">Back to Home Page</Link>
        </button>
        <div className="signin-container">
          <div className="form-container">
            <h2>Create an Account</h2>
            <input type="text" placeholder="Username" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" /> 
            <p className="terms">
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
            </p>
            <p className="login-link">
              Already have an account? <a href="#">Sign In</a>.
            </p>

            <button className="signup-button">Create Account</button>

            <p className="toggle-signin">
              Already have an account?
              <Link to="/auth">
                <a href="#">Sign Up</a>
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