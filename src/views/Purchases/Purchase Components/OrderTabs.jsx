import React from "react";

const categories = [
  "All",
  "Store Pick-up",
  "To Ship",
  "To Receive",
  "Completed",
  "Cancelled",
];

const OrderTabs = ({ activeTab, onChange }) => {
  return (
    <div className="bg-white p-4">
      <h1 className="text-2xl font-bold mt-4 ml-4 mb-4">My Purchases</h1>
      <div className="flex overflow-x-auto space-x-6 border-b px-4 md:px-10 z`justify-center ml-4">
        {categories.map((tab) => (
          <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`cursor-pointer whitespace-nowrap py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab
              ? "border-green-500 text-green-500"
              : "border-transparent text-gray-600 hover:text-blue-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
    </div>
  );
};

export default OrderTabs;
