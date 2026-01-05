import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const BuildsHeader = ({ onCreateNew, buildCount = 0 }) => {
  const titleAnim = useScrollAnimation({ threshold: 0.1 });
  const buttonAnim = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="mb-6">
      {/* Title and Separator */}
      <div
        ref={titleAnim.ref}
        className={`transition-all duration-700 ${
          titleAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-['Bruno_Ace_SC'] text-gray-900 mb-4">
          My PC Builds
        </h1>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-lg mb-6">
        Manage and load your saved custom PC configurations
      </p>
      <hr className="border-t-2 border-gray-500 mb-6" />
      
      {/* Create New Build Button with Counter */}
      <div
        ref={buttonAnim.ref}
        className={`flex items-center gap-4 transition-all duration-700 ${
          buttonAnim.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium active:scale-95"
        >
          <FaPlus />
          <span>Create New Build</span>
        </button>
        
        {buildCount > 0 && (
          <span className="text-gray-600 font-medium">
            {buildCount} {buildCount === 1 ? 'created build' : 'created builds'}
          </span>
        )}
      </div>
    </div>
  );
};

export default BuildsHeader;
