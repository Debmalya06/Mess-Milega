"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { Upload, CreditCard, Shield, CheckCircle, AlertCircle } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import toast from "react-hot-toast"

const Booking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    moveInDate: new Date(),
    duration: "12",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    documents: {
      idProof: null,
      addressProof: null,
      photo: null,
    },
    paymentMethod: "card",
  })

  // Fetch property data from backend API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/properties/${id}`)
        const data = response.data
        
        // Get location from various field formats
        const getLocation = () => {
          if (data.city && data.state) {
            return `${data.address || ''}, ${data.city}, ${data.state}`;
          }
          if (data.address) {
            if (typeof data.address === 'object') {
              return `${data.address.street || ''}, ${data.address.city || ''}`;
            }
            return data.address;
          }
          return "Location not specified";
        };
        
        setProperty({
          id: data.id,
          title: data.name || data.title,
          price: data.monthlyRent || data.price,
          securityDeposit: data.securityDeposit,
          location: getLocation(),
          roomType: data.roomType,
          genderPreference: data.genderPreference,
          availableRooms: data.availableRooms,
          owner: {
            name: data.ownerName || "Property Owner",
            phone: data.ownerPhone || "",
            email: data.ownerEmail || "",
          },
        })
      } catch (error) {
        console.error("Error fetching property:", error)
        toast.error("Failed to load property details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProperty()
    } else {
      setLoading(false)
      toast.error("Property ID is required")
    }
  }, [id])

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setBookingData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleFileUpload = (type, file) => {
    setBookingData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file,
      },
    }))
  }

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleBookingSubmit = async () => {
    try {
      // Submit booking request to backend API
      const bookingRequest = {
        propertyId: id,
        checkInDate: bookingData.moveInDate.toISOString().split('T')[0],
        numberOfMonths: parseInt(bookingData.duration),
      }
      
      await axios.post("/api/bookings/request", bookingRequest)
      toast.success("Booking submitted successfully!")
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Booking error:", error)
      toast.error(error.response?.data?.message || "Booking failed. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const securityDeposit = property.price
  const totalAmount = property.price + securityDeposit

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Book Your Stay</h1>
            <span className="text-sm text-gray-600">Step {step} of 4</span>
          </div>
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${stepNumber < step ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Details</span>
            <span>Documents</span>
            <span>Payment</span>
            <span>Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Booking Details */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Booking Details</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
                      <DatePicker
                        selected={bookingData.moveInDate}
                        onChange={(date) => handleInputChange("moveInDate", date)}
                        minDate={new Date()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
                      <select
                        value={bookingData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                      </select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={bookingData.emergencyContact.name}
                            onChange={(e) => handleInputChange("emergencyContact.name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={bookingData.emergencyContact.phone}
                            onChange={(e) => handleInputChange("emergencyContact.phone", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                          <input
                            type="text"
                            value={bookingData.emergencyContact.relation}
                            onChange={(e) => handleInputChange("emergencyContact.relation", e.target.value)}
                            placeholder="e.g., Father, Mother, Sibling"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Document Upload */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Upload Documents</h2>

                  <div className="space-y-6">
                    {[
                      { key: "idProof", label: "ID Proof", desc: "Aadhaar Card, PAN Card, or Passport" },
                      { key: "addressProof", label: "Address Proof", desc: "Utility Bill or Bank Statement" },
                      { key: "photo", label: "Recent Photo", desc: "Passport size photograph" },
                    ].map((doc) => (
                      <div key={doc.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">{doc.label}</span>
                              <span className="mt-1 block text-sm text-gray-600">{doc.desc}</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                              />
                              <span className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Choose File
                              </span>
                            </label>
                          </div>
                          {bookingData.documents[doc.key] && (
                            <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {bookingData.documents[doc.key].name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Document Verification</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          All documents will be verified by the property owner. Please ensure all documents are clear
                          and valid.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Payment Method</label>
                      <div className="space-y-3">
                        {[
                          { value: "card", label: "Credit/Debit Card", icon: <CreditCard className="h-5 w-5" /> },
                          { value: "upi", label: "UPI Payment", icon: <CreditCard className="h-5 w-5" /> },
                          { value: "netbanking", label: "Net Banking", icon: <CreditCard className="h-5 w-5" /> },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={bookingData.paymentMethod === method.value}
                              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div className="ml-3 flex items-center">
                              {method.icon}
                              <span className="ml-2 text-sm font-medium text-gray-900">{method.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {bookingData.paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Booking Confirmation</h2>

                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Ready to Confirm</h3>
                          <p className="mt-1 text-sm text-green-700">
                            Please review all details before confirming your booking.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Move-in Date:</span>
                          <span>{bookingData.moveInDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span>{bookingData.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Emergency Contact:</span>
                          <span>{bookingData.emergencyContact.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="capitalize">{bookingData.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>By confirming this booking, you agree to:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>The terms and conditions of the property</li>
                        <li>The cancellation and refund policy</li>
                        <li>Providing accurate information and documents</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleBookingSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-3">
                <h4 className="font-medium">{property.title}</h4>
                <p className="text-sm text-gray-600">{property.location}</p>
                <div className="text-sm text-gray-600">
                  <p>Owner: {property.owner.name}</p>
                  <p>Contact: {property.owner.phone}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span>₹{property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span>₹{securityDeposit.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Secure Booking</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Your payment and personal information are protected with bank-level security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
