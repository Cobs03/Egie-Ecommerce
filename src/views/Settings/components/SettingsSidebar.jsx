import React from "react";
import { FaUser, FaLock, FaBell, FaMapMarkerAlt, FaShieldAlt, FaCheckCircle, FaFileContract } from "react-icons/fa";

const SettingsSidebar = ({ user, userData, activeTab, setActiveTab }) => {
  return (
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
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
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
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
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
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
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
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
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
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
                  activeTab === "privacy"
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaShieldAlt className="mr-3" />
                <span>Privacy & Data</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("consent")}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
                  activeTab === "consent"
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle className="mr-3" />
                <span>Consent</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("compliance")}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
                  activeTab === "compliance"
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaFileContract className="mr-3" />
                <span>Compliance</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
