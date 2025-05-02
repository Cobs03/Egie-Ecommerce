import React, { useState } from "react";

import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import { FaGoogle } from "react-icons/fa";

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <>
        <div className="flex h-screen">
          {/* Left Side with Illustration */}
          <div className="w-1/2 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
            <div className="rounded-lg w-full h-full bg-opacity-50">
              <img
                className="w-full h-full object-cover"
                src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
                alt="Computer Illustration"
              />
            </div>
          </div>

          {/* Right Side with Form */}
          <div className="w-1/2 bg-black text-[#F3F7F6] p-10 shadow-lg flex flex-col justify-center">
            <div className="flex items-center mb-3 justify-center">
              <img
                className="w-28 h-20 object-contain"
                src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                alt="Logo"
              />
            </div>
            <h2 className="font-bold text-3xl mb-2 text-center">
              Power Up Your Build – Premium Parts. Peak Performance.
            </h2>
            <p className="mb-4 text-center">
              Welcome! Please Sign Up to continue
            </p>

            <div className="flex flex-row w-full justify-between gap-4">
              <div className="w-1/2">
                <label className="mb-2 text-sm block" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="mb-4 p-2 border border-gray-300 rounded w-full text-black"
                  placeholder="Bruce"
                />
              </div>
              <div className="w-1/2">
                <label className="mb-2 text-sm block" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="mb-4 p-2 border border-gray-300 rounded w-full text-black"
                  placeholder="Wayne"
                />
              </div>
            </div>

            <label className=" text-sm" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mb-4 p-2 border border-gray-300 rounded w-full text-black"
              placeholder="wayne.enterprises@gotham.com"
            />

            <label className=" text-sm" htmlFor="password">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="p-2 border border-gray-300 rounded w-full pr-10 text-black"
                placeholder="********"
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
              <a href="#" className="text-blue-500">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-500">
                Privacy Policy
              </a>
              .
            </p>

            {/* SignUp Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[60%] bg-green-500 text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-transparent border hover:border-green-500 hover:text-green-500 transition duration-200"
              >
                SIGN UP
              </button>
            </div>

            {/* OR */}
            <p className="text-center my-1 text-white">OR</p>

            {/* Google Button */}
            <div className="flex justify-center">
              <button className="flex items-center justify-center w-[60%] p-3 bg-gray-200 text-black rounded-3xl hover:bg-gray-300 transition duration-200">
                <FaGoogle className="w-5 h-5 mr-2" />
                <span>Google</span>
              </button>
            </div>

            <div className="flex justify-center">
              <p className="mt-4 text-sm">
                Already have an account?{" "}
                <Link to="/auth" className="text-blue-400 underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
}


export default SignIn;