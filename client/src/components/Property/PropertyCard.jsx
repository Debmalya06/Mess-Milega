import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Wifi,
  Car,
  Utensils,
  Star,
  Phone,
  MessageCircle,
  Eye,
} from "lucide-react";

const PropertyCard = ({ property, viewMode = "grid" }) => {
  const amenityIcons = {
    wifi: <Wifi className="h-4 w-4" />,
    parking: <Car className="h-4 w-4" />,
    meals: <Utensils className="h-4 w-4" />,
    laundry: <Users className="h-4 w-4" />,
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={property.images?.[0] || "/placeholder.svg?height=200&width=300"}
              alt={property.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-2/3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{property.rating || 4.5}</span>
              </div>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.location}</span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.amenities?.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {amenityIcons[amenity] || <span className="w-4 h-4" />}
                  <span>{amenity}</span>
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-purple-600">₹{property.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <Link
                  to={`/virtual-tour/${property.id}`}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  to={`/property/${property.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative">
        <img
          src={property.images?.[0] || "/placeholder.svg?height=200&width=300"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-purple-600">
          {property.type?.toUpperCase()}
        </div>
        <div className="absolute top-3 left-3 flex items-center space-x-1 bg-white px-2 py-1 rounded-full">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-xs font-semibold">{property.rating || 4.5}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities?.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
            >
              {amenityIcons[amenity] || <span className="w-3 h-3" />}
              <span>{amenity}</span>
            </span>
          ))}
          {property.amenities?.length > 3 && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-xl font-bold text-purple-600">₹{property.price}</span>
            <span className="text-gray-600 text-sm">/month</span>
          </div>
          <div className="flex space-x-1">
            <button className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors">
              <MessageCircle className="h-4 w-4" />
            </button>
            <Link
              to={`/virtual-tour/${property.id}`}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <Link
          to={`/property/${property.id}`}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-center block font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
