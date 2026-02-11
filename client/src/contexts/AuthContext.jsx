"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
axios.defaults.baseURL = API_BASE_URL

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        await fetchUser()
      } else {
        setLoading(false)
      }
      setIsInitialized(true)
    }
    initAuth()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data)
    } catch (error) {
      console.log("Failed to fetch user:", error.response?.status)
      // Only remove token on 401 (unauthorized), not on network errors
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, id, fullName, email: userEmail, role } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser({ id, fullName, email: userEmail, role })

      return { success: true, role }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" }
    }
  }

  const register = async (userData) => {
    try {
      // Map frontend fields to backend SignupRequest format
      const signupData = {
        fullName: userData.name,
        email: userData.email,
        phoneNumber: userData.phone,
        password: userData.password,
        role: userData.role === "owner" ? "PG_OWNER" : "ROOM_FINDER"
      }
      const response = await axios.post("/api/auth/register", signupData)
      
      // Backend returns MessageResponse with OTP info, user needs to verify email
      return { 
        success: true, 
        message: response.data.message,
        requiresVerification: true,
        email: userData.email
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    }
  }

  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post("/api/auth/verify-otp", { email, otp })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "OTP verification failed" }
    }
  }

  const resendOtp = async (email) => {
    try {
      const response = await axios.post("/api/auth/resend-otp", { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to resend OTP" }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    loading,
    isInitialized,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
