import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import PhilippineAddressService from "../../services/PhilippineAddressService";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Import components
import SettingsSidebar from "./components/SettingsSidebar";
import ProfileTab from "./components/ProfileTab";
import SecurityTab from "./components/SecurityTab";
import AddressesTab from "./components/AddressesTab";
import NotificationsTab from "./components/NotificationsTab";
import PrivacyTab from "./components/PrivacyTab";
import ConsentTab from "./components/ConsentTab";
import ThirdPartyComplianceTab from "./components/ThirdPartyComplianceTab";
import AddressModal from "./components/AddressModal";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  
  // Philippine address API data
  const [provinces, setProvinces] = useState([]);
  
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

  // Notification preferences states
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_order_updates: true,
    email_promotions: true,
    email_stock_alerts: false,
    push_order_updates: true,
    push_promotions: false,
    email_data_breach: true,
    email_security_incidents: true,
    email_privacy_policy_updates: true,
    email_tos_updates: true
  });

  // Scroll animation for header
  const headerAnim = useScrollAnimation({ threshold: 0.1 });

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
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      const { data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
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
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Address management functions
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const OrderService = (await import("../../services/OrderService")).default;
      const { data, error } = await OrderService.getShippingAddresses();
      if (error) {
        setAddresses([]);
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
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
      is_default: addresses.length === 0
    });
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
    setShowAddressModal(true);
  };

  const handleDeleteAddress = () => {
    loadAddresses();
  };

  const handleSetDefaultAddress = () => {
    loadAddresses();
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1
          ref={headerAnim.ref}
          className={`text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-['Bruno_Ace_SC'] transition-all duration-700 ${
            headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Account Settings
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <SettingsSidebar
            user={user}
            userData={userData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow overflow-hidden">
            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                userData={userData}
                setUserData={setUserData}
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {activeTab === "addresses" && (
              <AddressesTab
                addresses={addresses}
                loadingAddresses={loadingAddresses}
                loading={loading}
                setLoading={setLoading}
                handleAddAddress={handleAddAddress}
                handleEditAddress={handleEditAddress}
                handleDeleteAddress={handleDeleteAddress}
                handleSetDefaultAddress={handleSetDefaultAddress}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                user={user}
                notificationPreferences={notificationPreferences}
                setNotificationPreferences={setNotificationPreferences}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacyTab
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {activeTab === "consent" && (
              <ConsentTab
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {activeTab === "compliance" && (
              <ThirdPartyComplianceTab />
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        editingAddress={editingAddress}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        loadAddresses={loadAddresses}
        provinces={provinces}
      />
    </div>
  );
};

export default Settings;