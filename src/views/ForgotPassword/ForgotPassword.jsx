import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } else {
        setMessage('Password reset email sent! Please check your inbox and click the reset link.');
        setEmail(''); // Clear the form
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen text-[#F3F7F6]">
      {/* Left Side with Form */}
      <div className="w-full md:w-1/2 bg-black p-4 md:p-10 shadow-lg flex flex-col justify-center h-full overflow-y-auto">
        <div className="flex items-center mb-3 justify-center">
          <img
            className="w-24 h-16 md:w-28 md:h-20 object-contain"
            src="https://i.ibb.co/Cpx2BBt5"
            alt="Logo"
          />
        </div>

        <h2 className="font-bold text-xl md:text-3xl mb-2 text-center">
          Reset Your Password
        </h2>
        <p className="mb-4 text-center text-sm md:text-base">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {/* Mobile Notice */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
          <p className="text-center">
            📱 <strong>Mobile users:</strong> Please use a desktop/laptop computer to complete the password reset process, or wait for our mobile app deployment.
          </p>
        </div>

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

        <form onSubmit={handleResetPassword}>
          {/* Email */}
          <label className="text-sm" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(''); // Clear error when user starts typing
            }}
            className="p-2 border border-gray-300 rounded w-full text-black mb-4"
            placeholder="wayne.enterprises@gotham.com"
            required
          />

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-[60%] bg-blue-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-blue-600 border hover:border-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>

        {/* Back to Sign In */}
        <div className="flex justify-center mt-6">
          <p className="text-sm">
            Remember your password?{" "}
            <Link to="/signin" className="text-blue-400 underline hover:text-blue-300">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side with Illustration - Only visible on desktop */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-200 to-purple-200 items-center justify-center">
        <img
          className="w-full h-full object-cover"
          src="https://i.ibb.co/yF04zrC9"
          alt="Computer Illustration"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
