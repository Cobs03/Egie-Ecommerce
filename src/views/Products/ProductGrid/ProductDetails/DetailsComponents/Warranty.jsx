import React from "react";

const Warranty = () => {
  return (
    <>
      {/* Warranty Section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Warranty</h2>
        <ul className="space-y-2">
          <li className="flex items-center text-gray-700">
            <span className="mr-2 text-lg">🛡️</span> 1 Year Warranty
          </li>
          <li className="flex items-center text-gray-700">
            <span className="mr-2 text-lg">🛡️</span> EasyFix Warranty
          </li>
        </ul>
      </div>
    </>
  );
};

export default Warranty;
