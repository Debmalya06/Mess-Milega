"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  MessageCircle,
  X
} from "lucide-react"
import { seekerService } from "../services/api"

const InquiryDetails = () => {
  const { inquiryId } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [inquiry, setInquiry] = useState(null)
  const [error, setError] = useState("")
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInquiry()
  }, [inquiryId])

  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const response = await seekerService.getInquiryById(inquiryId)
      setInquiry(response.data)
      
      // Mark as read if not already
      if (!response.data.read) {
        await seekerService.markInquiryAsRead(inquiryId)
      }
    } catch (err) {
      console.error("Error fetching inquiry:", err)
      setError("Failed to load inquiry details")
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    
    setSending(true)
    try {
      await seekerService.replyToInquiry(inquiryId, replyText)
      setReplyText("")
      fetchInquiry() // Refresh to show new reply
    } catch (err) {
      console.error("Error sending reply:", err)
      setError("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const handleCloseInquiry = async () => {
    if (!confirm("Are you sure you want to close this inquiry?")) return
    
    try {
      await seekerService.closeInquiry(inquiryId)
      fetchInquiry()
    } catch (err) {
      console.error("Error closing inquiry:", err)
      setError("Failed to close inquiry")
    }
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
          <p className="text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    )
  }

  if (error && !inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Error Loading Inquiry</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{inquiry?.subject || "Inquiry"}</h1>
              <p className="text-gray-600 mt-1">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDateTime(inquiry?.createdAt)}
                </span>
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              inquiry?.status === "OPEN" ? "bg-green-100 text-green-800" :
              inquiry?.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {inquiry?.status}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Property Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <h3 className="font-medium text-gray-900">{inquiry?.propertyTitle || "Property"}</h3>
              {inquiry?.propertyAddress && (
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{inquiry.propertyAddress}</span>
                </div>
              )}
            </div>
            <Link
              to={`/property/${inquiry?.propertyId}`}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <Home className="h-4 w-4 mr-1" />
              View Property
            </Link>
          </div>
        </div>

        {/* Inquiry Type */}
        {inquiry?.inquiryType && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {inquiry.inquiryType.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Messages Thread */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Original Message */}
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                You
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900">You</p>
                  <span className="text-xs text-gray-500">{formatDateTime(inquiry?.createdAt)}</span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{inquiry?.message}</p>
              </div>
            </div>
          </div>

          {/* Replies */}
          {inquiry?.replies && inquiry.replies.length > 0 && (
            <div className="divide-y divide-gray-200">
              {inquiry.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`p-4 ${reply.senderId === inquiry.seekerId ? "bg-blue-50" : "bg-white"}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      reply.senderId === inquiry.seekerId ? "bg-blue-600" : "bg-green-600"
                    }`}>
                      {reply.senderId === inquiry.seekerId ? "You" : "O"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900">
                          {reply.senderId === inquiry.seekerId ? "You" : inquiry.ownerName || "Owner"}
                        </p>
                        <span className="text-xs text-gray-500">{formatDateTime(reply.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 mt-2 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {inquiry?.status === "OPEN" && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Type your reply..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {inquiry?.status === "OPEN" && (
          <div className="flex justify-end">
            <button
              onClick={handleCloseInquiry}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Close Inquiry
            </button>
          </div>
        )}

        {inquiry?.status === "CLOSED" && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">This inquiry has been closed</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InquiryDetails
