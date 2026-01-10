"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Maximize, Play, Pause } from "lucide-react"

const VirtualTour = () => {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const videoRef = useRef(null)

  // Mock property data with virtual tour content
  useEffect(() => {
    const mockProperty = {
      id: id,
      title: "Comfortable PG for Working Professionals",
      location: "Koramangala, Bangalore",
      virtualTour: {
        type: "360", // or "video"
        views: [
          {
            id: 1,
            name: "Living Room",
            image: "/placeholder.svg?height=600&width=800",
            description: "Spacious living room with comfortable seating",
          },
          {
            id: 2,
            name: "Bedroom",
            image: "/placeholder.svg?height=600&width=800",
            description: "Well-furnished bedroom with study table",
          },
          {
            id: 3,
            name: "Kitchen",
            image: "/placeholder.svg?height=600&width=800",
            description: "Modern kitchen with all amenities",
          },
          {
            id: 4,
            name: "Bathroom",
            image: "/placeholder.svg?height=600&width=800",
            description: "Clean and modern bathroom facilities",
          },
          {
            id: 5,
            name: "Common Area",
            image: "/placeholder.svg?height=600&width=800",
            description: "Shared common area for relaxation",
          },
        ],
        videoUrl: "/placeholder-video.mp4", // For video tours
      },
    }

    setTimeout(() => {
      setProperty(mockProperty)
      setLoading(false)
    }, 1000)
  }, [id])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleFullscreen = () => {
    const element = document.getElementById("tour-container")
    if (element.requestFullscreen) {
      element.requestFullscreen()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Virtual tour not available</h2>
          <Link to="/search" className="text-blue-400 hover:text-blue-300">
            Back to search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/property/${id}`} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{property.title}</h1>
              <p className="text-sm text-gray-300">{property.location}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tour Container */}
      <div id="tour-container" className="relative h-screen">
        {property.virtualTour.type === "360" ? (
          /* 360° Image Tour */
          <div className="relative h-full overflow-hidden">
            <img
              src={property.virtualTour.views[currentView].image || "/placeholder.svg"}
              alt={property.virtualTour.views[currentView].name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
            />

            {/* View Info */}
            <div className="absolute bottom-20 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-lg">{property.virtualTour.views[currentView].name}</h3>
              <p className="text-sm text-gray-300">{property.virtualTour.views[currentView].description}</p>
            </div>
          </div>
        ) : (
          /* Video Tour */
          <div className="relative h-full">
            <video
              ref={videoRef}
              src={property.virtualTour.videoUrl}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <button
                onClick={togglePlayPause}
                className="bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Thumbnails */}
      {property.virtualTour.type === "360" && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {property.virtualTour.views.map((view, index) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(index)}
                className={`flex-shrink-0 relative ${currentView === index ? "ring-2 ring-blue-500" : ""}`}
              >
                <img
                  src={view.image || "/placeholder.svg"}
                  alt={view.name}
                  className="w-20 h-16 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg p-1">
                  <p className="text-xs text-white text-center">{view.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-xs">
        <h4 className="font-medium mb-2">How to navigate:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Click and drag to look around</li>
          <li>• Use zoom controls to get closer</li>
          <li>• Click thumbnails to change rooms</li>
          <li>• Press F for fullscreen</li>
        </ul>
      </div>
    </div>
  )
}

export default VirtualTour
