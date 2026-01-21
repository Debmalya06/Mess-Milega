"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

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

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { accessToken, id, fullName, email: userEmail, role } = response.data

      localStorage.setItem("token", accessToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      setUser({ id, fullName, email: userEmail, role })

      return { success: true }
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
