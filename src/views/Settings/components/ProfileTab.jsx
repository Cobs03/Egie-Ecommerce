import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";

const ProfileTab = ({ user, userData, setUserData, loading, setLoading }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          phone: userData.phone.trim(),
          avatar_url: userData.avatar,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
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

      setUserData(prev => ({
        ...prev,
        avatar: publicUrl
      }));

      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Profile Information
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

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
                className={`inline-block px-4 py-2 rounded cursor-pointer transition-all duration-200 active:scale-95 hover:scale-105 ${
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

        <div>
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
              className={`px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 hover:scale-105 ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
