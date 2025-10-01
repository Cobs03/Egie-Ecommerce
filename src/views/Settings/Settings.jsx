import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaCreditCard, FaBell, FaMapMarkerAlt, FaHistory } from "react-icons/fa";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User profile data from Supabase
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    avatar: `https://ui-avatars.io/api/?name=${user?.email?.charAt(0).toUpperCase() || "U"}&background=000000&color=ffffff&size=150`
  });

  // Load user profile data on component mount
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user profile from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine for new users
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setUserData(prev => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          phone: data.phone || "",
          avatar: data.avatar_url || `https://ui-avatars.io/api/?name=${user?.email?.charAt(0).toUpperCase() || "U"}&background=000000&color=ffffff&size=150`
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Form handling
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData.firstName.trim() || !userData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Update or insert user profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          phone: userData.phone.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      setMessage("Profile updated successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage("Password updated successfully!");
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setUserData(prev => ({
        ...prev,
        avatar: publicUrl
      }));

      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-['Bruno_Ace_SC']">
          Account Settings
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{`${userData.firstName} ${userData.lastName}`}</p>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                <ul>
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "profile"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaUser className="mr-3" />
                      <span>Profile Information</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "security"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaLock className="mr-3" />
                      <span>Security</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("payment")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "payment"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaCreditCard className="mr-3" />
                      <span>Payment Methods</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "addresses"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaMapMarkerAlt className="mr-3" />
                      <span>Addresses</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "notifications"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaBell className="mr-3" />
                      <span>Notifications</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("order-history")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
                        activeTab === "order-history"
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaHistory className="mr-3" />
                      <span>Order History</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow overflow-hidden">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Profile Information
                </h2>

                {/* Success Message */}
                {message && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {message}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden mr-6 border-2 border-gray-200">
                        <img
                          src={userData.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className={`inline-block px-4 py-2 rounded cursor-pointer transition ${
                            uploadingImage
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {uploadingImage ? "Uploading..." : "Change Photo"}
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, GIF or PNG. Max size 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="firstName"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={userData.firstName}
                        onChange={(e) => {
                          setUserData({
                            ...userData,
                            firstName: e.target.value,
                          });
                          // Clear errors when user starts typing
                          if (error) setError("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="lastName"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={userData.lastName}
                        onChange={(e) => {
                          setUserData({ ...userData, lastName: e.target.value });
                          // Clear errors when user starts typing
                          if (error) setError("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userData.email}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50 focus:ring-green-500 focus:border-green-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed here. Contact support if you need to update your email.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="phone"
                    >
                      Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => {
                        setUserData({ ...userData, phone: e.target.value });
                        // Clear errors when user starts typing
                        if (error) setError("");
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your phone number (e.g., +63 915 123 4567)"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 rounded-lg transition ${
                        loading
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Security Settings
                </h2>

                {/* Success Message */}
                {message && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {message}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-4">
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="currentPassword"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded pr-10 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showCurrentPassword ? (
                            <IoMdEyeOff className="w-5 h-5" />
                          ) : (
                            <IoMdEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="newPassword"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            // Clear errors when user starts typing
                            if (error) setError("");
                          }}
                          className="w-full p-2 border border-gray-300 rounded pr-10 focus:ring-green-500 focus:border-green-500"
                          required
                          minLength={6}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showNewPassword ? (
                            <IoMdEyeOff className="w-5 h-5" />
                          ) : (
                            <IoMdEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters long.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="confirmPassword"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            // Clear errors when user starts typing
                            if (error) setError("");
                          }}
                          className="w-full p-2 border border-gray-300 rounded pr-10 focus:ring-green-500 focus:border-green-500"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <IoMdEyeOff className="w-5 h-5" />
                          ) : (
                            <IoMdEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg transition ${
                          loading
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account by enabling
                    two-factor authentication.
                  </p>
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === "payment" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Payment Methods
                  </h2>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Add New Card
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded mr-4">
                          <FaCreditCard className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                          Default
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded mr-4">
                          <FaCreditCard className="text-red-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 5555</p>
                          <p className="text-sm text-gray-500">Expires 08/26</p>
                        </div>
                      </div>
                      <div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Your payment information is encrypted and securely stored.
                </p>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Shipping Addresses
                  </h2>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="font-medium mr-2">Home</span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Default
                          </span>
                        </div>
                        <p className="text-gray-600">Bruce Wayne</p>
                        <p className="text-gray-600">1007 Mountain Drive</p>
                        <p className="text-gray-600">Gotham City, 12345</p>
                        <p className="text-gray-600">Philippines</p>
                        <p className="text-gray-600">+63 915 123 4567</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="font-medium mr-2">Office</span>
                        </div>
                        <p className="text-gray-600">Bruce Wayne</p>
                        <p className="text-gray-600">
                          Wayne Tower, 1 Enterprise Ave
                        </p>
                        <p className="text-gray-600">Gotham City, 12345</p>
                        <p className="text-gray-600">Philippines</p>
                        <p className="text-gray-600">+63 915 123 8910</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-gray-500">
                            Receive updates about your orders
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotions & Deals</p>
                          <p className="text-sm text-gray-500">
                            Get notified about sales and special offers
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Stock Alerts</p>
                          <p className="text-sm text-gray-500">
                            Get notified when items in your wishlist are back in
                            stock
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-3">
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-gray-500">
                            Receive push notifications about your orders
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotions & Deals</p>
                          <p className="text-sm text-gray-500">
                            Get push notifications about sales and special
                            offers
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Order History Tab */}
            {activeTab === "order-history" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Order History
                </h2>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-sm text-gray-500">Order #12345</p>
                          <p className="font-medium">September 15, 2023</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Delivered
                          </span>
                          <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="w-16 h-16 rounded overflow-hidden mr-4">
                            <img
                              src="https://placehold.co/100x100/333/white?text=GPU"
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              NVIDIA GeForce RTX 3080
                            </p>
                            <p className="text-sm text-gray-500">Qty: 1</p>
                          </div>
                        </div>
                        <div className="font-medium">₱45,999.00</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-sm text-gray-500">Order #12346</p>
                          <p className="font-medium">August 28, 2023</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Delivered
                          </span>
                          <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="w-16 h-16 rounded overflow-hidden mr-4">
                            <img
                              src="https://placehold.co/100x100/333/white?text=CPU"
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">AMD Ryzen 9 5900X</p>
                            <p className="text-sm text-gray-500">Qty: 1</p>
                          </div>
                        </div>
                        <div className="font-medium">₱28,500.00</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-sm text-gray-500">Order #12347</p>
                          <p className="font-medium">July 10, 2023</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Delivered
                          </span>
                          <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="w-16 h-16 rounded overflow-hidden mr-4">
                            <img
                              src="https://placehold.co/100x100/333/white?text=RAM"
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              Corsair Vengeance RGB Pro 32GB
                            </p>
                            <p className="text-sm text-gray-500">Qty: 2</p>
                          </div>
                        </div>
                        <div className="font-medium">₱12,800.00</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="text-green-600 hover:text-green-800 font-medium">
                    Load More Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;