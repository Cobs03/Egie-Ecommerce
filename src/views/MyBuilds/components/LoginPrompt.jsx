import React from 'react';
import { MdComputer } from 'react-icons/md';

const LoginPrompt = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white pt-20 px-4">
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <MdComputer className="text-7xl text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-['Bruno_Ace_SC'] text-gray-800 mb-3">Please Login</h2>
          <p className="text-gray-600 mb-8 text-lg">You need to be logged in to view your saved builds.</p>
          <button
            onClick={onLogin}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
