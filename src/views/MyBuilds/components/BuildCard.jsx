import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MdComputer } from 'react-icons/md';
import { Spinner } from '@/components/ui/LoadingIndicator';

const BuildCard = ({ build, onEdit, onDelete, isDeleting }) => {
  const getComponentCount = (components) => {
    return Object.keys(components || {}).length;
  };

  const getComponentTypes = (components) => {
    return Object.keys(components || {}).slice(0, 3);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-['Bruno_Ace_SC'] text-lg mb-2 line-clamp-1">
              {build.build_name}
            </h3>
            <p className="text-green-50 text-sm font-medium">
              {getComponentCount(build.components)} Components
            </p>
          </div>
          <MdComputer className="text-white text-4xl opacity-90" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Components Preview */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Includes:</p>
          <div className="flex flex-wrap gap-2">
            {getComponentTypes(build.components).map((type, idx) => (
              <span
                key={idx}
                className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200"
              >
                {type}
              </span>
            ))}
            {getComponentCount(build.components) > 3 && (
              <span className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
                +{getComponentCount(build.components) - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-5 pb-5 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Total Price</p>
          <p className="text-3xl font-['Bruno_Ace_SC'] text-green-600">
            ₱{parseFloat(build.total_price).toLocaleString()}
          </p>
        </div>

        {/* Date */}
        <div className="mb-5">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Created:</span> {new Date(build.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(build)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95"
          >
            <FaEdit />
            <span>Load Build</span>
          </button>
          <button
            onClick={() => onDelete(build.id, build.build_name)}
            disabled={isDeleting}
            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            title="Delete Build"
          >
            {isDeleting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildCard;
