import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaBell, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import OrderService from "../../services/OrderService";
import PhilippineAddressService from "../../services/PhilippineAddressService";
import { toast } from "sonner";

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
  
  // Philippine address API data
  const [provinces, setProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  // User profile data from Supabase
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    avatar: `https://ui-avatars.io/api/?name=${user?.email?.charAt(0).toUpperCase() || "U"}&background=000000&color=ffffff&size=150`
  });

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",
    address_type: "home",
    is_default: false
  });

  // Store province and city codes for API calls
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  // Notification preferences states
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_order_updates: true,
    email_promotions: true,
    email_stock_alerts: false,
    push_order_updates: true,
    push_promotions: false
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load user profile data on component mount
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadAddresses();
      loadNotificationPreferences();
    }
  }, [user]);

  // Load provinces from API
  const loadProvinces = async () => {
    try {
      const provinceData = await PhilippineAddressService.getProvinces();
      setProvinces(provinceData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Failed to load provinces');
    }
  };

  // Load cities when province changes
  const handleProvinceChange = async (provinceName, provinceCode) => {
    setLoadingLocations(true);
    try {
      setAddressForm(prev => ({ ...prev, province: provinceName, city: "", barangay: "" }));
      setSelectedProvinceCode(provinceCode);
      setAvailableCities([]);
      setAvailableBarangays([]);
      
      const cityData = await PhilippineAddressService.getCitiesByProvince(provinceCode);
      setAvailableCities(cityData);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
    } finally {
      setLoadingLocations(false);
    }
  };

  // Load barangays when city changes
  const handleCityChange = async (cityName, cityCode) => {
    setLoadingLocations(true);
    try {
      setAddressForm(prev => ({ ...prev, city: cityName, barangay: "" }));
      setSelectedCityCode(cityCode);
      setAvailableBarangays([]);
      
      const barangayData = await PhilippineAddressService.getBarangaysByCity(cityCode);
      setAvailableBarangays(barangayData);
    } catch (error) {
      console.error('Error loading barangays:', error);
      toast.error('Failed to load barangays');
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      // Get user profile from Supabase
      const { data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile load result:', { data, error }); // Debug log

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is okay for new users
          console.log('No profile found, user might be new');
          setError("Profile not found. Please try updating your information to create it.");
        } else {
          // Other errors
          console.error('Error loading profile:', error);
          setError(`Error loading profile: ${error.message}`);
        }
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
        setError(""); // Clear errors on successful load
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      setError(`Failed to load profile: ${error.message}`);
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
          email: user.email, // Include required email field
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          phone: userData.phone.trim(),
          avatar_url: userData.avatar, // Preserve current avatar
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select() // Important: add select() to get the response
        .single();

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

  // Load notification preferences
  const loadNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data && data.notification_preferences) {
        setNotificationPreferences(data.notification_preferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      // Keep default preferences if loading fails
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notificationPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  // Toggle notification preference
  const toggleNotification = (key) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwrite if file exists
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email, // Include required email field
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

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

  // Address management functions
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const { data, error } = await OrderService.getShippingAddresses();
      if (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses');
        setAddresses([]);
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: "",
      phone: "",
      email: "",
      street_address: "",
      barangay: "",
      city: "",
      province: "",
      postal_code: "",
      country: "Philippines",
      address_type: "home",
      is_default: addresses.length === 0 // First address is default
    });
    setAvailableCities([]);
    setAvailableBarangays([]);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setShowAddressModal(true);
  };

  const handleEditAddress = async (address) => {
    setEditingAddress(address);
    setAddressForm({
      full_name: address.full_name || "",
      phone: address.phone || "",
      email: address.email || "",
      street_address: address.street_address || "",
      barangay: address.barangay || "",
      city: address.city || "",
      province: address.province || "",
      postal_code: address.postal_code || "",
      country: address.country || "Philippines",
      address_type: address.address_type || "home",
      is_default: address.is_default || false
    });

    // Load cities and barangays for editing
    if (address.province) {
      const province = await PhilippineAddressService.findProvinceByName(address.province);
      if (province) {
        setSelectedProvinceCode(province.code);
        const cityData = await PhilippineAddressService.getCitiesByProvince(province.code);
        setAvailableCities(cityData);

        if (address.city) {
          const city = cityData.find(c => c.name === address.city);
          if (city) {
            setSelectedCityCode(city.code);
            const barangayData = await PhilippineAddressService.getBarangaysByCity(city.code);
            setAvailableBarangays(barangayData);
          }
        }
      }
    }

    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      // Validate required fields
      if (!addressForm.full_name || !addressForm.phone || !addressForm.street_address ||
          !addressForm.barangay || !addressForm.city || !addressForm.province || !addressForm.postal_code) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);

      let result;
      if (editingAddress) {
        // Update existing address
        result = await OrderService.updateShippingAddress(editingAddress.id, addressForm);
      } else {
        // Create new address
        result = await OrderService.createShippingAddress(addressForm);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        setShowAddressModal(false);
        loadAddresses(); // Reload addresses
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await OrderService.deleteShippingAddress(addressId);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Address deleted successfully');
        loadAddresses(); // Reload addresses
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      const { error } = await OrderService.updateShippingAddress(addressId, { is_default: true });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Default address updated');
        loadAddresses(); // Reload addresses
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    } finally {
      setLoading(false);
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
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.io/api/?name=${user?.email?.charAt(0).toUpperCase() || "U"}&background=000000&color=ffffff&size=150`;
                      }}
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



            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Shipping Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <button
                      onClick={handleAddAddress}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="font-medium mr-2">{address.address_type === 'home' ? 'Home' : address.address_type === 'work' ? 'Office' : 'Other'}</span>
                              {address.is_default && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{address.full_name}</p>
                            <p className="text-gray-600">{address.street_address}</p>
                            {address.barangay && <p className="text-gray-600">{address.barangay}</p>}
                            <p className="text-gray-600">{address.city}, {address.province} {address.postal_code}</p>
                            <p className="text-gray-600">{address.country}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            {address.email && <p className="text-gray-600 text-sm">{address.email}</p>}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                            checked={notificationPreferences.email_order_updates}
                            onChange={() => toggleNotification('email_order_updates')}
                            className="sr-only peer"
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
                            checked={notificationPreferences.email_promotions}
                            onChange={() => toggleNotification('email_promotions')}
                            className="sr-only peer"
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
                            checked={notificationPreferences.email_stock_alerts}
                            onChange={() => toggleNotification('email_stock_alerts')}
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
                            checked={notificationPreferences.push_order_updates}
                            onChange={() => toggleNotification('push_order_updates')}
                            className="sr-only peer"
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
                            checked={notificationPreferences.push_promotions}
                            onChange={() => toggleNotification('push_promotions')}
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
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingNotifications ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addressForm.address_type}
                    onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Office/Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="e.g., +63 915 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.street_address}
                    onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                    placeholder="Street address, apartment, suite, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressForm.province}
                      onChange={(e) => {
                        const selectedProvince = provinces.find(p => p.name === e.target.value);
                        if (selectedProvince) {
                          handleProvinceChange(selectedProvince.name, selectedProvince.code);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={loadingLocations}
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City/Municipality <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressForm.city}
                      onChange={(e) => {
                        const selectedCity = availableCities.find(c => c.name === e.target.value);
                        if (selectedCity) {
                          handleCityChange(selectedCity.name, selectedCity.code);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={!selectedProvinceCode || loadingLocations}
                    >
                      <option value="">Select City/Municipality</option>
                      {availableCities.map((city) => (
                        <option key={city.code} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addressForm.barangay}
                    onChange={(e) => setAddressForm({ ...addressForm, barangay: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!selectedCityCode || loadingLocations}
                  >
                    <option value="">Select Barangay</option>
                    {availableBarangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      placeholder="Postal code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="setDefault"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;