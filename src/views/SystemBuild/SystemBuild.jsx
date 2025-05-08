import React, { useState } from "react";
import BuildComponents from "./SystemBuild Components/BuildComponents";
import Selected from "./SystemBuild Components/Selected";
import { FaInfoCircle } from "react-icons/fa";

const SystemBuild = () => {
  const [selectedType, setSelectedType] = useState(null);
const [selectedProducts, setSelectedProducts] = useState({});

const handleAddProduct = (type, product) => {
  setSelectedProducts((prev) => ({
    ...prev,
    [type]: product,
  }));
};

  return (
    <div className="flex flex-col mt-4">
      <h1 className="text-2xl font-bold flex items-center mb-2 ml-20">
        System Builder <FaInfoCircle className="ml-2 text-gray-500" />
      </h1>
      <p className="text-sm text-gray-600 mb-2 ml-20">
        "System Builder automatically recommends compatible products..."
      </p>

      <div className="flex justify-center flex-row gap-4 mt-4 w-full">
        <BuildComponents
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />

        {/* Always show Selected component, with or without a selectedType */}
        <div className="w-[400px]">
          <Selected
            selectedType={selectedType}
            onAddProduct={handleAddProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemBuild;
