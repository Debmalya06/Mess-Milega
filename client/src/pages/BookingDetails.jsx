"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Home,
  Phone,
  Mail,
  Upload,
  Eye,
  MessageCircle
} from "lucide-react"
import { bookingService, paymentService } from "../services/api"

const BookingDetails = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [payments, setPayments] = useState([])
  const [error, setError] = useState("")
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  
  // Document upload
  const [documents, setDocuments] = useState([
    { documentType: "", documentUrl: "", documentNumber: "" }
  ])

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const [bookingResponse, paymentsResponse] = await Promise.all([
        bookingService.getBookingById(bookingId),
        paymentService.getBookingPaymentHistory(bookingId).catch(() => ({ data: [] }))
      ])
      setBooking(bookingResponse.data)
      setPayments(paymentsResponse.data || [])
    } catch (err) {
      console.error("Error fetching booking details:", err)
      setError("Failed to load booking details")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return
    
    setCancelLoading(true)
    try {
      await bookingService.cancelBooking(bookingId, cancelReason)
      setShowCancelModal(false)
      fetchBookingDetails()
    } catch (err) {
      console.error("Error canceling booking:", err)
      setError("Failed to cancel booking")
    } finally {
      setCancelLoading(false)
    }
  }

  const handleSubmitDocuments = async () => {
    const validDocuments = documents.filter(
      doc => doc.documentType && doc.documentUrl
    )
    
    if (validDocuments.length === 0) {
      setError("Please add at least one document")
      return
    }
    
    try {
      await bookingService.submitDocuments(bookingId, validDocuments)
      setShowDocumentModal(false)
      setDocuments([{ documentType: "", documentUrl: "", documentNumber: "" }])
      fetchBookingDetails()
    } catch (err) {
      console.error("Error submitting documents:", err)
      setError("Failed to submit documents")
    }
  }

  const addDocumentField = () => {
    setDocuments([...documents, { documentType: "", documentUrl: "", documentNumber: "" }])
  }

  const updateDocument = (index, field, value) => {
    const updated = [...documents]
    updated[index][field] = value
    setDocuments(updated)
  }

  const removeDocumentField = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index))
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "DOCUMENTS_SUBMITTED":
      case "DOCUMENTS_VERIFIED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "CONFIRMED":
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5" />
      case "CANCELLED":
      case "REJECTED":
        return <XCircle className="h-5 w-5" />
      case "PENDING":
      case "PAYMENT_PENDING":
        return <Clock className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Error Loading Booking</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Define booking flow steps
  const bookingSteps = [
    { key: "PENDING", label: "Request Sent", description: "Waiting for owner approval" },
    { key: "CONFIRMED", label: "Confirmed", description: "Owner approved the booking" },
    { key: "DOCUMENTS_SUBMITTED", label: "Documents", description: "Submit your documents" },
    { key: "DOCUMENTS_VERIFIED", label: "Verified", description: "Documents verified by owner" },
    { key: "PAYMENT_PENDING", label: "Payment", description: "Complete advance payment" },
    { key: "ACTIVE", label: "Active", description: "Booking is active" },
  ]

  const currentStepIndex = bookingSteps.findIndex(step => step.key === booking?.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600">Booking ID: {booking?.id}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${getStatusColor(booking?.status)}`}>
              {getStatusIcon(booking?.status)}
              <span className="font-medium">{booking?.status?.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Tracker */}
        {!["CANCELLED", "REJECTED", "COMPLETED"].includes(booking?.status) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Progress</h2>
            <div className="relative">
              <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(currentStepIndex / (bookingSteps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {bookingSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        index <= currentStepIndex
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center ${
                      index <= currentStepIndex ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Property Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h2>
          <div className="flex items-start space-x-4">
            <img
              src={booking?.propertyImage || "/placeholder.svg?height=150&width=200"}
              alt={booking?.propertyTitle}
              className="w-32 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{booking?.propertyTitle || "Property"}</h3>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{booking?.propertyAddress || "Address not available"}</span>
              </div>
              <div className="mt-3">
                <Link
                  to={`/property/${booking?.propertyId}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Property
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stay Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Stay Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Date</span>
                <span className="font-medium text-gray-900">{formatDate(booking?.checkInDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-900">{booking?.numberOfMonths || 1} month(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Check-out</span>
                <span className="font-medium text-gray-900">{formatDate(booking?.expectedCheckOutDate)}</span>
              </div>
              {booking?.actualCheckOutDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Check-out</span>
                  <span className="font-medium text-gray-900">{formatDate(booking?.actualCheckOutDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-medium text-gray-900">₹{(booking?.monthlyRent || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-medium text-gray-900">₹{(booking?.securityDeposit || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Amount</span>
                <span className="font-medium text-gray-900">₹{(booking?.advanceAmount || 0).toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium text-gray-900">Total Payable</span>
                <span className="font-bold text-blue-600">
                  ₹{((booking?.monthlyRent || 0) + (booking?.securityDeposit || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Contact */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="h-5 w-5 mr-2 text-blue-600" />
            Owner Contact
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{booking?.ownerName || "Property Owner"}</p>
              {booking?.ownerPhone && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{booking.ownerPhone}</span>
                </div>
              )}
              {booking?.ownerEmail && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{booking.ownerEmail}</span>
                </div>
              )}
            </div>
            <Link
              to="/chat"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Owner
            </Link>
          </div>
        </div>

        {/* Documents Section */}
        {booking?.documents && booking.documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Submitted Documents
            </h2>
            <div className="space-y-3">
              {booking.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doc.documentType}</p>
                    {doc.documentNumber && (
                      <p className="text-sm text-gray-500">Number: {doc.documentNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.verified ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.paymentType?.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ₹{(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(payment.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            {/* Show document upload button if booking is confirmed but documents not submitted */}
            {booking?.status === "CONFIRMED" && (
              <button
                onClick={() => setShowDocumentModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Documents
              </button>
            )}

            {/* Show cancel button for pending/confirmed bookings */}
            {["PENDING", "CONFIRMED"].includes(booking?.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </button>
            )}

            <Link
              to={`/property/${booking?.propertyId}`}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Property
            </Link>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide a reason..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancelReason.trim() || cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {cancelLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Documents</h3>
              <p className="text-gray-600 mb-4">
                Please upload the required documents for verification.
              </p>
              
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Document {index + 1}</span>
                      {documents.length > 1 && (
                        <button
                          onClick={() => removeDocumentField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type *
                        </label>
                        <select
                          value={doc.documentType}
                          onChange={(e) => updateDocument(index, "documentType", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="AADHAAR">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="COLLEGE_ID">College ID</option>
                          <option value="OFFICE_ID">Office ID</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document URL *
                        </label>
                        <input
                          type="url"
                          value={doc.documentUrl}
                          onChange={(e) => updateDocument(index, "documentUrl", e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload your document to a cloud service and paste the link here
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Number
                        </label>
                        <input
                          type="text"
                          value={doc.documentNumber}
                          onChange={(e) => updateDocument(index, "documentNumber", e.target.value)}
                          placeholder="Optional"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addDocumentField}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
                >
                  + Add Another Document
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitDocuments}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Documents
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingDetails
