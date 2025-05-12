import React from "react";


const OrderSum = () => {
  const products = [
    {
      name: 'Lenovo V15 G4 IRU 15.6" FHD Intel Core i5-1335U/8GB DDR4/512GB M.2 SSD',
      price: 29495,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "ASUS VivoBook 14 M415DA AMD Ryzen 5/8GB/256GB SSD",
      price: 23995,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Acer Aspire 3 Intel Core i3 11th Gen/8GB/512GB SSD",
      price: 20495,
      image: "https://via.placeholder.com/150",
    },
  ];

  const shippingFee = 50;
  const subtotal = products.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + shippingFee;

  return (
    <div className=" p-5 border rounded-lg shadow-lg w-full bg-white">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold mb-2">Order Summary</h2>
        <p className="text-sm text-gray-600 mb-4">
          Order ID: #EGIE-
          {Math.random().toString(36).substring(2, 8).toUpperCase()}
        </p>
      </div>

      <p className="text-sm text-red-500 mt-4 bg-red-100 p-2 rounded-md border border-red-500">
        Currently, refunds are not supported. Please review your order carefully
        before purchase.
      </p>

      <hr className="my-4 stroke-black" />
      <div className="space-y-4">
        {products.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="h-24 w-24 bg-amber-400 rounded mr-4 overflow-hidden">
              <img
                src={item.image}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-sm text-gray-800">
                ₱{item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Discount code or gift card"
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <button className="bg-green-500 text-white px-2 rounded-lg hover:bg-green-600 cursor-pointer">
          Apply
        </button>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₱{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₱{shippingFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>Total</span>
          <span>₱{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSum;
