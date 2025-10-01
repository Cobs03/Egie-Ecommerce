import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const initializePasswordReset = async () => {
      // Give Supabase time to process the authentication from URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is authenticated (Supabase should have processed the tokens)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Check if we have tokens in URL as fallback
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (!accessToken || !refreshToken) {
          setError('Invalid reset link. Please request a new password reset.');
        }
      }
      
      setInitializing(false);
    };

    initializePasswordReset();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('Password should contain at least one character')) {
          setError('Password must contain at least one uppercase letter, lowercase letter, number, and special character.');
        } else {
          setError('Failed to update password. Please try again.');
        }
      } else {
        setMessage('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initializing
  if (initializing) {
    return (
      <div className="flex flex-col md:flex-row h-screen text-[#F3F7F6]">
        <div className="w-full md:w-1/2 bg-black p-4 md:p-10 shadow-lg flex flex-col justify-center h-full overflow-y-auto">
          <div className="flex items-center mb-3 justify-center">
            <img
              className="w-24 h-16 md:w-28 md:h-20 object-contain"
              src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
              alt="Logo"
            />
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm md:text-base">Initializing password reset...</p>
          </div>
        </div>
        <div className="hidden md:block w-1/2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen text-[#F3F7F6]">
      {/* Left Side with Form */}
      <div className="w-full md:w-1/2 bg-black p-4 md:p-10 shadow-lg flex flex-col justify-center h-full overflow-y-auto">
        <div className="flex items-center mb-3 justify-center">
          <img
            className="w-24 h-16 md:w-28 md:h-20 object-contain"
            src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
            alt="Logo"
          />
        </div>

        <h2 className="font-bold text-xl md:text-3xl mb-2 text-center">
          Set New Password
        </h2>
        <p className="mb-4 text-center text-sm md:text-base">
          Enter your new password below
        </p>

        {/* Error Message */}
        {error && !initializing && (
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

        <form onSubmit={handleResetPassword}>
          {/* New Password */}
          <div className="mb-4">
            <label className="text-sm" htmlFor="password">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(''); // Clear error when user starts typing
                }}
                className="p-2 border border-gray-300 rounded w-full pr-10 text-black"
                placeholder="Enter new password"
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
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="text-sm" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(''); // Clear error when user starts typing
                }}
                className="p-2 border border-gray-300 rounded w-full pr-10 text-black"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <IoMdEyeOff className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-[60%] bg-green-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-green-600 border hover:border-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Side with Illustration - Only visible on desktop */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-green-200 to-blue-200 items-center justify-center">
        <img
          className="w-full h-full object-cover"
          src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
          alt="Computer Illustration"
        />
      </div>
    </div>
  );
};

export default ResetPassword;