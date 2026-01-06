import React, { useState } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

const PrivacyRequestModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    requestType: "",
    details: ""
  });

  const requestTypes = [
    { value: "object_processing", label: "Object to Data Processing" },
    { value: "restrict_processing", label: "Restrict Data Processing" },
    { value: "data_portability", label: "Data Portability Request" },
    { value: "correction", label: "Correct Inaccurate Data" },
    { value: "access_request", label: "Access My Data" },
    { value: "other", label: "Other Privacy Concern" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requestType) {
      setError("Please select a request type");
      return;
    }

    if (!formData.details.trim()) {
      setError("Please provide details about your request");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Submit privacy request
      const { error: insertError } = await supabase
        .from('privacy_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          request_type: formData.requestType,
          details: formData.details,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (insertError) {
      }

      setMessage("Your privacy request has been submitted successfully! We'll review it and respond within 30 days.");
      
      // Reset form
      setFormData({ requestType: "", details: "" });
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 3000);

    } catch (error) {
      setError("Failed to submit your request. Please try again or contact privacy@egie-ecommerce.com");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Submit Privacy Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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

          <form onSubmit={handleSubmit}>
            {/* Request Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requestType}
                onChange={(e) => {
                  setFormData({ ...formData, requestType: e.target.value });
                  if (error) setError("");
                }}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                required
                disabled={loading}
              >
                <option value="">Select a request type...</option>
                {requestTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Request Details */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => {
                  setFormData({ ...formData, details: e.target.value });
                  if (error) setError("");
                }}
                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                rows={6}
                placeholder="Please provide detailed information about your privacy request..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Be as specific as possible to help us process your request quickly.
              </p>
            </div>

            {/* Information Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll acknowledge your request within 48 hours</li>
                <li>• Full response within 30 days as required by law</li>
                <li>• You may receive follow-up questions to verify your identity</li>
                <li>• You can check the status by contacting privacy@egie-ecommerce.com</li>
              </ul>
            </div>

            {/* Request Type Examples */}
            {formData.requestType && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  {requestTypes.find(t => t.value === formData.requestType)?.label}
                </h4>
                <p className="text-sm text-gray-600">
                  {getRequestTypeDescription(formData.requestType)}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <FaPaperPlane className="mr-2" />
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const getRequestTypeDescription = (type) => {
  const descriptions = {
    object_processing: "You can object to how we process your personal data for certain purposes, such as profiling or direct marketing.",
    restrict_processing: "You can request that we limit how we process your data while we investigate a concern or dispute.",
    data_portability: "You can request your data in a structured, commonly used format that you can transfer to another service.",
    correction: "You can request corrections to any inaccurate or incomplete personal data we hold about you.",
    access_request: "You can request a copy of all personal data we hold about you (similar to the Download Your Data feature).",
    other: "For any other privacy-related concerns or requests not covered by the standard options."
  };
  return descriptions[type] || "";
};

export default PrivacyRequestModal;
