import axios from "axios";

// Configure base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for auth/me endpoint (initial check)
      const isAuthMeRequest = error.config?.url?.includes("/api/auth/me");
      if (!isAuthMeRequest) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH SERVICES =====================
export const authService = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (userData) => api.post("/api/auth/register", userData),
  verifyOtp: (email, otp) => api.post("/api/auth/verify-otp", { email, otp }),
  resendOtp: (email) => api.post("/api/auth/resend-otp", { email }),
  getMe: () => api.get("/api/auth/me"),
};

// ===================== SEEKER DASHBOARD =====================
export const seekerService = {
  // Dashboard
  getDashboard: () => api.get("/api/seeker/dashboard"),

  // Favorites
  getFavorites: () => api.get("/api/seeker/favorites"),
  addToFavorites: (propertyId, note = "") =>
    api.post(`/api/seeker/favorites/${propertyId}`, null, { params: { note } }),
  removeFromFavorites: (propertyId) =>
    api.delete(`/api/seeker/favorites/${propertyId}`),
  toggleFavorite: (propertyId) =>
    api.post(`/api/seeker/favorites/${propertyId}/toggle`),
  checkFavorite: (propertyId) =>
    api.get(`/api/seeker/favorites/${propertyId}/check`),
  updateFavoriteNote: (propertyId, note) =>
    api.put(`/api/seeker/favorites/${propertyId}/note`, null, { params: { note } }),

  // Inquiries
  getInquiries: () => api.get("/api/seeker/inquiries"),
  getInquiryById: (inquiryId) => api.get(`/api/seeker/inquiries/${inquiryId}`),
  sendInquiry: (data) => api.post("/api/seeker/inquiries", data),
  replyToInquiry: (inquiryId, message) =>
    api.post(`/api/seeker/inquiries/${inquiryId}/reply`, null, { params: { message } }),
  markInquiryAsRead: (inquiryId) =>
    api.post(`/api/seeker/inquiries/${inquiryId}/read`),
  closeInquiry: (inquiryId) =>
    api.post(`/api/seeker/inquiries/${inquiryId}/close`),

  // Visits
  getVisits: () => api.get("/api/seeker/visits"),
  getUpcomingVisits: () => api.get("/api/seeker/visits/upcoming"),
  scheduleVisit: (data) => api.post("/api/seeker/visits", data),
  rescheduleVisit: (visitId, data) =>
    api.put(`/api/seeker/visits/${visitId}/reschedule`, data),
  cancelVisit: (visitId, reason) =>
    api.post(`/api/seeker/visits/${visitId}/cancel`, null, { params: { reason } }),

  // Reviews
  getMyReviews: () => api.get("/api/seeker/reviews"),
  writeReview: (data) => api.post("/api/seeker/reviews", data),
  markReviewHelpful: (reviewId) =>
    api.post(`/api/seeker/reviews/${reviewId}/helpful`),
  reportReview: (reviewId, reason) =>
    api.post(`/api/seeker/reviews/${reviewId}/report`, null, { params: { reason } }),

  // Preferences
  getPreferences: () => api.get("/api/seeker/preferences"),
  updatePreferences: (data) => api.put("/api/seeker/preferences", data),
  updateLocationPreferences: (data) =>
    api.put("/api/seeker/preferences/location", data),
  updateBudgetPreferences: (data) =>
    api.put("/api/seeker/preferences/budget", data),
  clearSearchHistory: () => api.delete("/api/seeker/preferences/search-history"),
};

// ===================== BOOKING SERVICES =====================
export const bookingService = {
  // Seeker endpoints
  createBookingRequest: (data) => api.post("/api/bookings/request", data),
  submitDocuments: (bookingId, documents) =>
    api.post(`/api/bookings/${bookingId}/documents`, { documents }),
  getMyBookings: () => api.get("/api/bookings/my-bookings"),
  getActiveBooking: () => api.get("/api/bookings/my-bookings/active"),
  cancelBooking: (bookingId, reason) =>
    api.post(`/api/bookings/${bookingId}/cancel`, null, { params: { reason } }),
  getBookingById: (bookingId) => api.get(`/api/bookings/${bookingId}`),

  // Owner endpoints
  getOwnerBookingRequests: () => api.get("/api/bookings/owner/requests"),
  getPendingBookingRequests: () => api.get("/api/bookings/owner/requests/pending"),
  confirmBooking: (bookingId) => api.post(`/api/bookings/${bookingId}/confirm`),
  rejectBooking: (bookingId, reason) =>
    api.post(`/api/bookings/${bookingId}/reject`, null, { params: { reason } }),
  verifyDocuments: (bookingId, approved, note = "") =>
    api.post(`/api/bookings/${bookingId}/verify-documents`, null, {
      params: { approved, note },
    }),
  requestPayment: (bookingId) =>
    api.post(`/api/bookings/${bookingId}/request-payment`),
  confirmAdvancePayment: (bookingId, paymentMethod) =>
    api.post(`/api/bookings/${bookingId}/confirm-payment`, null, {
      params: { paymentMethod },
    }),
  completeBooking: (bookingId, checkOutDate) =>
    api.post(`/api/bookings/${bookingId}/complete`, null, {
      params: { checkOutDate },
    }),
  getOwnerBookingStatistics: () => api.get("/api/bookings/owner/statistics"),
};

// ===================== PAYMENT SERVICES =====================
export const paymentService = {
  // Seeker endpoints
  getMyPayments: () => api.get("/api/payments/my-payments"),
  getPendingPayments: () => api.get("/api/payments/my-payments/pending"),
  getOverduePayments: () => api.get("/api/payments/my-payments/overdue"),
  getLateFee: (paymentId) => api.get(`/api/payments/${paymentId}/late-fee`),
  getBookingPaymentHistory: (bookingId) =>
    api.get(`/api/payments/booking/${bookingId}`),

  // Owner endpoints
  getOwnerPayments: () => api.get("/api/payments/owner/payments"),
  recordPayment: (paymentId, paymentMethod, transactionId = "") =>
    api.post(`/api/payments/${paymentId}/record`, null, {
      params: { paymentMethod, transactionId },
    }),
  createMonthlyPayment: (bookingId) =>
    api.post(`/api/payments/create-monthly/${bookingId}`),
  getOwnerPaymentStatistics: () => api.get("/api/payments/owner/statistics"),
};

// ===================== PROPERTY SERVICES =====================
export const propertyService = {
  // Public endpoints
  getPropertyById: (propertyId) => api.get(`/api/properties/${propertyId}`),
  searchProperties: (params) => api.get("/api/properties/public/search", { params }),

  // Owner endpoints
  addProperty: (data) => api.post("/api/properties/add", data),
  
  // Add property with images (multipart form data)
  addPropertyWithImages: (propertyData, imageFiles) => {
    const formData = new FormData();
    formData.append("property", JSON.stringify(propertyData));
    
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }
    
    return api.post("/api/properties/add-with-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  updateProperty: (propertyId, data) =>
    api.put(`/api/properties/${propertyId}`, data),
  deleteProperty: (propertyId) => api.delete(`/api/properties/${propertyId}`),
  getMyProperties: () => api.get("/api/properties/my-properties"),
  getMyActiveProperties: () => api.get("/api/properties/my-active-properties"),
  getMyPropertyStatistics: () => api.get("/api/properties/my-statistics"),
};

// ===================== IMAGE UPLOAD SERVICES =====================
export const imageService = {
  // Upload single image
  uploadImage: (file, folder = "properties") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    
    return api.post("/api/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Upload multiple images
  uploadMultipleImages: (files, folder = "properties") => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("folder", folder);
    
    return api.post("/api/images/upload-multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Delete image
  deleteImage: (imageUrl) => 
    api.delete("/api/images/delete", { params: { url: imageUrl } }),
};

// ===================== PUBLIC REVIEW SERVICES =====================
export const reviewService = {
  getPropertyReviews: (propertyId) =>
    api.get(`/api/public/reviews/property/${propertyId}`),
};

// ===================== OWNER DASHBOARD =====================
export const ownerService = {
  // Dashboard
  getDashboard: () => api.get("/api/owner/dashboard"),

  // Inquiries
  getInquiries: () => api.get("/api/owner/inquiries"),
  getPendingInquiries: () => api.get("/api/owner/inquiries/pending"),
  replyToInquiry: (inquiryId, message) =>
    api.post(`/api/owner/inquiries/${inquiryId}/reply`, null, { params: { message } }),
  markInquiryAsRead: (inquiryId) =>
    api.post(`/api/owner/inquiries/${inquiryId}/read`),

  // Visits
  getVisits: () => api.get("/api/owner/visits"),
  getPendingVisits: () => api.get("/api/owner/visits/pending"),
  getUpcomingVisits: () => api.get("/api/owner/visits/upcoming"),
  confirmVisit: (visitId) => api.post(`/api/owner/visits/${visitId}/confirm`),
  cancelVisit: (visitId, reason) =>
    api.post(`/api/owner/visits/${visitId}/cancel`, null, { params: { reason } }),
  rescheduleVisit: (visitId, data) =>
    api.put(`/api/owner/visits/${visitId}/reschedule`, data),

  // Reviews
  getReviews: () => api.get("/api/owner/reviews"),
  respondToReview: (reviewId, response) =>
    api.post(`/api/owner/reviews/${reviewId}/respond`, null, { params: { response } }),
};

export default api;
