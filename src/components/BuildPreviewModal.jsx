import React from 'react';
import { FaHeart, FaShoppingCart, FaEye, FaTimes } from 'react-icons/fa';
import { MdComputer } from 'react-icons/md';

const BuildPreviewModal = ({ isOpen, onClose, build, onEdit, onAddToCart }) => {
  if (!isOpen || !build) return null;

  const components = Array.isArray(build.components) 
    ? build.components 
    : (typeof build.components === 'string' ? JSON.parse(build.components) : []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{build.build_name}</h2>
            {build.created_by_username && (
              <p className="text-sm text-gray-500">by {build.created_by_username}</p>
            )}
            {build.is_public && (
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Public Build
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <FaHeart className="text-red-500" />
            <span className="font-semibold">{build.likes_count || 0}</span>
            <span className="text-sm">Likes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaShoppingCart className="text-blue-500" />
            <span className="font-semibold">{build.purchase_count || 0}</span>
            <span className="text-sm">Purchases</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaEye className="text-purple-500" />
            <span className="font-semibold">{build.view_count || 0}</span>
            <span className="text-sm">Views</span>
          </div>
        </div>

        {/* Components List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Components ({components.length})
          </h3>
          <div className="space-y-3">
            {components.map((component, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Component Image */}
                <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {component.img ? (
                    <img
                      src={component.img}
                      alt={component.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <MdComputer className="text-gray-400" size={32} />
                  )}
                </div>

                {/* Component Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {component.name}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {component.category}
                  </p>
                </div>

                {/* Component Price */}
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ₱{Number(component.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-700">Total Price:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₱{Number(build.total_price || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Build
            </button>
            <button
              onClick={onAddToCart}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPreviewModal;
