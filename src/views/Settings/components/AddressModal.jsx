import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import PhilippineAddressService from "../../../services/PhilippineAddressService";
import OrderService from "../../../services/OrderService";

const AddressModal = ({ 
  showAddressModal, 
  setShowAddressModal, 
  editingAddress, 
  addressForm, 
  setAddressForm,
  loadAddresses,
  provinces
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  // Load cities and barangays when editing an address
  useEffect(() => {
    if (editingAddress && showAddressModal) {
      loadEditingAddressLocations();
    }
  }, [editingAddress, showAddressModal]);

  const loadEditingAddressLocations = async () => {
    if (addressForm.province) {
      const province = await PhilippineAddressService.findProvinceByName(addressForm.province);
      if (province) {
        setSelectedProvinceCode(province.code);
        const cityData = await PhilippineAddressService.getCitiesByProvince(province.code);
        setAvailableCities(cityData);

        if (addressForm.city) {
          const city = cityData.find(c => c.name === addressForm.city);
          if (city) {
            setSelectedCityCode(city.code);
            const barangayData = await PhilippineAddressService.getBarangaysByCity(city.code);
            setAvailableBarangays(barangayData);
          }
        }
      }
    }
  };

  const handleProvinceChange = async (provinceName, provinceCode) => {
    setLoadingLocations(true);
    try {
      setAddressForm(prev => ({ ...prev, province: provinceName, city: "", barangay: "" }));
      setSelectedProvinceCode(provinceCode);
      setAvailableCities([]);
      setAvailableBarangays([]);
      
      const cityData = await PhilippineAddressService.getCitiesByProvince(provinceCode);
      setAvailableCities(cityData);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleCityChange = async (cityName, cityCode) => {
    setLoadingLocations(true);
    try {
      setAddressForm(prev => ({ ...prev, city: cityName, barangay: "" }));
      setSelectedCityCode(cityCode);
      setAvailableBarangays([]);
      
      const barangayData = await PhilippineAddressService.getBarangaysByCity(cityCode);
      setAvailableBarangays(barangayData);
    } catch (error) {
      console.error('Error loading barangays:', error);
      toast.error('Failed to load barangays');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!addressForm.full_name || !addressForm.phone || !addressForm.street_address ||
          !addressForm.barangay || !addressForm.city || !addressForm.province || !addressForm.postal_code) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);

      let result;
      if (editingAddress) {
        result = await OrderService.updateShippingAddress(editingAddress.id, addressForm);
      } else {
        result = await OrderService.createShippingAddress(addressForm);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        setShowAddressModal(false);
        loadAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  if (!showAddressModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type <span className="text-red-500">*</span>
              </label>
              <select
                value={addressForm.address_type}
                onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="home">Home</option>
                <option value="work">Office/Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addressForm.full_name}
                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="e.g., +63 915 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={addressForm.email}
                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                placeholder="Email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addressForm.street_address}
                onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                placeholder="Street address, apartment, suite, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={addressForm.province}
                  onChange={(e) => {
                    const selectedProvince = provinces.find(p => p.name === e.target.value);
                    if (selectedProvince) {
                      handleProvinceChange(selectedProvince.name, selectedProvince.code);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loadingLocations}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Municipality <span className="text-red-500">*</span>
                </label>
                <select
                  value={addressForm.city}
                  onChange={(e) => {
                    const selectedCity = availableCities.find(c => c.name === e.target.value);
                    if (selectedCity) {
                      handleCityChange(selectedCity.name, selectedCity.code);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!selectedProvinceCode || loadingLocations}
                >
                  <option value="">Select City/Municipality</option>
                  {availableCities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay <span className="text-red-500">*</span>
              </label>
              <select
                value={addressForm.barangay}
                onChange={(e) => setAddressForm({ ...addressForm, barangay: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!selectedCityCode || loadingLocations}
              >
                <option value="">Select Barangay</option>
                {availableBarangays.map((barangay) => (
                  <option key={barangay.code} value={barangay.name}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                  placeholder="Postal code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="setDefault"
                checked={addressForm.is_default}
                onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddressModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAddress}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 active:scale-95 hover:scale-105"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
