import React, { useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaPencilAlt, FaTrashAlt, FaChevronDown, FaExclamationTriangle } from "react-icons/fa";

const Address = () => {
  // Mock data for cities in Bulacan
  const cities = [
    "Santa Maria", 
    "Malolos", 
    "Meycauayan", 
    "San Jose Del Monte", 
    "Bocaue", 
    "Marilao", 
    "Obando", 
    "Baliwag"
  ];

  // Mock data for barangays (organized by city)
  const barangaysByCity = {
    "Santa Maria": ["Pulong Buhangin", "Bagbaguin", "Guyong", "Poblacion", "Balasing", "Catmon"],
    "Malolos": ["Guinhawa", "Mambog", "Tikay", "Bulihan", "Balite"],
    "Meycauayan": ["Bahay Pari", "Malhacan", "Calvario", "Lawa", "Perez"],
    "San Jose Del Monte": ["Tungkong Mangga", "Muzon", "San Manuel", "Kaypian", "Santo Cristo"],
    "Bocaue": ["Lolomboy", "Turo", "Bunlo", "Wakas", "Bundukan"],
    "Marilao": ["Loma de Gato", "Ibayo", "Patubig", "Lambakin", "Tabing Ilog"],
    "Obando": ["Pag-asa", "San Pascual", "Catangalan", "Paco", "Salambao"],
    "Baliwag": ["Pagala", "Tibag", "Tarcan", "Pinagbarilan", "Sabang"]
  };

  // State for the selected address
  const [selectedAddress, setSelectedAddress] = useState({
    id: 1,
    name: "Mik ko",
    phone: "(+63) 9184549421",
    address: "Blk 69 LOT 96, Dyan Lang Sa Gedil Ng Kanto Poblacion Santa Maria",
    region: "North Luzon, Philippines, Bulacan, Santa Maria, Poblacion",
    isDefault: true,
    // Additional fields for detailed address
    streetAddress: "Blk 69 LOT 96",
    province: "Bulacan",
    city: "Santa Maria",
    barangay: "Poblacion",
    postalCode: "3022"
  });

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
  
  // Mock addresses data
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Mik ko",
      phone: "(+63) 9184549421",
      address: "Blk 69 LOT 96, Dyan Lang Sa Gedil Ng Kanto Poblacion Santa Maria",
      isDefault: true,
      // Additional fields
      streetAddress: "Blk 69 LOT 96",
      region: "North Luzon, Philippines",
      province: "Bulacan",
      city: "Santa Maria",
      barangay: "Poblacion",
      postalCode: "3022"
    },
    {
      id: 2,
      name: "Jacob Gino Cruz",
      phone: "(+63) 918 454 9421",
      address: "306 km 37, Pulong Buhangin",
      isDefault: false,
      // Additional fields
      streetAddress: "306 km 37",
      region: "North Luzon, Philippines",
      province: "Bulacan",
      city: "Santa Maria",
      barangay: "Pulong Buhangin",
      postalCode: "3022"
    }
  ]);
  
  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    isDefault: false,
    streetAddress: "",
    region: "North Luzon, Philippines",
    province: "Bulacan",
    city: "",
    barangay: "",
    postalCode: ""
  });

  // Available barangays based on selected city (for new address form)
  const [availableBarangays, setAvailableBarangays] = useState([]);

  // Available barangays based on selected city (for edit form)
  const [editAvailableBarangays, setEditAvailableBarangays] = useState([]);
  
  // Toggle an address as default
  const setAddressAsDefault = (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(updatedAddresses);
    
    // Update selected address if it's the one being set as default
    const defaultAddress = updatedAddresses.find(addr => addr.id === id);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
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
  const deleteAddress = () => {
    if (!addressToDelete) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== addressToDelete.id);
    setAddresses(updatedAddresses);
    
    // If deleted address was selected, select the default one
    if (selectedAddress.id === addressToDelete.id) {
      const defaultAddress = updatedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (updatedAddresses.length > 0) {
        setSelectedAddress(updatedAddresses[0]);
      }
    }
    
    // Close confirmation and reset
    setShowDeleteConfirmation(false);
    setAddressToDelete(null);
  };
  
  // Start editing an address
  const startEditing = (address) => {
    setEditingAddress({...address});
    setShowEditForm(true);
    
    // Set available barangays based on the city
    if (address.city && barangaysByCity[address.city]) {
      setEditAvailableBarangays(barangaysByCity[address.city]);
    } else {
      setEditAvailableBarangays([]);
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
    
    // If city is changed, update available barangays
    if (name === 'city' && value) {
      setAvailableBarangays(barangaysByCity[value] || []);
      // Reset barangay when city changes
      setNewAddress(prev => ({
        ...prev,
        barangay: ''
      }));
    }
  };
  
  // Handle input change for editing an address
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditingAddress({
      ...editingAddress,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // If city is changed, update available barangays
    if (name === 'city' && value) {
      setEditAvailableBarangays(barangaysByCity[value] || []);
      // Reset barangay when city changes
      setEditingAddress(prev => ({
        ...prev,
        barangay: ''
      }));
    }
  };
  
  // Handle form submission for new address
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the full address from components
    const formattedAddress = {
      ...newAddress,
      address: `${newAddress.streetAddress}, ${newAddress.barangay}`,
      region: `${newAddress.region}, ${newAddress.province}, ${newAddress.city}, ${newAddress.barangay}`,
      id: Date.now()
    };
    
    // If this is set as default, update all others to not be default
    let updatedAddresses = [...addresses, formattedAddress];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === formattedAddress.id
      }));
      
      // Set as selected address if it's default
      setSelectedAddress(formattedAddress);
    }
    
    setAddresses(updatedAddresses);
    setNewAddress({
      name: "",
      phone: "",
      address: "",
      isDefault: false,
      streetAddress: "",
      region: "North Luzon, Philippines",
      province: "Bulacan",
      city: "",
      barangay: "",
      postalCode: ""
    });
    setShowNewAddressForm(false);
    setAvailableBarangays([]);
  };
  
  // Handle form submission for editing an address
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    // Format the full address from components
    const formattedAddress = {
      ...editingAddress,
      address: `${editingAddress.streetAddress}, ${editingAddress.barangay}`,
      region: `${editingAddress.region}, ${editingAddress.province}, ${editingAddress.city}, ${editingAddress.barangay}`
    };
    
    // Update the address in the list
    const updatedAddresses = addresses.map(addr => 
      addr.id === formattedAddress.id ? formattedAddress : addr
    );
    
    // If this address is set as default, update all others
    if (formattedAddress.isDefault && !addresses.find(a => a.id === formattedAddress.id).isDefault) {
      updatedAddresses.forEach(addr => {
        if (addr.id !== formattedAddress.id) {
          addr.isDefault = false;
        }
      });
    }
    
    setAddresses(updatedAddresses);
    
    // If the edited address was the selected one, update it
    if (selectedAddress.id === formattedAddress.id) {
      setSelectedAddress(formattedAddress);
    }
    
    setEditingAddress(null);
    setShowEditForm(false);
    setEditAvailableBarangays([]);
  };

  // Function to get formatted address for display
  const getFormattedAddress = (address) => {
    return `${address.streetAddress}, ${address.barangay}, ${address.city}, ${address.province}, ${address.region} ${address.postalCode}`;
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-4xl mb-2 font-['Bruno_Ace_SC']">
        Order Summary
      </h2>

      <div className="flex items-start justify-between flex-row">
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="text-red-600 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-600">
              Delivery Address
            </p>
            <p className="text-sm font-semibold">
              {selectedAddress.name}{" "}
              <span className="text-black font-normal">
                {selectedAddress.phone}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              {getFormattedAddress(selectedAddress)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddressModal(true)}
          className="text-sm text-blue-600 hover:bg-green-500 p-3 hover:text-white rounded transition cursor-pointer"
        >
          Change
        </button>
      </div>
      <hr
        className="border-0 h-1 mt-4
        bg-[repeating-linear-gradient(135deg,#dc2626_0_12px,#ffffff_12px_14px,#0284c7_14px_26px)] 
        rounded"
      />

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 top-32 max-md:top-20">
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
                      name="name"
                      value={editingAddress.name}
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
                  
                  {/* Region - Non-editable */}
                  <div>
                    <label className="text-sm text-gray-500">Region</label>
                    <input
                      type="text"
                      name="region"
                      value="North Luzon, Philippines"
                      className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
                      disabled
                    />
                  </div>
                  
                  {/* Province - Non-editable */}
                  <div>
                    <label className="text-sm text-gray-500">Province</label>
                    <input
                      type="text"
                      name="province"
                      value="Bulacan"
                      className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
                      disabled
                    />
                  </div>
                  
                  {/* City - Dropdown */}
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <div className="relative">
                      <select
                        name="city"
                        value={editingAddress.city}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 mt-1 appearance-none pr-10 cursor-pointer"
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
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
                        value={editingAddress.barangay}
                        onChange={handleEditChange}
                        className="w-full border rounded px-3 py-2 mt-1 appearance-none pr-10 cursor-pointer"
                        required
                        disabled={!editingAddress.city}
                      >
                        <option value="">Select Barangay</option>
                        {editAvailableBarangays.map((barangay) => (
                          <option key={barangay} value={barangay}>{barangay}</option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editingAddress.postalCode}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Street Name, Building, House No.</label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={editingAddress.streetAddress}
                      onChange={handleEditChange}
                      className="w-full border rounded px-3 py-2 mt-1"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editDefaultAddress"
                      name="isDefault"
                      checked={editingAddress.isDefault}
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
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
                    address.isDefault ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {address.name}{" "}
                        <span className="font-normal text-gray-600">
                          {address.phone}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {getFormattedAddress(address)}
                      </p>
                      {address.isDefault && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => startEditing(address)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => confirmDelete(address)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => selectAddress(address)}
                      className="px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-500 hover:text-white cursor-pointer"
                    >
                      Select
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => setAddressAsDefault(address.id)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
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
                      name="name"
                      value={newAddress.name}
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

                  {/* Region - Non-editable */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <input
                      type="text"
                      value="North Luzon, Philippines"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      disabled
                    />
                  </div>

                  {/* Province - Non-editable */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      value="Bulacan"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      disabled
                    />
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
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
                        value={newAddress.barangay}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        required
                        disabled={!newAddress.city}
                      >
                        <option value="">Select Barangay</option>
                        {availableBarangays.map((barangay) => (
                          <option key={barangay} value={barangay}>{barangay}</option>
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
                      name="postalCode"
                      value={newAddress.postalCode}
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
                      name="streetAddress"
                      value={newAddress.streetAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleInputChange}
                      className="mr-2 cursor-pointer"
                    />
                    <label
                      htmlFor="isDefault"
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
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
                  className="flex items-center justify-center w-full p-3 bg-green-500 text-white rounded-md hover:bg-white hover:text-green-500 hover:border-2 border-green-500 transition cursor-pointer"
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteAddress}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
