# Individual CURL Commands for Coffee App API Testing
# Replace TOKEN with actual JWT token from login

# ==========================================
# 1. AUTHENTICATION APIs
# ==========================================

# Login Init
curl -X POST "https://havecoffee.in/api/auth/login/init" \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"7007313725"}'

# Login Verify (replace VERIFICATION_ID with response from init)
curl -X POST "https://havecoffee.in/api/auth/login/verify" \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"7007313725","otp":"1234","verificationId":"VERIFICATION_ID"}'

# ==========================================
# 2. COFFEE-ML APIs (Profile & Matches)
# ==========================================

# Get Own Profile
curl -X GET "https://havecoffee.in/api/profile" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# Get Suggested Matches
curl -X GET "https://havecoffee.in/api/matches/suggested" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# Get Active Matches
curl -X GET "https://havecoffee.in/api/matches/active" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# Start Chat with Match
curl -X POST "https://havecoffee.in/api/matches/start-chat" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"USER_ID_HERE"}'

# Pass User
curl -X POST "https://havecoffee.in/api/matches/pass" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"USER_ID_HERE"}'

# Block User
curl -X POST "https://havecoffee.in/api/matches/block" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"USER_ID_HERE"}'

# Get Public User Profile
curl -X GET "https://havecoffee.in/api/users/USER_ID_HERE" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# ==========================================
# 3. ELLA CHAT API (Coffee-ML)
# ==========================================

# Chat with Ella (AI Assistant)
curl -X POST "https://havecoffee.in/chat" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Ella, I want to build my profile"}'

# Chat with Ella (with thread_id for continuation)
curl -X POST "https://havecoffee.in/chat" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me more about coffee","thread_id":"THREAD_ID_HERE"}'

# ==========================================
# 4. USER PROFILE API
# ==========================================

# Get Basic User Info (/me endpoint)
curl -X GET "https://havecoffee.in/api/me" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# ==========================================
# 5. USER-TO-USER CHAT API
# ==========================================

# Get Chat Messages with Specific User
curl -X GET "https://havecoffee.in/api/v1/chat/USER_ID_HERE" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# Send Message to Specific User
curl -X POST "https://havecoffee.in/api/v1/chat/USER_ID_HERE" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Would you like to meet for coffee?"}'

# ==========================================
# TESTING WORKFLOW:
# ==========================================

# Step 1: Get authentication token
# 1. Run login/init to get verification_id
# 2. Run login/verify to get JWT token
# 3. Copy the token for use in other requests

# Step 2: Test profile and matches
# 4. Test /api/profile to see if user has completed onboarding
# 5. Test /api/matches/suggested to get potential matches
# 6. Test /api/matches/active to get current conversations

# Step 3: Test chat functionality
# 7. Test /chat for Ella AI chat
# 8. Test /api/v1/chat/{user_id} for user-to-user chat

# Step 4: Test user actions
# 9. Test start-chat, pass, block actions
# 10. Test getting other user profiles

# ==========================================
# EXPECTED RESPONSES:
# ==========================================

# Success responses should contain:
# - /api/profile: {"user_id": "...", "profile_data": {...}}
# - /api/matches/suggested: {"matches": [...]}
# - /api/matches/active: {"matches": [...]}
# - /chat: {"response": "...", "thread_id": "..."}
# - /api/me: {"user": {...}}

# Error responses will contain:
# - {"detail": "error message"}
# - {"message": "error message"}
# - {"error": "error message"}