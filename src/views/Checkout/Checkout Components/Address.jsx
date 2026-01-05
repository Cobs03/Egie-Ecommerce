import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaPencilAlt, FaTrashAlt, FaChevronDown, FaExclamationTriangle } from "react-icons/fa";
import OrderService from "../../../services/OrderService";
import PhilippineAddressService from "../../../services/PhilippineAddressService";
import { toast } from "sonner";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Address = ({ onAddressSelect }) => {
  // Philippine Address API data
  const [provinces, setProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  
  // Edit form address API data
  const [editAvailableCities, setEditAvailableCities] = useState([]);
  const [editAvailableBarangays, setEditAvailableBarangays] = useState([]);
  const [editSelectedProvinceCode, setEditSelectedProvinceCode] = useState("");
  const [editSelectedCityCode, setEditSelectedCityCode] = useState("");
  
  const [loadingLocations, setLoadingLocations] = useState(false);

  // State for the selected address
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // State for showing the address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // State for showing the new address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // State for editing an address
  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // State for delete confirmation
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Addresses from database
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    email: "",
    street_address: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",
    address_type: "home",
    is_default: false
  });
  
  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);
  
  // Load provinces from API
  const loadProvinces = async () => {
    try {
      const provinceData = await PhilippineAddressService.getProvinces();
      setProvinces(provinceData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Failed to load provinces');
    }
  };
  
  // Handle province change for new address form
  const handleProvinceChange = async (provinceName, provinceCode) => {
    setNewAddress({ ...newAddress, province: provinceName, city: "", barangay: "" });
    setSelectedProvinceCode(provinceCode);
    setSelectedCityCode("");
    setAvailableCities([]);
    setAvailableBarangays([]);
    
    if (provinceCode) {
      setLoadingLocations(true);
      try {
        const cityData = await PhilippineAddressService.getCitiesByProvince(provinceCode);
        setAvailableCities(cityData);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Failed to load cities');
      } finally {
        setLoadingLocations(false);
      }
    }
  };
  
  // Handle city change for new address form
  const handleCityChange = async (cityName, cityCode) => {
    setNewAddress({ ...newAddress, city: cityName, barangay: "" });
    setSelectedCityCode(cityCode);
    setAvailableBarangays([]);
    
    if (cityCode) {
      setLoadingLocations(true);
      try {
        const barangayData = await PhilippineAddressService.getBarangaysByCity(cityCode);
        setAvailableBarangays(barangayData);
      } catch (error) {
        console.error('Error loading barangays:', error);
        toast.error('Failed to load barangays');
      } finally {
        setLoadingLocations(false);
      }
    }
  };
  
  // Handle province change for edit form
  const handleEditProvinceChange = async (provinceName, provinceCode) => {
    setEditingAddress({ ...editingAddress, province: provinceName, city: "", barangay: "" });
    setEditSelectedProvinceCode(provinceCode);
    setEditSelectedCityCode("");
    setEditAvailableCities([]);
    setEditAvailableBarangays([]);
    
    if (provinceCode) {
      setLoadingLocations(true);
      try {
        const cityData = await PhilippineAddressService.getCitiesByProvince(provinceCode);
        setEditAvailableCities(cityData);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Failed to load cities');
      } finally {
        setLoadingLocations(false);
      }
    }
  };
  
  // Handle city change for edit form
  const handleEditCityChange = async (cityName, cityCode) => {
    setEditingAddress({ ...editingAddress, city: cityName, barangay: "" });
    setEditSelectedCityCode(cityCode);
    setEditAvailableBarangays([]);
    
    if (cityCode) {
      setLoadingLocations(true);
      try {
        const barangayData = await PhilippineAddressService.getBarangaysByCity(cityCode);
        setEditAvailableBarangays(barangayData);
      } catch (error) {
        console.error('Error loading barangays:', error);
        toast.error('Failed to load barangays');
      } finally {
        setLoadingLocations(false);
      }
    }
  };
  
  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);
  
  // Notify parent when address changes
  useEffect(() => {
    if (onAddressSelect && selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  }, [selectedAddress]);
  
  // Load addresses from database
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await OrderService.getShippingAddresses();
      
      if (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses');
        return;
      }
      
      if (data && data.length > 0) {
        setAddresses(data);
        // Select default address or first address
        const defaultAddr = data.find(addr => addr.is_default);
        setSelectedAddress(defaultAddr || data[0]);
      }
    } catch (error) {
      console.error('Error in loadAddresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle an address as default
  const setAddressAsDefault = async (id) => {
    try {
      const { error } = await OrderService.updateShippingAddress(id, { is_default: true });
      
      if (error) {
        toast.error('Failed to set as default');
        return;
      }
      
      // Reload addresses to reflect changes
      await loadAddresses();
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set as default');
    }
  };
  
  // Select an address and close modal
  const selectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };
  
  // Initiate delete confirmation for an address
  const confirmDelete = (address) => {
    setAddressToDelete(address);
    setShowDeleteConfirmation(true);
  };
  
  // Delete an address after confirmation
  const deleteAddress = async () => {
    if (!addressToDelete) return;
    
    try {
      const { error } = await OrderService.deleteShippingAddress(addressToDelete.id);
      
      if (error) {
        toast.error('Failed to delete address');
        return;
      }
      
      toast.success('Address deleted');
      
      // Reload addresses
      await loadAddresses();
      
      // Close confirmation and reset
      setShowDeleteConfirmation(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };
  
  // Start editing an address
  const startEditing = async (address) => {
    setEditingAddress({...address});
    setShowEditForm(true);
    
    // Load cities and barangays for editing
    if (address.province) {
      const province = await PhilippineAddressService.findProvinceByName(address.province);
      if (province) {
        setEditSelectedProvinceCode(province.code);
        const cityData = await PhilippineAddressService.getCitiesByProvince(province.code);
        setEditAvailableCities(cityData);

        if (address.city) {
          const city = cityData.find(c => c.name === address.city);
          if (city) {
            setEditSelectedCityCode(city.code);
            const barangayData = await PhilippineAddressService.getBarangaysByCity(city.code);
            setEditAvailableBarangays(barangayData);
          }
        }
      }
    }
  };
  
  // Handle input change for new address form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update the form state
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle input change for editing an address
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditingAddress({
      ...editingAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission for new address
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data, error } = await OrderService.createShippingAddress(newAddress);
      
      if (error) {
        toast.error('Failed to add address');
        return;
      }
      
      toast.success('Address added successfully');
      
      // Reload addresses
      await loadAddresses();
      
      // Reset form and close
      setNewAddress({
        full_name: "",
        phone: "",
        email: "",
        street_address: "",
        barangay: "",
        city: "",
        province: "",
        postal_code: "",
        country: "Philippines",
        address_type: "home",
        is_default: false
      });
      setSelectedProvinceCode("");
      setSelectedCityCode("");
      setAvailableCities([]);
      setAvailableBarangays([]);
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };
  
  // Handle form submission for editing an address
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await OrderService.updateShippingAddress(editingAddress.id, editingAddress);
      
      if (error) {
        toast.error('Failed to update address');
        return;
      }
      
      toast.success('Address updated successfully');
      
      // Reload addresses
      await loadAddresses();
      
      setEditingAddress(null);
      setShowEditForm(false);
      setEditAvailableBarangays([]);
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  // Function to get formatted address for display
  const getFormattedAddress = (address) => {
    if (!address) return '';
    const parts = [address.street_address];
    if (address.barangay) parts.push(address.barangay);
    parts.push(`${address.city}, ${address.province} ${address.postal_code}`);
    return parts.join(', ');
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-4xl mb-2 font-['Bruno_Ace_SC']">
        Order Summary
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="ml-3 text-gray-600">Loading addresses...</p>
        </div>
      ) : !selectedAddress ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-3">
            No delivery address found. Please add an address to continue.
          </p>
          <button
            onClick={() => {
              setShowAddressModal(true);
              setShowNewAddressForm(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Add Address
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between flex-row">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-red-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Delivery Address
                </p>
                <p className="text-sm font-semibold">
                  {selectedAddress.full_name}{" "}
                  <span className="text-black font-normal">
                    {selectedAddress.phone}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  {getFormattedAddress(selectedAddress)}
                </p>
                {selectedAddress.is_default && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                    Default
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddressModal(true)}
              className="text-sm text-blue-600 hover:bg-green-500 p-3 hover:text-white rounded transition-all duration-150 cursor-pointer active:scale-95"
            >
              Change
            </button>
          </div>
          <hr
            className="border-0 h-1 mt-4
            bg-[repeating-linear-gradient(135deg,#dc2626_0_12px,#ffffff_12px_14px,#0284c7_14px_26px)] 
            rounded"
          />
        </>
      )}

      {/* Address Selection Modal */}
      {showAddressModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md flex flex-col max-h-[80vh]">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <h3 className="text-lg font-semibold">
                {showEditForm ? "Edit Address" : "My Addresses"}
              </h3>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setShowNewAddressForm(false);
                  setShowEditForm(false);
                  setEditingAddress(null);
                  setAvailableBarangays([]);
                  setEditAvailableBarangays([]);
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Address List or Edit Form */}
            <div className="overflow-y-auto p-4 flex-grow">
              {/* Edit Address Form */}
              {showEditForm && editingAddress && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editingAddress.full_name}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editingAddress.phone}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  {/* Email (optional) */}
                  <div>
                    <label className="text-sm text-gray-500">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={editingAddress.email || ''}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                    />
                  </div>
                  
                  {/* Region - Non-editable */}
                  <div>
                    <label className="text-sm text-gray-500">Region</label>
                    <input
                      type="text"
                      name="region"
                      value="Philippines"
                      className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
                      disabled
                    />
                  </div>
                  
                  {/* Province - Dropdown */}
                  <div>
                    <label className="text-sm text-gray-500">Province</label>
                    <div className="relative">
                      <select
                        name="province"
                        value={editingAddress.province}
                        onChange={(e) => {
                          const selectedProvince = provinces.find(p => p.name === e.target.value);
                          if (selectedProvince) {
                            handleEditProvinceChange(selectedProvince.name, selectedProvince.code);
                          }
                        }}
                        className="w-full border rounded px-3 py-2 mt-1 appearance-none pr-10 cursor-pointer"
                        disabled={loadingLocations}
                        required
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* City - Dropdown */}
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <div className="relative">
                      <select
                        name="city"
                        value={editingAddress.city}
                        onChange={(e) => {
                          const selectedCity = editAvailableCities.find(c => c.name === e.target.value);
                          if (selectedCity) {
                            handleEditCityChange(selectedCity.name, selectedCity.code);
                          }
                        }}
                        className="w-full border rounded px-3 py-2 mt-1 appearance-none pr-10 cursor-pointer"
                        disabled={!editSelectedProvinceCode || loadingLocations}
                        required
                      >
                        <option value="">Select City</option>
                        {editAvailableCities.map((city) => (
                          <option key={city.code} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Barangay - Dropdown (based on selected city) */}
                  <div>
                    <label className="text-sm text-gray-500">Barangay</label>
                    <div className="relative">
                      <select
                        name="barangay"
                        value={editingAddress.barangay || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 mt-1 appearance-none pr-10 cursor-pointer"
                        disabled={!editSelectedCityCode || loadingLocations}
                      >
                        <option value="">Select Barangay</option>
                        {editAvailableBarangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.name}>{barangay.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={editingAddress.postal_code}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Street Name, Building, House No.</label>
                    <input
                      type="text"
                      name="street_address"
                      value={editingAddress.street_address}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editDefaultAddress"
                      name="is_default"
                      checked={editingAddress.is_default}
                      onChange={handleEditChange}
                      className="mr-2 cursor-pointer"
                    />
                    <label htmlFor="editDefaultAddress" className="text-sm cursor-pointer">Set as default address</label>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingAddress(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {!showEditForm && !showNewAddressForm && addresses.map((address) => (
                <div
                  key={address.id}
                  className={`mb-4 p-4 border rounded ${
                    address.is_default ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {address.full_name}{" "}
                        <span className="font-normal text-gray-600">
                          {address.phone}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {getFormattedAddress(address)}
                      </p>
                      {address.is_default && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => startEditing(address)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer active:scale-95 transition-transform duration-150"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => confirmDelete(address)}
                        className="text-red-600 hover:text-red-800 cursor-pointer active:scale-95 transition-transform duration-150"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => selectAddress(address)}
                      className="px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-500 hover:text-white cursor-pointer active:scale-95 transition-all duration-150"
                    >
                      Select
                    </button>
                    {!address.is_default && (
                      <button
                        onClick={() => setAddressAsDefault(address.id)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer active:scale-95 transition-transform duration-150"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* New Address Form (Inside scrollable area) */}
              {showNewAddressForm && (
                <form
                  onSubmit={handleSubmit}
                  className="border rounded-md p-4 mt-4 mb-4"
                >
                  <h4 className="font-medium mb-3">Add New Address</h4>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={newAddress.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>

                  {/* Region - Non-editable */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <input
                      type="text"
                      value="Philippines"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      disabled
                    />
                  </div>

                  {/* Province - Dropdown */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <div className="relative">
                      <select
                        name="province"
                        value={newAddress.province}
                        onChange={(e) => {
                          const selectedProvince = provinces.find(p => p.name === e.target.value);
                          if (selectedProvince) {
                            handleProvinceChange(selectedProvince.name, selectedProvince.code);
                          }
                        }}
                        className="w-full px-3 py-2 border rounded appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        disabled={loadingLocations}
                        required
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* City - Dropdown */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <select
                        name="city"
                        value={newAddress.city}
                        onChange={(e) => {
                          const selectedCity = availableCities.find(c => c.name === e.target.value);
                          if (selectedCity) {
                            handleCityChange(selectedCity.name, selectedCity.code);
                          }
                        }}
                        className="w-full px-3 py-2 border rounded appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        disabled={!selectedProvinceCode || loadingLocations}
                        required
                      >
                        <option value="">Select City</option>
                        {availableCities.map((city) => (
                          <option key={city.code} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Barangay - Dropdown (based on selected city) */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barangay
                    </label>
                    <div className="relative">
                      <select
                        name="barangay"
                        value={newAddress.barangay || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        disabled={!selectedCityCode || loadingLocations}
                      >
                        <option value="">Select Barangay</option>
                        {availableBarangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.name}>{barangay.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={newAddress.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Name, Building, House No.
                    </label>
                    <input
                      type="text"
                      name="street_address"
                      value={newAddress.street_address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      name="is_default"
                      id="is_default"
                      checked={newAddress.is_default}
                      onChange={handleInputChange}
                      className="mr-2 cursor-pointer"
                    />
                    <label
                      htmlFor="is_default"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Set as default address
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddressForm(false);
                        setAvailableBarangays([]);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Fixed Footer with Add Button (only shown when not in edit mode and not showing form) */}
            {!showNewAddressForm && !showEditForm && (
              <div className="p-4 border-t sticky bottom-0 bg-white z-10 rounded-b-lg">
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="flex items-center justify-center w-full p-3 bg-green-500 text-white rounded-md hover:bg-white hover:text-green-500 hover:border-2 border-green-500 transition-all duration-150 cursor-pointer active:scale-95"
                >
                  <FaPlus className="mr-2" /> Add New Address
                </button>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-sm p-6">
                  <div className="flex items-center justify-center text-red-500 mb-4">
                    <FaExclamationTriangle size={48} />
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">Delete Address</h3>
                  <p className="text-center mb-6">
                    Are you sure you want to delete this address? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setAddressToDelete(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAddress}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer active:scale-95 transition-transform duration-150"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Address;
