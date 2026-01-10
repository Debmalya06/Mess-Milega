# Mess PG Sathi - API Testing Guide

## 📌 Overview
This guide provides comprehensive instructions for testing the Mess PG Sathi API using Postman.

---

## 🚀 Getting Started

### Prerequisites
1. **Postman** installed ([Download here](https://www.postman.com/downloads/))
2. **Backend server** running on `http://localhost:8080`
3. **MongoDB** connection active

### Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Mess_PG_Sathi_API_Collection.json`
4. The collection will appear in your sidebar

---

## 🔑 Authentication Flow

### Important: OTP-Based Authentication
This API uses **OTP (One-Time Password) verification** for both registration and login.

### Registration Flow
```
1. POST /api/auth/register/send-otp   → Send OTP to email
2. POST /api/auth/register            → Register with OTP verification
```

### Login Flow
```
1. POST /api/auth/login/send-otp      → Send OTP after password verification
2. POST /api/auth/login               → Login with email, password & OTP
```

### For Testing (Development):
- Check server console or email for OTP
- OTP validity: 5 minutes (configurable)

---

## 👥 User Roles

| Role | Description | Access |
|------|-------------|--------|
| `ROOM_FINDER` | Seeker/Student | Search properties, book rooms, write reviews |
| `PG_OWNER` | Property Owner | Manage properties, handle bookings, view dashboard |

---

## 📋 Testing Workflow

### Step 1: Setup Test Users

#### Register a PG Owner
```json
POST /api/auth/register
{
    "name": "Test Owner",
    "email": "owner@example.com",
    "password": "Password123!",
    "phone": "9876543210",
    "role": "PG_OWNER",
    "otp": "123456"
}
```

#### Register a Room Finder
```json
POST /api/auth/register
{
    "name": "Test Seeker",
    "email": "seeker@example.com",
    "password": "Password123!",
    "phone": "9876543211",
    "role": "ROOM_FINDER",
    "otp": "123456"
}
```

### Step 2: Login and Get Tokens
After login, the JWT token is automatically saved to collection variables:
- `ownerToken` - For PG Owner requests
- `seekerToken` - For Room Finder requests

### Step 3: Test Core Features

---

## 🏠 Property Management (Owner)

### Add Property
```json
POST /api/properties/add
Authorization: Bearer {{ownerToken}}

{
    "propertyName": "Green Valley PG",
    "propertyType": "PG",
    "description": "A comfortable PG with all amenities",
    "monthlyRent": 8000,
    "securityDeposit": 16000,
    "address": {
        "addressLine1": "123, MG Road",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700001"
    },
    "latitude": 22.5726,
    "longitude": 88.3639,
    "roomType": "DOUBLE_SHARING",
    "totalBeds": 20,
    "availableBeds": 15,
    "genderPreference": "MALE",
    "amenities": {
        "wifi": true,
        "ac": true,
        "parking": true,
        "meals": true
    }
}
```

### Property Types
- `PG` - Paying Guest
- `HOSTEL` - Hostel
- `MESS` - Mess
- `FLAT` - Flat/Apartment

### Room Types
- `SINGLE` - Single occupancy
- `DOUBLE_SHARING` - 2 persons
- `TRIPLE_SHARING` - 3 persons
- `FOUR_SHARING` - 4 persons
- `DORMITORY` - Multiple occupants

### Gender Preferences
- `MALE` - Boys only
- `FEMALE` - Girls only
- `ANY` - Co-ed

---

## 📅 Booking Flow

### Complete Booking Workflow:
```
1. Seeker searches properties
2. Seeker creates booking request
3. Seeker submits documents
4. Owner reviews and approves/rejects
5. Payment created upon approval
6. Seeker makes payment
```

### Create Booking Request (Seeker)
```json
POST /api/bookings/request
Authorization: Bearer {{seekerToken}}

{
    "propertyId": "{{propertyId}}",
    "checkInDate": "2026-02-01",
    "numberOfMonths": 6
}
```

### Submit Documents (Seeker)
```json
POST /api/bookings/{bookingId}/documents
Authorization: Bearer {{seekerToken}}

{
    "documents": [
        {
            "documentType": "AADHAR",
            "documentUrl": "https://example.com/aadhar.pdf",
            "documentNumber": "1234-5678-9012"
        }
    ]
}
```

### Booking Statuses
| Status | Description |
|--------|-------------|
| `PENDING` | Waiting for owner approval |
| `DOCUMENTS_SUBMITTED` | Documents uploaded |
| `APPROVED` | Booking confirmed |
| `REJECTED` | Booking rejected |
| `ACTIVE` | Currently staying |
| `COMPLETED` | Stay completed |
| `CANCELLED` | Cancelled by user |

---

## 💰 Payment Management

### Payment Methods
- `CASH`
- `UPI`
- `BANK_TRANSFER`
- `CARD`
- `CHEQUE`

### Record Payment (Owner)
```
POST /api/payments/{paymentId}/record?paymentMethod=UPI&transactionId=TXN123
Authorization: Bearer {{ownerToken}}
```

### Payment Statuses
| Status | Description |
|--------|-------------|
| `PENDING` | Payment due |
| `PAID` | Payment completed |
| `OVERDUE` | Past due date |
| `PARTIALLY_PAID` | Partial payment |

---

## ❤️ Favorites (Seeker)

### Toggle Favorite
```
POST /api/seeker/favorites/{propertyId}/toggle
Authorization: Bearer {{seekerToken}}
```

### Add with Note
```
POST /api/seeker/favorites/{propertyId}?note=Great location
Authorization: Bearer {{seekerToken}}
```

---

## 📧 Inquiries

### Inquiry Types
- `GENERAL` - General questions
- `AVAILABILITY` - Room availability
- `PRICING` - Pricing inquiries
- `AMENITIES` - Amenity questions
- `VISIT` - Visit scheduling

### Send Inquiry (Seeker)
```json
POST /api/seeker/inquiries
Authorization: Bearer {{seekerToken}}

{
    "propertyId": "{{propertyId}}",
    "subject": "Room availability",
    "message": "Is there a bed available?",
    "inquiryType": "AVAILABILITY"
}
```

---

## 📆 Visit Scheduling

### Schedule Visit (Seeker)
```json
POST /api/seeker/visits
Authorization: Bearer {{seekerToken}}

{
    "propertyId": "{{propertyId}}",
    "visitDate": "2026-01-20",
    "visitTime": "14:00",
    "notes": "Want to see double sharing room"
}
```

### Visit Statuses
| Status | Description |
|--------|-------------|
| `REQUESTED` | Waiting approval |
| `APPROVED` | Visit confirmed |
| `REJECTED` | Visit declined |
| `COMPLETED` | Visit done |
| `CANCELLED` | Cancelled |
| `NO_SHOW` | Seeker didn't show |

---

## ⭐ Reviews

### Add Review (Seeker)
```json
POST /api/seeker/reviews
Authorization: Bearer {{seekerToken}}

{
    "propertyId": "{{propertyId}}",
    "overallRating": 4,
    "cleanliness": 5,
    "food": 4,
    "amenities": 4,
    "location": 5,
    "valueForMoney": 4,
    "ownerBehavior": 5,
    "title": "Great PG experience",
    "comment": "Highly recommended!",
    "pros": ["Clean", "Good food"],
    "cons": ["Limited parking"]
}
```

### Rating Scale
All ratings are from **1 to 5**:
- 1 = Poor
- 2 = Fair
- 3 = Good
- 4 = Very Good
- 5 = Excellent

---

## 📊 Owner Dashboard

### Get Complete Dashboard
```
GET /api/owner/dashboard
Authorization: Bearer {{ownerToken}}
```

Returns:
- Property statistics
- Booking statistics
- Payment statistics
- Pending requests
- Today's visits
- Recent reviews
- Average rating

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `baseUrl` | API base URL (default: http://localhost:8080) |
| `token` | Current active JWT token |
| `ownerToken` | PG Owner's JWT token |
| `seekerToken` | Room Finder's JWT token |
| `propertyId` | Current property ID |
| `bookingId` | Current booking ID |
| `inquiryId` | Current inquiry ID |
| `visitId` | Current visit ID |
| `paymentId` | Current payment ID |
| `reviewId` | Current review ID |

---

## ✅ Test Checklist

### Authentication Tests
- [ ] Send OTP for registration
- [ ] Register PG Owner
- [ ] Register Room Finder
- [ ] Send OTP for login
- [ ] Login as PG Owner
- [ ] Login as Room Finder
- [ ] Test invalid credentials
- [ ] Test expired OTP

### Property Tests (Owner)
- [ ] Add property with all fields
- [ ] Get my properties
- [ ] Update property
- [ ] Delete property
- [ ] Get property statistics

### Search Tests (Public)
- [ ] Search by city
- [ ] Search by property type
- [ ] Search by price range
- [ ] Search with multiple filters

### Booking Tests
- [ ] Create booking request (Seeker)
- [ ] Submit documents (Seeker)
- [ ] View pending requests (Owner)
- [ ] Approve booking (Owner)
- [ ] Reject booking (Owner)
- [ ] Cancel booking (Seeker)

### Payment Tests
- [ ] View pending payments
- [ ] Record payment (Owner)
- [ ] Check late fee
- [ ] View payment statistics

### Favorites Tests (Seeker)
- [ ] Add to favorites
- [ ] Toggle favorite
- [ ] Get all favorites
- [ ] Update note
- [ ] Remove from favorites

### Inquiry Tests
- [ ] Send inquiry (Seeker)
- [ ] Reply to inquiry (Owner)
- [ ] Get pending inquiries

### Visit Tests
- [ ] Schedule visit (Seeker)
- [ ] Approve visit (Owner)
- [ ] Cancel visit
- [ ] Get today's visits

### Review Tests
- [ ] Add review (Seeker)
- [ ] Update review
- [ ] Get property reviews
- [ ] Get rating summary

---

## 🐛 Common Issues & Solutions

### 401 Unauthorized
- Check if token is valid and not expired
- Ensure correct Authorization header format: `Bearer <token>`

### 403 Forbidden
- User doesn't have required role
- Owner endpoint called with Seeker token (or vice versa)

### 400 Bad Request
- Missing required fields
- Invalid enum values (check property type, room type, etc.)
- Invalid date format (use: YYYY-MM-DD)

### MongoDB Connection Error
- Check MongoDB connection string in `application.properties`
- Ensure MongoDB is running

---

## 📞 Support

For issues or questions, check:
1. Server logs for detailed error messages
2. MongoDB logs for database issues
3. Postman console for request/response details

---

**Happy Testing! 🎉**
