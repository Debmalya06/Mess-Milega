"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Search } from "lucide-react"

const SearchBar = ({ className = "" }) => {
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  const [gender, setGender] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append("location", location)
    if (budget) params.append("budget", budget)
    if (gender) params.append("gender", gender)

    navigate(`/search?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white p-4 rounded-2xl shadow-lg border border-gray-100 ${className}`}
    >
      <div className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter college, locality or address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Budget</option>
            <option value="0-5000">Under ₹5,000</option>
            <option value="5000-10000">₹5,000 - ₹10,000</option>
            <option value="10000-15000">₹10,000 - ₹15,000</option>
            <option value="15000+">Above ₹15,000</option>
          </select>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Search PGs</span>
        </button>
      </div>
    </form>
  )
}

export default SearchBar
