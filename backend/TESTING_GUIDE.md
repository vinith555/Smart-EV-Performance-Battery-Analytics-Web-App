# 🧪 Authentication Testing Guide

## Quick Test with cURL

### 1. Register a New User

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "TestPassword123!",
    "password_confirm": "TestPassword123!",
    "role": "PERSONAL",
    "performance": 5
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "icon": "success",
  "data": {
    "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "PERSONAL",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### 2. Login with Email & Password

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "icon": "success",
  "data": {
    "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "username": "testuser@example.com",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "PERSONAL",
    "is_active": true,
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

**Save tokens for next requests:**

```bash
export ACCESS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
export REFRESH_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

---

### 3. Get Current User Details

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "icon": "success",
  "data": {
    "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "testuser@example.com",
    "username": "testuser@example.com",
    "name": "Test User",
    "role": "PERSONAL",
    "is_active": true,
    "performance": 5
  }
}
```

---

### 4. Change Password

```bash
curl -X POST http://localhost:8000/api/users/change-password/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "old_password": "TestPassword123!",
    "new_password": "NewPassword456!",
    "new_password_confirm": "NewPassword456!"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "icon": "success"
}
```

---

### 5. Refresh Access Token

```bash
curl -X POST http://localhost:8000/api/users/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "'$REFRESH_TOKEN'"
  }'
```

**Expected Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### 6. Logout

```bash
curl -X POST http://localhost:8000/api/users/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "refresh": "'$REFRESH_TOKEN'"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Logout successful",
  "icon": "success"
}
```

---

## Testing Script (Bash)

Create a file `test_auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api/users"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "🔐 Starting Authentication Tests..."
echo ""

# 1. Register
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "name": "Test User",
    "password": "'$PASSWORD'",
    "password_confirm": "'$PASSWORD'",
    "role": "PERSONAL"
  }')

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Registration failed"
  echo $REGISTER_RESPONSE
  exit 1
fi

echo "✅ Registration successful"
echo "   Email: $EMAIL"
echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# 2. Get User Details
echo "2️⃣  Testing Get User Details..."
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/me/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $USER_RESPONSE | grep -q '"success":true'; then
  echo "✅ Get user details successful"
  echo $USER_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4
else
  echo "❌ Get user details failed"
fi
echo ""

# 3. Login
echo "3️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

if echo $LOGIN_RESPONSE | grep -q '"success":true'; then
  echo "✅ Login successful"
else
  echo "❌ Login failed"
fi
echo ""

# 4. Change Password
echo "4️⃣  Testing Change Password..."
NEW_PASSWORD="NewPassword456!"
CHANGE_RESPONSE=$(curl -s -X POST "$BASE_URL/change-password/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "old_password": "'$PASSWORD'",
    "new_password": "'$NEW_PASSWORD'",
    "new_password_confirm": "'$NEW_PASSWORD'"
  }')

if echo $CHANGE_RESPONSE | grep -q '"success":true'; then
  echo "✅ Change password successful"
  PASSWORD=$NEW_PASSWORD
else
  echo "❌ Change password failed"
fi
echo ""

# 5. Refresh Token
echo "5️⃣  Testing Refresh Token..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh/" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "'$REFRESH_TOKEN'"
  }')

if echo $REFRESH_RESPONSE | grep -q '"access"'; then
  NEW_ACCESS=$(echo $REFRESH_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)
  echo "✅ Token refresh successful"
  echo "   New Access Token: ${NEW_ACCESS:0:20}..."
  ACCESS_TOKEN=$NEW_ACCESS
else
  echo "❌ Token refresh failed"
fi
echo ""

# 6. Logout
echo "6️⃣  Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "refresh": "'$REFRESH_TOKEN'"
  }')

if echo $LOGOUT_RESPONSE | grep -q '"success":true'; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
fi
echo ""

echo "🎉 All tests completed!"
```

**Run the script:**

```bash
chmod +x test_auth.sh
./test_auth.sh
```

---

## Testing with Postman

### Setup Postman Environment

1. **Create New Environment**
   - Name: "EV Analytics Dev"
   - Add variables:
     - `base_url`: http://localhost:8000/api/users
     - `access_token`: (empty initially)
     - `refresh_token`: (empty initially)

### Postman Requests

#### 1. Register

```
Method: POST
URL: {{base_url}}/register/
Headers:
  Content-Type: application/json

Body (raw):
{
  "email": "postman_test@example.com",
  "name": "Postman Test User",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!",
  "role": "PERSONAL"
}

Pre-request Script:
// None

Tests:
var jsonData = pm.response.json();
if (jsonData.success) {
  pm.environment.set("access_token", jsonData.data.access);
  pm.environment.set("refresh_token", jsonData.data.refresh);
  pm.test("Registration successful", () => {
    pm.expect(jsonData.success).to.be.true;
  });
}
```

#### 2. Login

```
Method: POST
URL: {{base_url}}/login/
Headers:
  Content-Type: application/json

Body (raw):
{
  "email": "postman_test@example.com",
  "password": "TestPass123!"
}

Tests:
var jsonData = pm.response.json();
if (jsonData.success) {
  pm.environment.set("access_token", jsonData.data.access);
  pm.environment.set("refresh_token", jsonData.data.refresh);
  pm.test("Login successful", () => {
    pm.expect(jsonData.success).to.be.true;
  });
}
```

#### 3. Get User Details

```
Method: GET
URL: {{base_url}}/me/
Headers:
  Authorization: Bearer {{access_token}}

Tests:
pm.test("Get user details successful", () => {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.data.email).to.exist;
});
```

#### 4. Change Password

```
Method: POST
URL: {{base_url}}/change-password/
Headers:
  Authorization: Bearer {{access_token}}
  Content-Type: application/json

Body (raw):
{
  "old_password": "TestPass123!",
  "new_password": "NewPass456!",
  "new_password_confirm": "NewPass456!"
}

Tests:
pm.test("Password changed successfully", () => {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
});
```

#### 5. Refresh Token

```
Method: POST
URL: {{base_url}}/refresh/
Headers:
  Content-Type: application/json

Body (raw):
{
  "refresh": "{{refresh_token}}"
}

Tests:
var jsonData = pm.response.json();
pm.environment.set("access_token", jsonData.access);
pm.test("Token refreshed successfully", () => {
  pm.expect(jsonData.access).to.exist;
});
```

#### 6. Logout

```
Method: POST
URL: {{base_url}}/logout/
Headers:
  Authorization: Bearer {{access_token}}
  Content-Type: application/json

Body (raw):
{
  "refresh": "{{refresh_token}}"
}

Tests:
pm.test("Logout successful", () => {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
});
```

---

## Error Test Cases

### Test Invalid Email

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password"
  }'
```

Expected: 401 Unauthorized

### Test Invalid Password

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "wrongpassword"
  }'
```

Expected: 401 Unauthorized

### Test Duplicate Email

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "name": "Test",
    "password": "Pass123!",
    "password_confirm": "Pass123!"
  }'
```

Expected: 400 Bad Request (email already registered)

### Test Password Mismatch

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "name": "Test",
    "password": "Pass123!",
    "password_confirm": "DifferentPass123!"
  }'
```

Expected: 400 Bad Request (passwords do not match)

### Test Missing Authorization

```bash
curl -X GET http://localhost:8000/api/users/me/
```

Expected: 401 Unauthorized (no token)

---

## Troubleshooting

### Token Expired Error

```json
{
  "detail": "Token is invalid or expired"
}
```

**Solution**: Use refresh token to get new access token

### Invalid Email or Password

```json
{
  "success": false,
  "errors": {
    "non_field_errors": ["Invalid email or password"]
  }
}
```

**Solution**: Verify email and password are correct

### Account Deactivated

```json
{
  "success": false,
  "errors": {
    "non_field_errors": ["Account is deactivated"]
  }
}
```

**Solution**: Contact admin to reactivate account

### Weak Password

```json
{
  "success": false,
  "errors": {
    "password": ["Password is too common"]
  }
}
```

**Solution**: Use stronger password (8+ chars, mix of types)

---

**Status**: ✅ Ready to Test
**Last Updated**: February 25, 2026
