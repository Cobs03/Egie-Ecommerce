import React from 'react';
import { FaDesktop, FaPlus } from 'react-icons/fa';

const EmptyState = ({ onCreateNew }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-16 text-center">
      <FaDesktop className="text-7xl text-gray-300 mx-auto mb-6" />
      <h3 className="text-2xl font-['Bruno_Ace_SC'] text-gray-800 mb-3">No Builds Yet</h3>
      <p className="text-gray-600 mb-8 text-lg">Start creating your custom PC build and save it here!</p>
      <button
        onClick={onCreateNew}
        className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg active:scale-95"
      >
        <FaPlus />
        <span>Create Your First Build</span>
      </button>
    </div>
  );
};

export default EmptyState;
