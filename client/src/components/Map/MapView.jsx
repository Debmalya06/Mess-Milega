import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Link } from "react-router-dom"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const MapView = ({ properties }) => {
  const defaultCenter = [28.6139, 77.209] // Delhi coordinates

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={defaultCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude || defaultCenter[0], property.longitude || defaultCenter[1]]}
          >
            <Popup>
              <div className="p-2">
                <img
                  src={property.images?.[0] || "/placeholder.svg?height=100&width=150"}
                  alt={property.title}
                  className="w-full h-20 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{property.location}</p>
                <p className="text-sm font-bold text-blue-600">₹{property.price}/month</p>
                <Link
                  to={`/property/${property.id}`}
                  className="block mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded text-center hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView
