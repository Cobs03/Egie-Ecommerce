import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useWebsiteSettings } from "../../hooks/useWebsiteSettings";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { settings } = useWebsiteSettings();

  // Scroll animations
  const formAnim = useScrollAnimation({ threshold: 0.1 });
  const imageAnim = useScrollAnimation({ threshold: 0.1 });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific Supabase errors with user-friendly messages
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email or password')) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          setError("Please confirm your email address before signing in. Check your inbox for a confirmation link.");
        } else if (error.message.includes('Too many requests')) {
          setError("Too many login attempts. Please wait a few minutes before trying again.");
        } else if (error.message.includes('User not found')) {
          setError("No account found with this email. Please sign up first.");
        } else {
          setError("Sign in failed. Please try again.");
        }
      } else {
        // Redirect to home page or dashboard
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
        if (error.message.includes('User not found')) {
          setError("No account found with this Google email. Please sign up first.");
        } else {
          setError("Failed to sign in with Google. Please try again or use email sign in.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen text-[#F3F7F6]">
      {/* Left Side with Form - Added overflow-y-auto for mobile */}
      <div 
        ref={formAnim.ref}
        className={`w-full md:w-1/2 bg-black p-4 md:p-10 shadow-lg flex flex-col justify-center h-full overflow-y-auto transition-all duration-700 ${
          formAnim.isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-8"
        }`}
      >
        <div className="flex items-center mb-3 justify-center">
          <img
            className="w-24 h-16 md:w-28 md:h-20 object-contain"
            src={settings?.logoUrl || "https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"}
            alt={settings?.brandName || "Logo"}
          />
        </div>

        <h2 className="font-bold text-xl md:text-3xl mb-2 text-center">
          Power Up Your Build – Premium Parts. Peak Performance.
        </h2>
        <p className="mb-4 text-center text-sm md:text-base">
          Welcome back! Please login to your account to continue
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          {/* Email */}
          <label className="text-sm" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full text-black mb-4 placeholder-gray-400"
            placeholder="wayne.enterprises@gotham.com"
            required
          />

          {/* Password */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <label className="text-sm" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="text-blue-500 text-sm sm:ml-4 mt-1 sm:mt-0">
                Forgot Password
              </Link>
            </div>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full pr-10 text-black placeholder-gray-400"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-all duration-200 active:scale-90 hover:scale-110"
              >
                {showPassword ? (
                  <IoMdEyeOff className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs mb-4">
            By signing up, you agree to our company's{" "}
            <Link to="/terms" className="text-blue-500">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-500">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Login Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-[60%] bg-green-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-transparent border hover:border-green-500 hover:text-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
            >
              {loading ? "Signing In..." : "LOG IN"}
            </button>
          </div>
        </form>

        {/* OR */}
        <p className="text-center my-2 md:my-4 text-white">OR</p>

        {/* Google Button */}
        <div className="flex justify-center">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center w-full sm:w-[60%] p-2 sm:p-3 bg-gray-200 text-black rounded-3xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
          >
            <FaGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>{loading ? "Loading..." : "Google"}</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="flex justify-center">
          <p className="mt-4 pb-4 text-sm">
            Don't have an account?{" "}
            <Link to="/auth" className="text-blue-400 underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side with Illustration - Only visible on desktop */}
      <div 
        ref={imageAnim.ref}
        className={`hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-200 to-purple-200 items-center justify-center transition-all duration-700 ${
          imageAnim.isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-8"
        }`}
      >
        <img
          className="w-full h-full object-cover"
          src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
          alt="Computer Illustration"
        />
      </div>
    </div>
  );
};

export default SignIn;
