"use client"
import { Filter, X } from "lucide-react"

const SearchFilters = ({ filters, onFilterChange }) => {
  const amenitiesList = ["wifi", "parking", "meals", "laundry", "ac", "gym", "security", "power_backup"]

  const handleAmenityChange = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity]

    onFilterChange({ amenities: updatedAmenities })
  }

  const clearFilters = () => {
    onFilterChange({
      location: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      amenities: [],
      roomType: "",
      gender: "",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>
        <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <X className="h-4 w-4 mr-1" />
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            placeholder="Enter city or area"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="pg">PG</option>
            <option value="mess">Mess</option>
            <option value="hostel">Hostel</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹/month)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
          <select
            value={filters.roomType}
            onChange={(e) => onFilterChange({ roomType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="dormitory">Dormitory</option>
          </select>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender Preference</label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange({ gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="co-ed">Co-ed</option>
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="space-y-2">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{amenity.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters
