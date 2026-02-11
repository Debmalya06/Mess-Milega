"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { propertyService } from "../services/api"
import toast from "react-hot-toast"
import {
  Building2,
  MapPin,
  IndianRupee,
  Bed,
  Users,
  Wifi,
  Car,
  Utensils,
  Zap,
  Tv,
  Dumbbell,
  Shield,
  Brush,
  Upload,
  X,
  Loader2,
  Home,
  Image as ImageIcon,
  FileText,
  CheckCircle,
} from "lucide-react"

const AddProperty = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Form data
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    description: "",
    propertyType: "PG",
    
    // Location
    address: "",
    city: "",
    state: "",
    pinCode: "",
    latitude: null,
    longitude: null,
    
    // Property Details
    totalRooms: 1,
    availableRooms: 1,
    monthlyRent: "",
    securityDeposit: "",
    
    // Room & Preferences
    roomType: "SINGLE",
    genderPreference: "UNISEX",
    
    // Amenities
    wifi: false,
    parking: false,
    meals: false,
    laundry: false,
    ac: false,
    tv: false,
    gym: false,
    security: false,
    powerBackup: false,
    housekeeping: false,
    
    // Additional Info
    nearbyLandmarks: "",
    rulesAndRegulations: "",
    collegeNearby: "",
    distanceFromCollege: "",
  })

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Details & Pricing", icon: IndianRupee },
    { id: 4, title: "Amenities", icon: Wifi },
    { id: 5, title: "Images & Rules", icon: ImageIcon },
  ]

  const propertyTypes = [
    { value: "PG", label: "PG (Paying Guest)" },
    { value: "HOSTEL", label: "Hostel" },
    { value: "SHARED_APARTMENT", label: "Shared Apartment" },
    { value: "INDEPENDENT_ROOM", label: "Independent Room" },
  ]

  const roomTypes = [
    { value: "SINGLE", label: "Single Occupancy" },
    { value: "DOUBLE", label: "Double Sharing" },
    { value: "TRIPLE", label: "Triple Sharing" },
    { value: "DORMITORY", label: "Dormitory" },
  ]

  const genderOptions = [
    { value: "MALE", label: "Male Only" },
    { value: "FEMALE", label: "Female Only" },
    { value: "UNISEX", label: "Any Gender" },
  ]

  const amenities = [
    { key: "wifi", label: "WiFi", icon: Wifi },
    { key: "parking", label: "Parking", icon: Car },
    { key: "meals", label: "Meals", icon: Utensils },
    { key: "laundry", label: "Laundry", icon: Brush },
    { key: "ac", label: "AC", icon: Zap },
    { key: "tv", label: "TV", icon: Tv },
    { key: "gym", label: "Gym", icon: Dumbbell },
    { key: "security", label: "Security", icon: Shield },
    { key: "powerBackup", label: "Power Backup", icon: Zap },
    { key: "housekeeping", label: "Housekeeping", icon: Brush },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file count
    if (imageFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed")
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...validFiles])
  }

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || formData.name.length < 3) {
          toast.error("Property name must be at least 3 characters")
          return false
        }
        if (!formData.description || formData.description.length < 10) {
          toast.error("Description must be at least 10 characters")
          return false
        }
        return true
      case 2:
        if (!formData.address) {
          toast.error("Address is required")
          return false
        }
        if (!formData.city || formData.city.length < 2) {
          toast.error("City is required")
          return false
        }
        if (!formData.state || formData.state.length < 2) {
          toast.error("State is required")
          return false
        }
        if (!formData.pinCode || !/^[0-9]{6}$/.test(formData.pinCode)) {
          toast.error("Valid 6-digit PIN code is required")
          return false
        }
        return true
      case 3:
        if (!formData.monthlyRent || formData.monthlyRent < 500) {
          toast.error("Monthly rent must be at least ₹500")
          return false
        }
        if (formData.securityDeposit === "" || formData.securityDeposit < 0) {
          toast.error("Security deposit is required")
          return false
        }
        if (formData.availableRooms > formData.totalRooms) {
          toast.error("Available rooms cannot exceed total rooms")
          return false
        }
        return true
      case 4:
        return true // Amenities are optional
      case 5:
        return true // Images and rules are optional
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all steps
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        return
      }
    }

    setLoading(true)

    try {
      const propertyData = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        totalRooms: parseInt(formData.totalRooms),
        availableRooms: parseInt(formData.availableRooms),
        distanceFromCollege: formData.distanceFromCollege ? parseFloat(formData.distanceFromCollege) : null,
      }

      let response
      if (imageFiles.length > 0) {
        // Use the endpoint that handles image upload
        response = await propertyService.addPropertyWithImages(propertyData, imageFiles)
      } else {
        // Use the regular endpoint
        response = await propertyService.addProperty(propertyData)
      }

      toast.success("Property added successfully!")
      navigate("/owner-dashboard")
    } catch (error) {
      console.error("Error adding property:", error)
      const errorMessage = error.response?.data?.message || "Failed to add property"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Check if user is a PG Owner
  if (user && user.role !== "PG_OWNER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only property owners can add properties.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    currentStep >= step.id ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sunshine PG for Girls"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property, facilities, and what makes it special..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.propertyType === type.value
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="propertyType"
                          value={type.value}
                          checked={formData.propertyType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Home className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Location Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, building name, floor, etc."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Kolkata"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., West Bengal"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="e.g., 700001"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nearby College/University
                    </label>
                    <input
                      type="text"
                      name="collegeNearby"
                      value={formData.collegeNearby}
                      onChange={handleChange}
                      placeholder="e.g., Jadavpur University"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from College (KM)
                  </label>
                  <input
                    type="number"
                    name="distanceFromCollege"
                    value={formData.distanceFromCollege}
                    onChange={handleChange}
                    placeholder="e.g., 2.5"
                    step="0.1"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Details & Pricing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-purple-600" />
                  Details & Pricing
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Rooms *
                    </label>
                    <input
                      type="number"
                      name="totalRooms"
                      value={formData.totalRooms}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Rooms *
                    </label>
                    <input
                      type="number"
                      name="availableRooms"
                      value={formData.availableRooms}
                      onChange={handleChange}
                      min="0"
                      max={formData.totalRooms}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleChange}
                        placeholder="e.g., 8000"
                        min="500"
                        max="100000"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="securityDeposit"
                        value={formData.securityDeposit}
                        onChange={handleChange}
                        placeholder="e.g., 16000"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {roomTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.roomType === type.value
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="roomType"
                          value={type.value}
                          checked={formData.roomType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Bed className="h-4 w-4 mr-2" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Preference *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {genderOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.genderPreference === option.value
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="genderPreference"
                          value={option.value}
                          checked={formData.genderPreference === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Wifi className="h-5 w-5 mr-2 text-purple-600" />
                  Amenities
                </h2>
                <p className="text-gray-600">Select all amenities available at your property</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {amenities.map((amenity) => (
                    <label
                      key={amenity.key}
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData[amenity.key]
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name={amenity.key}
                        checked={formData[amenity.key]}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <amenity.icon
                        className={`h-8 w-8 mb-2 ${
                          formData[amenity.key] ? "text-purple-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          formData[amenity.key] ? "text-purple-700" : "text-gray-600"
                        }`}
                      >
                        {amenity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Images & Rules */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Images & Rules
                </h2>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Images (Max 10)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, WEBP up to 10MB each
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {imageFiles.length}/10 images selected
                  </p>
                </div>

                {/* Nearby Landmarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearby Landmarks
                  </label>
                  <textarea
                    name="nearbyLandmarks"
                    value={formData.nearbyLandmarks}
                    onChange={handleChange}
                    placeholder="e.g., Metro station, Shopping mall, Hospital, Bus stop..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Rules & Regulations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    House Rules & Regulations
                  </label>
                  <textarea
                    name="rulesAndRegulations"
                    value={formData.rulesAndRegulations}
                    onChange={handleChange}
                    placeholder="e.g., No smoking, No pets, Entry timing 10 PM, Visitors allowed till 8 PM..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adding Property...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Add Property
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProperty
