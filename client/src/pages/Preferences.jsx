"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import {
  Settings,
  MapPin,
  DollarSign,
  Home,
  Bell,
  Loader2,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Wifi,
  Car,
  UtensilsCrossed,
  Sparkles,
  Wind,
  Tv,
  Dumbbell,
  Shield,
  Zap,
  Trash2
} from "lucide-react"
import { seekerService } from "../services/api"

const Preferences = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState("location")

  // Preferences state
  const [preferences, setPreferences] = useState({
    // Location preferences
    preferredCities: [],
    preferredAreas: [],
    preferredState: "",
    maxDistanceFromCollege: 5,
    collegeOrWorkplace: "",
    collegeOrWorkplaceAddress: "",

    // Budget preferences
    minBudget: 5000,
    maxBudget: 25000,
    includeSecurityDeposit: false,

    // Property preferences
    preferredPropertyType: "",
    preferredRoomType: "",
    genderPreference: "",

    // Amenity preferences
    needWifi: false,
    needParking: false,
    needMeals: false,
    needLaundry: false,
    needAc: false,
    needTv: false,
    needGym: false,
    needSecurity: false,
    needPowerBackup: false,
    needHousekeeping: false,

    // Move-in preferences
    expectedMoveInDate: "",
    expectedStayMonths: 6,

    // Lifestyle preferences
    vegetarianOnly: false,
    nonSmoker: false,
    noPets: false,
    quietEnvironment: false,
    workSchedule: "",

    // Notification preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyNewListings: true,
    notifyPriceDrops: true,
  })

  // New city input
  const [newCity, setNewCity] = useState("")
  const [newArea, setNewArea] = useState("")

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await seekerService.getPreferences()
      if (response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data
        }))
      }
    } catch (err) {
      console.error("Error fetching preferences:", err)
      // Not showing error since preferences might not exist yet
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")
      await seekerService.updatePreferences(preferences)
      setSuccess("Preferences saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error saving preferences:", err)
      setError("Failed to save preferences. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleClearSearchHistory = async () => {
    if (!confirm("Are you sure you want to clear your search history?")) return
    
    try {
      await seekerService.clearSearchHistory()
      setSuccess("Search history cleared!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to clear search history")
    }
  }

  const addCity = () => {
    if (newCity.trim() && !preferences.preferredCities.includes(newCity.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredCities: [...prev.preferredCities, newCity.trim()]
      }))
      setNewCity("")
    }
  }

  const removeCity = (city) => {
    setPreferences(prev => ({
      ...prev,
      preferredCities: prev.preferredCities.filter(c => c !== city)
    }))
  }

  const addArea = () => {
    if (newArea.trim() && !preferences.preferredAreas.includes(newArea.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredAreas: [...prev.preferredAreas, newArea.trim()]
      }))
      setNewArea("")
    }
  }

  const removeArea = (area) => {
    setPreferences(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.filter(a => a !== area)
    }))
  }

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  const sections = [
    { id: "location", label: "Location", icon: <MapPin className="h-5 w-5" /> },
    { id: "budget", label: "Budget", icon: <DollarSign className="h-5 w-5" /> },
    { id: "property", label: "Property Type", icon: <Home className="h-5 w-5" /> },
    { id: "amenities", label: "Amenities", icon: <Wifi className="h-5 w-5" /> },
    { id: "lifestyle", label: "Lifestyle", icon: <Settings className="h-5 w-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Preferences & Alerts</h1>
          <p className="text-gray-600">Customize your search preferences to find the perfect accommodation</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-8">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Location Section */}
              {activeSection === "location" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Location Preferences
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Cities
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCity()}
                        placeholder="Add a city"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addCity}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferredCities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {city}
                          <button
                            onClick={() => removeCity(city)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Areas/Localities
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addArea()}
                        placeholder="Add an area"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addArea}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferredAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {area}
                          <button
                            onClick={() => removeArea(area)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        College/Workplace Name
                      </label>
                      <input
                        type="text"
                        value={preferences.collegeOrWorkplace}
                        onChange={(e) => handleChange("collegeOrWorkplace", e.target.value)}
                        placeholder="Enter your college or workplace"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Distance (km)
                      </label>
                      <input
                        type="number"
                        value={preferences.maxDistanceFromCollege}
                        onChange={(e) => handleChange("maxDistanceFromCollege", parseInt(e.target.value))}
                        min={1}
                        max={50}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Budget Section */}
              {activeSection === "budget" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Budget Preferences
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Budget (₹/month)
                      </label>
                      <input
                        type="number"
                        value={preferences.minBudget}
                        onChange={(e) => handleChange("minBudget", parseInt(e.target.value))}
                        min={0}
                        step={500}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Budget (₹/month)
                      </label>
                      <input
                        type="number"
                        value={preferences.maxBudget}
                        onChange={(e) => handleChange("maxBudget", parseInt(e.target.value))}
                        min={0}
                        step={500}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Budget Range</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{preferences.minBudget.toLocaleString()}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{preferences.maxBudget.toLocaleString()}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.includeSecurityDeposit}
                      onChange={(e) => handleChange("includeSecurityDeposit", e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Include security deposit in budget consideration</span>
                  </label>
                </div>
              )}

              {/* Property Type Section */}
              {activeSection === "property" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Home className="h-5 w-5 mr-2 text-blue-600" />
                    Property Preferences
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={preferences.preferredPropertyType}
                      onChange={(e) => handleChange("preferredPropertyType", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="PG">PG (Paying Guest)</option>
                      <option value="HOSTEL">Hostel</option>
                      <option value="MESS">Mess</option>
                      <option value="FLAT">Flat/Apartment</option>
                      <option value="SHARED_ROOM">Shared Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type
                    </label>
                    <select
                      value={preferences.preferredRoomType}
                      onChange={(e) => handleChange("preferredRoomType", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="SINGLE">Single Occupancy</option>
                      <option value="DOUBLE">Double Sharing</option>
                      <option value="TRIPLE">Triple Sharing</option>
                      <option value="DORMITORY">Dormitory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Preference
                    </label>
                    <select
                      value={preferences.genderPreference}
                      onChange={(e) => handleChange("genderPreference", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="MALE">Male Only</option>
                      <option value="FEMALE">Female Only</option>
                      <option value="COED">Co-ed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Move-in Date
                      </label>
                      <input
                        type="date"
                        value={preferences.expectedMoveInDate}
                        onChange={(e) => handleChange("expectedMoveInDate", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Stay Duration (months)
                      </label>
                      <input
                        type="number"
                        value={preferences.expectedStayMonths}
                        onChange={(e) => handleChange("expectedStayMonths", parseInt(e.target.value))}
                        min={1}
                        max={36}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities Section */}
              {activeSection === "amenities" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Wifi className="h-5 w-5 mr-2 text-blue-600" />
                    Required Amenities
                  </h2>

                  <p className="text-gray-600">Select the amenities that are important to you:</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: "needWifi", label: "WiFi", icon: <Wifi className="h-5 w-5" /> },
                      { key: "needParking", label: "Parking", icon: <Car className="h-5 w-5" /> },
                      { key: "needMeals", label: "Meals", icon: <UtensilsCrossed className="h-5 w-5" /> },
                      { key: "needLaundry", label: "Laundry", icon: <Sparkles className="h-5 w-5" /> },
                      { key: "needAc", label: "AC", icon: <Wind className="h-5 w-5" /> },
                      { key: "needTv", label: "TV", icon: <Tv className="h-5 w-5" /> },
                      { key: "needGym", label: "Gym", icon: <Dumbbell className="h-5 w-5" /> },
                      { key: "needSecurity", label: "Security", icon: <Shield className="h-5 w-5" /> },
                      { key: "needPowerBackup", label: "Power Backup", icon: <Zap className="h-5 w-5" /> },
                      { key: "needHousekeeping", label: "Housekeeping", icon: <Sparkles className="h-5 w-5" /> },
                    ].map((amenity) => (
                      <label
                        key={amenity.key}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          preferences[amenity.key]
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={preferences[amenity.key]}
                          onChange={(e) => handleChange(amenity.key, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={preferences[amenity.key] ? "text-blue-600" : "text-gray-400"}>
                          {amenity.icon}
                        </div>
                        <span className={preferences[amenity.key] ? "text-blue-700 font-medium" : "text-gray-700"}>
                          {amenity.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Section */}
              {activeSection === "lifestyle" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Lifestyle Preferences
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.vegetarianOnly}
                        onChange={(e) => handleChange("vegetarianOnly", e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Vegetarian food preference only</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.nonSmoker}
                        onChange={(e) => handleChange("nonSmoker", e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Non-smoking environment</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.noPets}
                        onChange={(e) => handleChange("noPets", e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">No pets allowed</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.quietEnvironment}
                        onChange={(e) => handleChange("quietEnvironment", e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Quiet environment preferred</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Schedule
                    </label>
                    <select
                      value={preferences.workSchedule}
                      onChange={(e) => handleChange("workSchedule", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Not specified</option>
                      <option value="DAY_SHIFT">Day Shift (9 AM - 6 PM)</option>
                      <option value="NIGHT_SHIFT">Night Shift</option>
                      <option value="FLEXIBLE">Flexible/Work from Home</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Clear Search History</h3>
                    <p className="text-gray-600 mb-4">
                      Clear your search history and viewed properties. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleClearSearchHistory}
                      className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Search History
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Notification Channels</h3>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.smsNotifications}
                        onChange={(e) => handleChange("smsNotifications", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive browser push notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={(e) => handleChange("pushNotifications", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Alert Types</h3>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">New Listings Alert</p>
                        <p className="text-sm text-gray-500">Get notified when new properties matching your preferences are listed</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyNewListings}
                        onChange={(e) => handleChange("notifyNewListings", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Price Drop Alert</p>
                        <p className="text-sm text-gray-500">Get notified when prices drop on your favorite properties</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyPriceDrops}
                        onChange={(e) => handleChange("notifyPriceDrops", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preferences
