/**
 * Philippine Address Service
 * Fetches provinces, cities, and barangays from Philippine Standard Geographic Code (PSGC) API
 * 
 * Using: https://psgc.gitlab.io/api/ (Official Philippine address data)
 */

class PhilippineAddressService {
  constructor() {
    this.baseUrl = 'https://psgc.gitlab.io/api';
    this.cache = {
      regions: null,
      provinces: {},
      cities: {},
      barangays: {}
    };
  }

  /**
   * Get all regions in the Philippines
   * @returns {Promise<Array>} Array of regions
   */
  async getRegions() {
    if (this.cache.regions) {
      return this.cache.regions;
    }

    try {
      const response = await fetch(`${this.baseUrl}/regions/`);
      const data = await response.json();
      this.cache.regions = data;
      return data;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all provinces
   * @returns {Promise<Array>} Array of provinces
   */
  async getProvinces() {
    try {
      const response = await fetch(`${this.baseUrl}/provinces/`);
      const data = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get cities/municipalities by province code
   * @param {string} provinceCode - Province code
   * @returns {Promise<Array>} Array of cities/municipalities
   */
  async getCitiesByProvince(provinceCode) {
    if (this.cache.cities[provinceCode]) {
      return this.cache.cities[provinceCode];
    }

    try {
      const response = await fetch(`${this.baseUrl}/provinces/${provinceCode}/cities-municipalities/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      this.cache.cities[provinceCode] = sorted;
      return sorted;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get barangays by city/municipality code
   * @param {string} cityCode - City/Municipality code
   * @returns {Promise<Array>} Array of barangays
   */
  async getBarangaysByCity(cityCode) {
    if (this.cache.barangays[cityCode]) {
      return this.cache.barangays[cityCode];
    }

    try {
      const response = await fetch(`${this.baseUrl}/cities-municipalities/${cityCode}/barangays/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      this.cache.barangays[cityCode] = sorted;
      return sorted;
    } catch (error) {
      return [];
    }
  }

  /**
   * Search for a province by name
   * @param {string} provinceName - Province name to search
   * @returns {Promise<Object|null>} Province object or null
   */
  async findProvinceByName(provinceName) {
    const provinces = await this.getProvinces();
    return provinces.find(p => 
      p.name.toLowerCase() === provinceName.toLowerCase() ||
      p.name.toLowerCase().includes(provinceName.toLowerCase())
    );
  }

  /**
   * Search for a city by name within a province
   * @param {string} provinceCode - Province code
   * @param {string} cityName - City name to search
   * @returns {Promise<Object|null>} City object or null
   */
  async findCityByName(provinceCode, cityName) {
    const cities = await this.getCitiesByProvince(provinceCode);
    return cities.find(c => 
      c.name.toLowerCase() === cityName.toLowerCase() ||
      c.name.toLowerCase().includes(cityName.toLowerCase())
    );
  }

  /**
   * Clear cache (useful for refreshing data)
   */
  clearCache() {
    this.cache = {
      regions: null,
      provinces: {},
      cities: {},
      barangays: {}
    };
  }
}

// Export singleton instance
const philippineAddressService = new PhilippineAddressService();
export default philippineAddressService;
