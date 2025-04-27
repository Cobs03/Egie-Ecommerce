import React, {useState} from "react";
import "./NewArrivals.css";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";


const NewArrivals = () => {
      const [selectedProduct, setSelectedProduct] = useState(null);

    const products = [
      { id: 1,name: "Neon Light Wired Mouse", price: 60 },
      {
       id: 2, name: "Strix GL720 Compact Gaming Laptop With Latest Processor",
        price: 700,
      },
      { id: 3, name: "MSI Powerful Graphics Card", price: 120 },
      { id: 4, name: "Gaming Light Wired Keyboard", price: 100 },
      { id: 5, name: "Fury HyperX 8 GB RAM", price: 120 },
    ];
    return (
      <div className="new-arrivals">
        <h2 className="text-2xl">New Arrivals</h2>
        <div className="products-grid">
          {products.map((product, index) => (
            <div
              className={`product product-${index + 1}`}
              key={index}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="img">
                <img
                  src={`https://via.placeholder.com/150?text=${product.name}`}
                  alt={product.name}
                  className="product-image"
                />
              </div>

              <div className="product-desc">
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <button>Shop Now</button>
              </div>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    );
}

export default NewArrivals;
