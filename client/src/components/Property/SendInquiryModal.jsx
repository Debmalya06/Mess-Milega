"use client"

import { useState } from "react"
import { MessageCircle, X, Loader2, CheckCircle, AlertCircle, Send } from "lucide-react"
import { seekerService } from "../../services/api"

const SendInquiryModal = ({ propertyId, propertyTitle, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    inquiryType: "GENERAL"
  })

  const inquiryTypes = [
    { value: "GENERAL", label: "General Information" },
    { value: "AVAILABILITY", label: "Room Availability" },
    { value: "PRICING", label: "Pricing & Payment" },
    { value: "AMENITIES", label: "Amenities & Facilities" },
    { value: "RULES", label: "House Rules" },
    { value: "LOCATION", label: "Location & Commute" },
    { value: "VISIT", label: "Schedule a Visit" },
    { value: "OTHER", label: "Other" }
  ]

  const quickSubjects = [
    "Is this property available?",
    "What amenities are included?",
    "Can I schedule a visit?",
    "What is the security deposit?",
    "Are meals included?",
    "Is there parking available?"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      await seekerService.sendInquiry({
        propertyId,
        subject: formData.subject,
        message: formData.message,
        inquiryType: formData.inquiryType
      })
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error sending inquiry:", err)
      setError(err.response?.data?.message || "Failed to send inquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Inquiry Sent!</h3>
          <p className="text-gray-600">
            Your inquiry has been sent to the property owner. You'll receive a response soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send Inquiry</h3>
            <p className="text-sm text-gray-600 truncate max-w-xs">{propertyTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Inquiry Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="h-4 w-4 inline mr-1" />
              Inquiry Type
            </label>
            <select
              value={formData.inquiryType}
              onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {inquiryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Subject Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Questions
            </label>
            <div className="flex flex-wrap gap-2">
              {quickSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    subject,
                    message: formData.message || `Hi, I'm interested in this property. ${subject}` 
                  })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.subject === subject
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-blue-300 text-gray-600"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter your inquiry subject"
              required
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              placeholder="Write your message to the property owner..."
              required
              maxLength={2000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/2000 characters
            </p>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">💡 Tips for a good inquiry:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Be specific about what you want to know</li>
              <li>• Mention when you're looking to move in</li>
              <li>• Ask about any specific requirements you have</li>
              <li>• Be polite and professional</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.subject.trim() || !formData.message.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendInquiryModal
