import React from "react";

const CompComponents = () => {
  return (
    <>
      {/* Compatible Builds */}
      <h2 className="text-lg font-semibold mt-3 mb-2">Compatible Builds</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold">Keyboard</h3>
          <p>Lorem ipsum dolor sit amet, consectetur</p>
          <p className="font-bold">P 5,999</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold">Keyboard</h3>
          <p>Lorem ipsum dolor sit amet, consectetur</p>
          <p className="font-bold">P 5,999</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold">Keyboard</h3>
          <p>Lorem ipsum dolor sit amet, consectetur</p>
          <p className="font-bold">P 5,999</p>
        </div>
      </div>
    </>
  );
};

export default CompComponents;
