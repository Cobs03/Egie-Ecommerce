import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

const NotificationsTab = ({ user, notificationPreferences, setNotificationPreferences }) => {
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

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
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  const toggleNotification = (key) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'orders', label: 'Order Updates', icon: '📦' },
    { id: 'promotions', label: 'Promotions', icon: '🎁' },
    { id: 'security', label: 'Security & Privacy', icon: '🔒' },
    { id: 'general', label: 'General', icon: '📬' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Notification Preferences
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-200 ${
              activeCategory === category.id
                ? 'border-green-500 text-green-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Order Updates Category */}
        {(activeCategory === 'all' || activeCategory === 'orders') && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span>📦</span> Order Updates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Email Order Updates</p>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your orders
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

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Push Order Updates</p>
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
            </div>
          </div>
        )}

        {/* Promotions Category */}
        {(activeCategory === 'all' || activeCategory === 'promotions') && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span>🎁</span> Promotions & Deals
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Email Promotions</p>
                  <p className="text-sm text-gray-500">
                    Get notified about sales and special offers via email
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

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Push Promotions</p>
                  <p className="text-sm text-gray-500">
                    Get push notifications about sales and special offers
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
        )}

        {/* Security & Privacy Category */}
        {(activeCategory === 'all' || activeCategory === 'security') && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span>🔒</span> Security & Privacy Alerts
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Critical notifications about your account security and policy updates
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Data Breach Notifications</p>
                  <p className="text-sm text-gray-500">
                    Immediate alerts if your data is involved in a security breach
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email_data_breach}
                    onChange={() => toggleNotification('email_data_breach')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Security Incident Alerts</p>
                  <p className="text-sm text-gray-500">
                    Get notified about suspicious activity or security events on your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email_security_incidents}
                    onChange={() => toggleNotification('email_security_incidents')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Privacy Policy Updates</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications when our privacy policy changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email_privacy_policy_updates}
                    onChange={() => toggleNotification('email_privacy_policy_updates')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Terms of Service Updates</p>
                  <p className="text-sm text-gray-500">
                    Get notified about changes to our terms of service
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email_tos_updates}
                    onChange={() => toggleNotification('email_tos_updates')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* General Category */}
        {(activeCategory === 'all' || activeCategory === 'general') && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span>📬</span> General Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Stock Alerts</p>
                  <p className="text-sm text-gray-500">
                    Get notified when items in your wishlist are back in stock
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
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSaveNotifications}
          disabled={savingNotifications}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
        >
          {savingNotifications ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationsTab;
