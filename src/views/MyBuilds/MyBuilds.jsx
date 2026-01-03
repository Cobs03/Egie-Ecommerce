import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildService from '@/services/BuildService';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { FaEdit, FaTrash, FaShoppingCart, FaDesktop, FaPlus } from 'react-icons/fa';
import { MdComputer } from 'react-icons/md';

const MyBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useCart();

  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = async () => {
    setIsLoading(true);
    try {
      const userBuilds = await BuildService.getUserBuilds();
      setBuilds(userBuilds);
    } catch (error) {
      toast.error('Failed to load builds', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (buildId, buildName) => {
    if (window.confirm(`Are you sure you want to delete "${buildName}"?`)) {
      setDeletingId(buildId);
      try {
        await BuildService.deleteBuild(buildId);
        toast.success('Build deleted successfully');
        loadBuilds();
      } catch (error) {
        toast.error('Failed to delete build', {
          description: error.message
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (build) => {
    // Navigate to SystemBuild with build data in state
    navigate('/buildpc', { 
      state: { 
        loadBuild: build 
      } 
    });
  };

  const getComponentCount = (components) => {
    return Object.keys(components || {}).length;
  };

  const getComponentTypes = (components) => {
    return Object.keys(components || {}).slice(0, 3);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <MdComputer className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your saved builds.</p>
            <button
              onClick={() => navigate('/signin')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">My PC Builds</h1>
          <p className="text-gray-600">Manage and load your saved custom PC configurations</p>
        </div>

        {/* Create New Build Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/buildpc')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <FaPlus />
            <span>Create New Build</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : builds.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaDesktop className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Builds Yet</h3>
            <p className="text-gray-600 mb-6">Start creating your custom PC build and save it here!</p>
            <button
              onClick={() => navigate('/buildpc')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all inline-flex items-center gap-2"
            >
              <FaPlus />
              <span>Create Your First Build</span>
            </button>
          </div>
        ) : (
          /* Builds Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <div
                key={build.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                        {build.build_name}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {getComponentCount(build.components)} Components
                      </p>
                    </div>
                    <MdComputer className="text-white text-3xl opacity-80" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Components Preview */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {getComponentTypes(build.components).map((type, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {type}
                        </span>
                      ))}
                      {getComponentCount(build.components) > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{getComponentCount(build.components) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₱{parseFloat(build.total_price).toLocaleString()}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(build.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(build)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      <FaEdit />
                      <span>Load</span>
                    </button>
                    <button
                      onClick={() => handleDelete(build.id, build.build_name)}
                      disabled={deletingId === build.id}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {deletingId === build.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBuilds;
