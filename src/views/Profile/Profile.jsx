import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Please log in to view your profile.</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">User Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-sm text-gray-500 font-mono">{user.id}</p>
                </div>
                
                {user.user_metadata?.first_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg text-gray-900">
                      {user.user_metadata.first_name} {user.user_metadata.last_name}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Account Created</label>
                  <p className="text-lg text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Last Sign In</label>
                  <p className="text-lg text-gray-900">
                    {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email Verified</label>
                  <p className="text-lg text-gray-900">
                    {user.email_confirmed_at ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-red-600">✗ Not Verified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* User Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Account Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Sign Out
                </button>
                
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                  Edit Profile
                </button>
                
                <button className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200">
                  Change Password
                </button>
              </div>
              
              {/* Debug Information */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Debug Info (Remove in production)</h3>
                <pre className="text-xs text-gray-500 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;