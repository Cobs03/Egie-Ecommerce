import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const CartItems = ({ cartItems, selectedItems, setSelectedItems }) => {
  const { updateQuantity: updateCartQuantity, removeFromCart, clearCart } = useCart();
  
  // State for individual item deletion
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for clear cart confirmation
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const updateQuantity = async (id, delta) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(item.quantity + delta, 1);
    
    await updateCartQuantity(id, newQuantity);
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Show clear cart confirmation
  const handleClearCartClick = () => {
    setShowConfirmClear(true);
  };

  // Handle confirming clear cart
  const confirmClearCart = async () => {
    await clearCart();
    setShowConfirmClear(false);
  };

  // Handle canceling clear cart
  const cancelClearCart = () => {
    setShowConfirmClear(false);
  };

  // Handle opening the delete confirmation
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmDelete(true);
  };

  // Handle confirming deletion
  const confirmDelete = async () => {
    if (itemToDelete) {
      await removeFromCart(itemToDelete.id);
    }
    // Reset delete state
    setShowConfirmDelete(false);
    setItemToDelete(null);
  };

  // Handle canceling deletion
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setItemToDelete(null);
  };

  const selected = cartItems.filter((item) => item.selected);
  const total = selected.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const allSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  // Helper function to determine item URL
  const getItemUrl = (item) => {
    // Check if it's a bundle or product based on ID
    const isBundle = item.id.toString().startsWith("bundle-");
    return `/products/details?type=${isBundle ? "bundle" : "product"}&id=${
      item.id
    }`;
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="bg-white shadow p-8 rounded w-full flex flex-col items-center justify-center text-center">
        <div className="text-gray-400 mb-4">
          <FaShoppingCart className="text-6xl mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">
          Your cart is currently empty
        </h2>
        <p className="text-gray-600 mb-8">
          Start adding items to make it yours!
        </p>
        <Link
          to="/products"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Cart View (visible above 763px) */}
      <div className="bg-white shadow rounded w-full hidden [@media(min-width:763px)]:block">
        <div className="p-4">
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="mr-2 w-4 h-4 rounded accent-green-600"
              />
              <span className="text-sm">Select All</span>
            </label>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="pb-2"></th>
                <th className="text-left pb-2">Product</th>
                <th className="text-left pb-2">Price</th>
                <th className="text-center pb-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded accent-green-600"
                    />
                  </td>
                  <td className="py-2">
                    <Link
                      to={`/products/details?type=product&id=${item.product_id}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex flex-col">
                        <span className="group-hover:text-green-600 group-hover:underline">
                          {item.name.length > 50
                            ? item.name.slice(0, 50) + "..."
                            : item.name}
                        </span>
                        {item.variant_name && (
                          <span className="text-xs text-gray-500">
                            Variant: {item.variant_name}
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="py-2">₱{item.price.toLocaleString()}</td>
                  <td className="py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-red-500 text-white rounded px-2 h-8"
                      >
                        −
                      </button>
                      <span className="inline-flex items-center justify-center h-8 px-2 border rounded min-w-[40px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-green-500 text-white rounded px-2 h-8"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleClearCartClick}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Cart
            </button>
            <Link
              to="/products"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Cart View - visible at 763px and below */}
      <div className="bg-white shadow rounded-md [@media(min-width:763px)]:hidden">
        <div className="p-4">
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="mr-2 w-4 h-4 rounded accent-green-600"
              />
              <span className="text-sm">Select All</span>
            </label>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="border-b py-3">
              <div className="flex items-start mb-2">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(item.id)}
                  className="mr-3 mt-1 w-4 h-4 rounded accent-green-600"
                />
                <Link to={`/products/details?type=product&id=${item.product_id}`} className="flex-1">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 mr-3 object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {item.name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Variant: {item.variant_name}
                        </p>
                      )}
                      <p className="font-bold text-base mt-1">
                        ₱{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-between pl-7">
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="mx-3 w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          ))}

          {/* Mobile Action Buttons */}
          <div className="flex justify-between gap-3 mt-4">
            <button
              onClick={handleClearCartClick}
              className="flex-1 bg-red-500 text-white py-2 rounded-md text-center font-medium"
            >
              Clear Cart
            </button>
            <Link
              to="/products"
              className="flex-1 bg-green-500 text-white py-2 rounded-md text-center font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Do you wish to delete{" "}
              <span className="font-semibold">{itemToDelete.name}</span> from
              your cart?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Clear Cart</h3>
            <p className="mb-6">Do you wish to clear your cart?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelClearCart}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartItems;