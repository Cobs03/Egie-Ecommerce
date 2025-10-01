import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          }
        }
      });

      if (error) {
        // Handle specific Supabase errors with user-friendly messages
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('Invalid email')) {
          setError("Please enter a valid email address.");
        } else if (error.message.includes('Password should contain at least one character')) {
          setError("Password must contain at least one uppercase letter, lowercase letter, number, and special character.");
        } else if (error.message.includes('Password should be at least')) {
          setError("Password must be at least 6 characters long.");
        } else if (error.message.includes('User already registered')) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else {
        setMessage("Please check your email for the confirmation link! Note: If this email is already registered, no new confirmation email will be sent - please try signing in instead.");
        // Optionally redirect to sign in page after a delay
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        // Handle Google OAuth specific errors
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setError("An account with this Google email already exists. Please sign in instead.");
        } else {
          setError("Failed to sign up with Google. Please try again or use email signup.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side with Illustration - Only visible on desktop */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-200 to-purple-200 items-center justify-center">
        <div className="rounded-lg w-full h-full bg-opacity-50">
          <img
            className="w-full h-full object-cover"
            src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
            alt="Computer Illustration"
          />
        </div>
      </div>

      {/* Right Side with Form - Added overflow-y-auto for mobile */}
      <div className="w-full md:w-1/2 bg-black text-[#F3F7F6] p-4 md:p-10 shadow-lg flex flex-col justify-center overflow-y-auto">
        <div className="flex items-center mb-3 justify-center">
          <img
            className="w-24 h-16 md:w-28 md:h-20 object-contain"
            src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
            alt="Logo"
          />
        </div>
        <h2 className="font-bold text-xl md:text-3xl mb-2 text-center">
          Power Up Your Build – Premium Parts. Peak Performance.
        </h2>
        <p className="mb-4 text-center text-sm md:text-base">
          Welcome! Please Sign Up to continue
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="flex flex-col sm:flex-row w-full justify-between sm:gap-4">
            <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
              <label className="mb-1 text-sm block" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded w-full text-black"
                placeholder="Bruce"
                required
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="mb-1 text-sm block" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded w-full text-black"
                placeholder="Wayne"
                required
              />
            </div>
          </div>

          <label className="text-sm mt-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full text-black"
            placeholder="wayne.enterprises@gotham.com"
            required
          />

          <label className="text-sm" htmlFor="password">
            Password
          </label>

          <div className="relative mt-1 mb-2">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full pr-10 text-black"
              placeholder="********"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <IoMdEyeOff className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs mb-4">
            By signing up, you agree to our company's{" "}
            <Link to="/terms" className="text-blue-500">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-blue-500">
              Privacy Policy
            </Link>
            .
          </p>

          {/* SignUp Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-[60%] bg-green-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-transparent border hover:border-green-500 hover:text-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing Up..." : "SIGN UP"}
            </button>
          </div>
        </form>

        {/* OR */}
        <p className="text-center my-1 text-white">OR</p>

        {/* Google Button */}
        <div className="flex justify-center">
          <button 
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="flex items-center justify-center w-full sm:w-[60%] p-2 sm:p-3 bg-gray-200 text-black rounded-3xl hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>{loading ? "Loading..." : "Google"}</span>
          </button>
        </div>

        <div className="flex justify-center">
          <p className="mt-4 text-sm pb-4">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-400 underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;