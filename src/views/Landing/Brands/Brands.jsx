import React from "react";
import "./Brands.css";  

const Brands =() => {
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
      <div className="logo-container">
        {logoData.map((logo, index) => (
          <div className="logo-item" key={index}>
            <img src={logo.src} alt={logo.alt} />
          </div>
        ))}
      </div>
    );
}

export default Brands;
