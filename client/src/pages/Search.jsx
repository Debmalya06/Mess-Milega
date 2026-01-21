"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import SearchFilters from "../components/Search/SearchFilters"
import PropertyCard from "../components/Property/PropertyCard"
import MapView from "../components/Map/MapView"
import { Grid, List, Map } from "lucide-react"

const Search = () => {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    minPrice: "",
    maxPrice: "",
    amenities: [],
    roomType: "",
    gender: "",
  })

  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      // Map frontend filter names to backend parameter names
      const params = {
        city: filters.location || undefined,
        propertyType: filters.type || undefined,
        roomType: filters.roomType || undefined,
        genderPreference: filters.gender || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      }
      const response = await axios.get("/api/properties/public/search", { params })
      setProperties(response.data)
    } catch (error) {
      console.error("Error fetching properties:", error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{properties.length} Properties Found</h1>
              <div className="flex bg-white rounded-lg shadow-sm border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600"} rounded-l-lg`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 ${viewMode === "map" ? "bg-blue-600 text-white" : "text-gray-600"} rounded-r-lg`}
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content based on view mode */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : viewMode === "map" ? (
              <MapView properties={properties} />
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} viewMode={viewMode} />
                ))}
              </div>
            )}

            {!loading && properties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search filters to find more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
