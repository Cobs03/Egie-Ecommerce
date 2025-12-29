import React from "react";
import { toast } from "sonner";
import OrderService from "../../../services/OrderService";

const AddressesTab = ({ 
  addresses, 
  loadingAddresses, 
  loading,
  setLoading,
  handleAddAddress, 
  handleEditAddress, 
  handleDeleteAddress, 
  handleSetDefaultAddress 
}) => {

  const onDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await OrderService.deleteShippingAddress(addressId);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Address deleted successfully');
        // The parent component will reload addresses
        handleDeleteAddress(addressId);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const onSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      const { error } = await OrderService.updateShippingAddress(addressId, { is_default: true });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Default address updated');
        // The parent component will reload addresses
        handleSetDefaultAddress(addressId);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Shipping Addresses
        </h2>
        <button
          type="button"
          onClick={handleAddAddress}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
        >
          Add New Address
        </button>
      </div>

      {loadingAddresses ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No addresses found</p>
          <button
            onClick={handleAddAddress}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">
                      {address.address_type === 'home' ? 'Home' : address.address_type === 'work' ? 'Office' : 'Other'}
                    </span>
                    {address.is_default && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.full_name}</p>
                  <p className="text-gray-600">{address.street_address}</p>
                  {address.barangay && <p className="text-gray-600">{address.barangay}</p>}
                  <p className="text-gray-600">{address.city}, {address.province} {address.postal_code}</p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-600">{address.phone}</p>
                  {address.email && <p className="text-gray-600 text-sm">{address.email}</p>}
                </div>
                <div className="flex flex-col space-y-2">
                  {!address.is_default && (
                    <button
                      onClick={() => onSetDefaultAddress(address.id)}
                      className="text-green-600 hover:text-green-800 text-sm transition-all duration-200 active:scale-95"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-800 transition-all duration-200 active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesTab;
