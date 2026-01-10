"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, X, User, LogOut, Home } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PGFinderAI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-700 hover:text-purple-600 font-medium">
              Features
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-purple-600 font-medium">
              Find a PG
            </Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-purple-600 font-medium">
              Testimonials
            </Link>

            {user ? (
              <>
                <Link to="/chat" className="text-gray-700 hover:text-purple-600 font-medium">
                  Chat
                </Link>
                <Link
                  to={user.role === "owner" ? "/owner-dashboard" : "/dashboard"}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/features" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Features
            </Link>
            <Link to="/search" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Find a PG
            </Link>
            <Link to="/testimonials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Testimonials
            </Link>
            {user ? (
              <>
                <Link to="/chat" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Chat
                </Link>
                <Link
                  to={user.role === "owner" ? "/owner-dashboard" : "/dashboard"}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Log In
                </Link>
                <Link to="/register" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar