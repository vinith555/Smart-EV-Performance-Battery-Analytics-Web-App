# Authentication API Documentation

## Overview

Complete JWT-based authentication system with registration, login, logout, and password management.

---

## Endpoints

### 1. Register New User

**Endpoint:** `POST /api/users/register/`

**Description:** Create a new user account

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "role": "PERSONAL",
  "performance": 5
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | email | Yes | Unique email address |
| name | string | Yes | Full name (max 255 chars) |
| password | string | Yes | Min 8 chars, must contain letters, numbers, special chars |
| password_confirm | string | Yes | Must match password |
| role | enum | No | One of: PERSONAL, SERVICE, ADMIN (default: PERSONAL) |
| performance | integer | No | Rating 0-10 (default: 0) |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "icon": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PERSONAL",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Registration failed",
  "icon": "error",
  "errors": {
    "email": ["Email already registered"],
    "password": ["Password is too common"],
    "password_confirm": ["Passwords do not match"]
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "role": "PERSONAL",
    "performance": 5
  }'
```

---

### 2. Login User

**Endpoint:** `POST /api/users/login/`

**Description:** Authenticate user and receive JWT tokens

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | email | Yes | User email address |
| password | string | Yes | User password |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "icon": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PERSONAL",
    "is_active": true,
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Login failed",
  "icon": "error",
  "errors": {
    "non_field_errors": ["Invalid email or password"]
  }
}
```

**Token Expiry:**

- Access Token: 30 minutes
- Refresh Token: 1 day

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/users/refresh/`

**Description:** Get new access token using refresh token

**Authentication:** Not required

**Request Body:**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/users/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your-refresh-token-here"
  }'
```

---

### 4. Logout User

**Endpoint:** `POST /api/users/logout/`

**Description:** Logout user and blacklist refresh token

**Authentication:** Required (JWT Bearer token)

**Request Body:**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful",
  "icon": "success"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/users/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refresh": "your-refresh-token-here"
  }'
```

---

### 5. Get Current User Details

**Endpoint:** `GET /api/users/me/`

**Description:** Retrieve current authenticated user's information

**Authentication:** Required (JWT Bearer token)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "icon": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "user@example.com",
    "name": "John Doe",
    "role": "PERSONAL",
    "is_active": true,
    "performance": 5
  }
}
```

**Example cURL:**

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Change Password

**Endpoint:** `POST /api/users/change-password/`

**Description:** Change user password (requires old password verification)

**Authentication:** Required (JWT Bearer token)

**Request Body:**

```json
{
  "old_password": "CurrentPass123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| old_password | string | Yes | Current password for verification |
| new_password | string | Yes | New password (min 8 chars) |
| new_password_confirm | string | Yes | Must match new_password |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "icon": "success"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Password change failed",
  "icon": "error",
  "errors": {
    "old_password": "Old password is incorrect",
    "new_password_confirm": "New passwords do not match"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/users/change-password/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "old_password": "CurrentPass123!",
    "new_password": "NewSecurePass456!",
    "new_password_confirm": "NewSecurePass456!"
  }'
```

---

## JWT Token Usage

### Adding JWT Token to Requests

**Header Format:**

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example:**

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Structure

JWT tokens contain three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Parts:

1. **Header** - Token type and algorithm
2. **Payload** - User data and claims
3. **Signature** - Verification signature

---

## Authentication Flow

### Registration & Login Flow

```
1. User registers with email, name, password
   └─> Returns JWT tokens (access + refresh)

2. User logs in with email and password
   └─> Returns JWT tokens (access + refresh)

3. User makes requests with access token
   Authorization: Bearer ACCESS_TOKEN

4. When access token expires (30 min)
   └─> Use refresh token to get new access token
   POST /api/users/refresh/
   Body: {"refresh": REFRESH_TOKEN}
   └─> Returns new access token

5. User logs out
   └─> Refresh token is blacklisted
   └─> Cannot use tokens after logout
```

---

## Error Responses

### Common Error Codes

**400 Bad Request**

- Invalid data format
- Missing required fields
- Validation errors
- Password mismatch

**401 Unauthorized**

- Invalid credentials
- Expired token
- Missing token
- Blacklisted token

**403 Forbidden**

- Insufficient permissions
- Account deactivated

**404 Not Found**

- User not found

**500 Internal Server Error**

- Server error
- Database error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "icon": "error",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```

---

## Security Best Practices

1. **Store Tokens Securely**
   - Access token: Store in memory or HttpOnly cookie
   - Refresh token: Store in HttpOnly cookie

2. **HTTPS Only**
   - Always use HTTPS in production
   - Never send tokens over HTTP

3. **Token Expiry**
   - Access token expires in 30 minutes
   - Refresh token expires in 1 day
   - Implement token refresh before expiry

4. **Logout**
   - Always call logout endpoint to invalidate tokens
   - Clear stored tokens from client

5. **Password Security**
   - Use strong passwords (min 8 chars, mixed case, numbers, special chars)
   - Change password regularly
   - Never share tokens or passwords

---

## Testing with Postman

### 1. Register New User

```
Method: POST
URL: http://localhost:8000/api/users/register/
Headers: Content-Type: application/json
Body (raw JSON):
{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "role": "PERSONAL"
}
```

### 2. Login

```
Method: POST
URL: http://localhost:8000/api/users/login/
Headers: Content-Type: application/json
Body (raw JSON):
{
    "email": "test@example.com",
    "password": "TestPass123!"
}
```

### 3. Get User Details

```
Method: GET
URL: http://localhost:8000/api/users/me/
Headers:
  Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

### 4. Change Password

```
Method: POST
URL: http://localhost:8000/api/users/change-password/
Headers:
  Content-Type: application/json
  Authorization: Bearer <YOUR_ACCESS_TOKEN>
Body (raw JSON):
{
    "old_password": "TestPass123!",
    "new_password": "NewTestPass456!",
    "new_password_confirm": "NewTestPass456!"
}
```

### 5. Logout

```
Method: POST
URL: http://localhost:8000/api/users/logout/
Headers:
  Content-Type: application/json
  Authorization: Bearer <YOUR_ACCESS_TOKEN>
Body (raw JSON):
{
    "refresh": "<YOUR_REFRESH_TOKEN>"
}
```

---

## Implementation Notes

### Using in JavaScript/Frontend

```javascript
// Register
const register = async (userData) => {
  const response = await fetch("/api/users/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Login
const login = async (email, password) => {
  const response = await fetch("/api/users/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem("access_token", data.data.access);
  localStorage.setItem("refresh_token", data.data.refresh);
  return data;
};

// Authenticated Request
const makeAuthRequest = (url, method = "GET", body = null) => {
  const token = localStorage.getItem("access_token");
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);
  return fetch(url, options);
};

// Get User Details
const getUserDetails = () => {
  return makeAuthRequest("/api/users/me/");
};

// Logout
const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  await makeAuthRequest("/api/users/logout/", "POST", { refresh: refreshToken });
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
```

---

## Status Codes Reference

| Code | Meaning      | When Used                 |
| ---- | ------------ | ------------------------- |
| 200  | OK           | Successful GET/POST       |
| 201  | Created      | Successful registration   |
| 400  | Bad Request  | Validation error          |
| 401  | Unauthorized | Invalid credentials/token |
| 403  | Forbidden    | Permission denied         |
| 404  | Not Found    | Resource not found        |
| 500  | Server Error | Internal error            |

---

**Last Updated**: February 25, 2026
**API Version**: 1.0
**Status**: Production Ready ✅
