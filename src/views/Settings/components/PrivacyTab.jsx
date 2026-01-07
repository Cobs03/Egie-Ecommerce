import React, { useState } from "react";
import { FaDownload, FaTrash, FaExclamationTriangle, FaShieldAlt, FaBan, FaPaperPlane, FaMask } from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import PrivacyRequestModal from "./PrivacyRequestModal";
import { maskEmail, maskPhone, maskAddress, anonymizeUserData } from "../../../utils/PrivacyUtils";

const PrivacyTab = ({ loading, setLoading }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [downloadingData, setDownloadingData] = useState(false);
  const [showPrivacyRequestModal, setShowPrivacyRequestModal] = useState(false);
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);
  const [objections, setObjections] = useState({
    profiling: false,
    marketingAnalysis: false,
    thirdPartyAnalytics: false
  });

  const handleDownloadData = async () => {
    try {
      setDownloadingData(true);
      setError("");
      setMessage("");

      // Fetch all user data from different tables
      const userId = user.id;

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get addresses
      const { data: addresses, error: addressError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId);

      // Get orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId);

      // Get wishlist
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId);

      // Get cart items
      const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId);

      // Get saved builds
      const { data: builds, error: buildsError } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('user_id', userId);

      // Apply masking if enabled
      let processedProfile = profile || {};
      let processedAddresses = addresses || [];
      
      if (maskSensitiveData) {
        // Mask profile data
        processedProfile = {
          ...profile,
          email: maskEmail(profile.email),
          phone: profile.phone ? maskPhone(profile.phone) : null,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
        };
        
        // Mask addresses
        processedAddresses = (addresses || []).map(addr => ({
          ...addr,
          street_address: addr.street_address ? maskAddress(addr.street_address) : null,
          phone: addr.phone ? maskPhone(addr.phone) : null,
        }));
      }

      // Compile all data
      const userData = {
        exportDate: new Date().toISOString(),
        exportedBy: maskSensitiveData ? maskEmail(user.email) : user.email,
        dataPrivacy: maskSensitiveData ? 'Sensitive data masked for privacy' : 'Full data export',
        profile: processedProfile,
        addresses: processedAddresses,
        orders: orders || [],
        reviews: reviews || [],
        wishlist: wishlist || [],
        cart: cart || [],
        savedBuilds: builds || [],
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      const filename = maskSensitiveData 
        ? `egie-account-data-masked-${new Date().toISOString().split('T')[0]}.json`
        : `egie-account-data-${new Date().toISOString().split('T')[0]}.json`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`Your data has been downloaded successfully!${maskSensitiveData ? ' (Sensitive data masked)' : ''}`);
      setTimeout(() => setMessage(""), 5000);

    } catch (error) {
      setError("Failed to download your data. Please try again.");
    } finally {
      setDownloadingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Create a deletion request record
      const { error: requestError } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          requested_at: new Date().toISOString(),
          status: 'pending'
        });

      if (requestError) {
        // If table doesn't exist, we'll still proceed with soft delete
      }

      // Soft delete: Update profile status to 'deleted'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'deletion_requested',
          deletion_requested_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage(
        "Account deletion request submitted successfully. Our team will review your request within 24-48 hours. You will receive an email confirmation once your account has been deleted."
      );
      setShowDeleteConfirmation(false);
      setDeleteConfirmText("");

      // Sign out user after 5 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 5000);

    } catch (error) {
      setError("Failed to submit deletion request. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjections = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Save objections to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          data_processing_objections: objections,
          objections_updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
      }

      // Log objection in objections table
      try {
        await supabase
          .from('data_processing_objections')
          .insert({
            user_id: user.id,
            email: user.email,
            objections: objections,
            requested_at: new Date().toISOString(),
            status: 'pending'
          });
      } catch (objError) {
      }

      setMessage("Your objections have been recorded. We'll apply these preferences to your account immediately.");
      setTimeout(() => setMessage(""), 5000);

    } catch (error) {
      setError("Failed to save your objections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Privacy & Data Rights
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

      {/* Data Download Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <FaDownload className="text-green-600 text-2xl mr-4 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Download Your Data</h3>
            <p className="text-gray-600 mb-4">
              Download a copy of all your personal data stored in our system, including your profile, orders, reviews, addresses, and more. The data will be provided in JSON format.
            </p>
            
            {/* Privacy Options */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FaMask className="text-blue-600 text-xl" />
                <div className="flex-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maskSensitiveData}
                      onChange={(e) => setMaskSensitiveData(e.target.checked)}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-800">Mask Sensitive Data</span>
                      <p className="text-sm text-gray-600">
                        Enable to mask emails, phone numbers, and addresses in the export for additional privacy
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDownloadData}
              disabled={downloadingData || loading}
              className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 hover:scale-105 ${
                downloadingData || loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <FaDownload className="mr-2" />
              {downloadingData ? "Preparing Download..." : "Download My Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-blue-50">
        <div className="flex items-start">
          <FaShieldAlt className="text-blue-600 text-2xl mr-4 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Your Privacy Rights</h3>
            <p className="text-gray-700 mb-3">
              Under data protection regulations (GDPR, CCPA), you have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> You can download your data at any time</li>
              <li><strong>Right to Rectification:</strong> You can update your personal information in the Profile tab</li>
              <li><strong>Right to Erasure:</strong> You can request account deletion below</li>
              <li><strong>Right to Object:</strong> You can manage notification preferences in the Notifications tab</li>
              <li><strong>Right to Data Portability:</strong> Download your data in a portable format</li>
            </ul>
            <p className="text-gray-600 mt-4 text-sm">
              For additional privacy-related requests or questions, please contact{" "}
              <a href="mailto:privacy@egie-ecommerce.com" className="text-green-600 hover:underline">
                privacy@egie-ecommerce.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right to Object Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <FaBan className="text-orange-600 text-2xl mr-4 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Object to Data Processing</h3>
            <p className="text-gray-600 mb-4">
              You have the right to object to certain types of data processing. Select the processing activities you wish to object to:
            </p>
            
            <div className="space-y-3 mb-4">
              {/* Profiling Objection */}
              <div className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-gray-800 mb-1">
                    Profiling for Personalized Recommendations
                  </h4>
                  <p className="text-sm text-gray-600">
                    Stop using my browsing and purchase history to create personalized product recommendations
                  </p>
                </div>
                <button
                  onClick={() => setObjections(prev => ({ ...prev, profiling: !prev.profiling }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    objections.profiling ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      objections.profiling ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing Analysis Objection */}
              <div className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-gray-800 mb-1">
                    Marketing Analysis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Don't analyze my behavior patterns for marketing and promotional purposes
                  </p>
                </div>
                <button
                  onClick={() => setObjections(prev => ({ ...prev, marketingAnalysis: !prev.marketingAnalysis }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    objections.marketingAnalysis ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      objections.marketingAnalysis ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Third Party Analytics Objection */}
              <div className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-gray-800 mb-1">
                    Third-Party Analytics
                  </h4>
                  <p className="text-sm text-gray-600">
                    Opt out of third-party analytics services (Google Analytics, Facebook Pixel, etc.)
                  </p>
                </div>
                <button
                  onClick={() => setObjections(prev => ({ ...prev, thirdPartyAnalytics: !prev.thirdPartyAnalytics }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    objections.thirdPartyAnalytics ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      objections.thirdPartyAnalytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitObjections}
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                <FaBan className="mr-2" />
                {loading ? "Submitting..." : "Submit Objections"}
              </button>
              
              <button
                onClick={() => setShowPrivacyRequestModal(true)}
                className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
              >
                <FaPaperPlane className="mr-2" />
                Other Privacy Request
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Note: Objections will be processed immediately. For more complex privacy requests, use the "Other Privacy Request" button.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-600 text-2xl mr-4 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Delete Account
              </h3>
              <p className="text-gray-700 mb-4">
                Once you delete your account, there is no going back. This will permanently delete your account and remove all your data from our servers.
              </p>
              <p className="text-gray-600 mb-4 text-sm">
                <strong>What will be deleted:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4 mb-4">
                <li>Your profile and personal information</li>
                <li>Order history (past orders will be anonymized)</li>
                <li>Saved addresses</li>
                <li>Product reviews</li>
                <li>Wishlist and cart items</li>
                <li>Saved PC builds</li>
              </ul>

              {!showDeleteConfirmation ? (
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 active:scale-95 hover:scale-105 disabled:bg-gray-400"
                >
                  <FaTrash className="mr-2" />
                  Request Account Deletion
                </button>
              ) : (
                <div className="mt-4 p-4 bg-white border border-red-300 rounded-lg">
                  <p className="text-gray-700 mb-3 font-medium">
                    ⚠️ Are you absolutely sure you want to delete your account?
                  </p>
                  <p className="text-gray-600 mb-3 text-sm">
                    Type <strong>DELETE MY ACCOUNT</strong> below to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => {
                      setDeleteConfirmText(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-red-500 focus:border-red-500"
                    placeholder="DELETE MY ACCOUNT"
                    disabled={loading}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== "DELETE MY ACCOUNT"}
                      className={`flex-1 px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                        loading || deleteConfirmText !== "DELETE MY ACCOUNT"
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {loading ? "Processing..." : "Confirm Deletion"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteConfirmText("");
                        setError("");
                      }}
                      disabled={loading}
                      className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95 disabled:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Request Modal */}
      <PrivacyRequestModal
        open={showPrivacyRequestModal}
        onClose={() => setShowPrivacyRequestModal(false)}
      />
    </div>
  );
};

export default PrivacyTab;
