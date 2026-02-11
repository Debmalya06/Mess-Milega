"use client"

import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import SeekerDashboard from "./SeekerDashboard"
import OwnerDashboard from "./OwnerDashboard"
import { Loader2 } from "lucide-react"

const Dashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render appropriate dashboard based on user role
  const userRole = user.role?.toUpperCase() || user.roles?.[0]?.toUpperCase()

  if (userRole === "PG_OWNER" || userRole === "ROLE_PG_OWNER") {
    return <OwnerDashboard />
  }

  // Default to seeker dashboard for ROOM_FINDER or any other role
  return <SeekerDashboard />
}

export default Dashboard
