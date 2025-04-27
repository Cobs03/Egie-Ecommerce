import React from "react";

const Brands = () => {
  const logoData = [
    { src: "/path/to/roccat-logo.png", alt: "Roccat" },
    { src: "/path/to/msi-logo.png", alt: "MSI" },
    { src: "/path/to/razer-logo.png", alt: "Razer" },
    { src: "/path/to/thermaltake-logo.png", alt: "Thermaltake" },
    { src: "/path/to/adata-logo.png", alt: "ADATA" },
    { src: "/path/to/hp-logo.png", alt: "Hewlett Packard" },
    { src: "/path/to/gigabyte-logo.png", alt: "Gigabyte" },
  ];

  return (
    <div className="flex justify-center items-center p-5 bg-gray-300 space-x-4">
      {logoData.map((logo, index) => (
        <div key={index} className="w-[200px] h-[50px] bg-green-500 mx-4">
          <img
            src={logo.src}
            alt={logo.alt}
            className="w-full h-full object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ))}
    </div>
  );
};

export default Brands;
