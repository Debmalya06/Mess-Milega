"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Users,
  Phone,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Calendar,
  Shield,
  CheckCircle,
} from "lucide-react"
import ImageGallery from "react-image-gallery"
import "react-image-gallery/styles/css/image-gallery.css"
import toast from "react-hot-toast"

const PropertyDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Fetch property data from backend API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/properties/${id}`)
        const data = response.data
        
        // Map backend response to frontend format
        setProperty({
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          location: `${data.address}, ${data.city}`,
          type: data.propertyType?.toLowerCase(),
          rating: data.averageRating || 0,
          reviews: data.totalReviews || 0,
          images: data.images?.length > 0 ? data.images : ["/placeholder.svg?height=400&width=600"],
          amenities: data.amenities || [],
          roomType: data.roomType?.toLowerCase(),
          gender: data.genderPreference?.toLowerCase(),
          availableRooms: data.availableRooms,
          owner: {
            name: data.ownerName || "Property Owner",
            phone: data.ownerPhone || "",
            email: data.ownerEmail || "",
            verified: true,
            rating: 4.8,
          },
          rules: data.rules || [],
          nearbyPlaces: data.nearbyPlaces || [],
          coordinates: { lat: data.latitude || 0, lng: data.longitude || 0 },
        })
      } catch (error) {
        console.error("Error fetching property:", error)
        toast.error("Failed to load property details")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const amenityIcons = {
    wifi: <Wifi className="h-5 w-5" />,
    parking: <Car className="h-5 w-5" />,
    meals: <Utensils className="h-5 w-5" />,
    laundry: <Users className="h-5 w-5" />,
    ac: <Users className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />,
    power_backup: <Users className="h-5 w-5" />,
  }

  const handleCall = () => {
    if (property?.owner?.phone) {
      window.open(`tel:${property.owner.phone}`)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <Link to="/search" className="text-blue-600 hover:text-blue-800">
            Back to search
          </Link>
        </div>
      </div>
    )
  }

  const galleryImages = property.images.map((img) => ({
    original: img,
    thumbnail: img,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  <span>
                    {property.rating} ({property.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg ${
                  isFavorite ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.type.toUpperCase()}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.roomType} Room
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.gender}
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.availableRooms} Available
            </span>
          </div>

          <div className="text-3xl font-bold text-blue-600">
            ₹{property.price.toLocaleString()}
            <span className="text-lg text-gray-600 font-normal">/month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ImageGallery
                items={galleryImages}
                showThumbnails={true}
                showPlayButton={false}
                showFullscreenButton={true}
                autoPlay={false}
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600">{amenityIcons[amenity] || <CheckCircle className="h-5 w-5" />}</div>
                    <span className="text-gray-700 capitalize">{amenity.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">House Rules</h2>
              <ul className="space-y-2">
                {property.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearby Places */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Nearby Places</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{place.name}</span>
                    <span className="text-blue-600 font-medium">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Property Owner</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {property.owner.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{property.owner.name}</h3>
                    {property.owner.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{property.owner.rating} rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Owner</span>
                </button>

                <Link
                  to="/chat"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with Owner</span>
                </Link>

                <Link
                  to={`/virtual-tour/${property.id}`}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>Virtual Tour</span>
                </Link>
              </div>
            </div>

            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Book This Property</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{property.price}</div>
                  <div className="text-gray-600">per month</div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Security Deposit</span>
                    <span>₹{property.price}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{property.price * 2}</span>
                  </div>
                </div>

                {user ? (
                  <Link
                    to={`/booking/${property.id}`}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center block"
                  >
                    Book Now
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center block"
                  >
                    Login to Book
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Schedule Visit</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span>Report Property</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails
