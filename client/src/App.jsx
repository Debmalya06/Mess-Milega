import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"
import Navbar from "./components/Layout/Navbar"
import Footer from "./components/Layout/Footer"
import Home from "./pages/Home"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import Search from "./pages/Search"
import PropertyDetails from "./pages/PropertyDetails"
import Dashboard from "./pages/Dashboard/Dashboard"
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard"
import Chat from "./pages/Chat"
import Booking from "./pages/Booking"
import Profile from "./pages/Profile"
import VirtualTour from "./pages/VirtualTour"
import "./App.css"
import axios from "axios"

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080"

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/virtual-tour/:id" element={<VirtualTour />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
