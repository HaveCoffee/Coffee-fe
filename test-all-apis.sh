#!/bin/bash
# Complete API Testing Script
# JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNTUzZWZlYjdiZjIzMTlhNThjMmIwZTZlZmY0MjhiMCIsImlhdCI6MTc2ODc2MTM2NSwiZXhwIjoxNzY4OTM0MTY1fQ.p2YNcNer28OtbudObM3EOznJDd-UDsQmteSxbYuv3Ng
# User ID: f553efeb7bf2319a58c2b0e6eff428b0

JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNTUzZWZlYjdiZjIzMTlhNThjMmIwZTZlZmY0MjhiMCIsImlhdCI6MTc2ODc2MTM2NSwiZXhwIjoxNzY4OTM0MTY1fQ.p2YNcNer28OtbudObM3EOznJDd-UDsQmteSxbYuv3Ng"
USER_ID="f553efeb7bf2319a58c2b0e6eff428b0"

echo "========================================="
echo "🧪 COMPLETE API TESTING"
echo "========================================="
echo ""

# ==========================================
# 1. AUTH APIs (Port 80)
# ==========================================
echo "📍 1. TESTING AUTH APIs (Port 80)"
echo "========================================="

echo ""
echo "✅ Auth APIs already tested and working:"
echo "  - POST /api/auth/login/init"
echo "  - POST /api/auth/login/verify"
echo "  - POST /api/auth/signup/init"
echo "  - POST /api/auth/signup/verify"
echo ""

# ==========================================
# 2. COFFEE-ML APIs (Port 8000)
# ==========================================
echo "📍 2. TESTING COFFEE-ML APIs (Port 8000)"
echo "========================================="

echo ""
echo "🔍 Test 1: Get Own Profile"
echo "GET http://3.110.104.45:8000/api/profile"
curl -X GET "http://3.110.104.45:8000/api/profile" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 2: Get Public Profile (with User ID)"
echo "GET http://3.110.104.45:8000/api/users/$USER_ID"
curl -X GET "http://3.110.104.45:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 3: Get Suggested Matches"
echo "GET http://3.110.104.45:8000/api/matches/suggested"
curl -X GET "http://3.110.104.45:8000/api/matches/suggested" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 4: Get Active Chats"
echo "GET http://3.110.104.45:8000/api/matches/active"
curl -X GET "http://3.110.104.45:8000/api/matches/active" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 5: Start Chat"
echo "POST http://3.110.104.45:8000/api/matches/start-chat"
curl -X POST "http://3.110.104.45:8000/api/matches/start-chat" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 6: Pass User"
echo "POST http://3.110.104.45:8000/api/matches/pass"
curl -X POST "http://3.110.104.45:8000/api/matches/pass" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 7: Block User"
echo "POST http://3.110.104.45:8000/api/matches/block"
curl -X POST "http://3.110.104.45:8000/api/matches/block" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

# ==========================================
# 3. CHAT APIs (Port 3001)
# ==========================================
echo ""
echo "📍 3. TESTING CHAT APIs (Port 3001)"
echo "========================================="

echo ""
echo "🔍 Test 8: Get Conversations"
echo "GET http://3.110.104.45:3001/api/v1/conversations"
curl -X GET "http://3.110.104.45:3001/api/v1/conversations" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 9: Get Messages (sample conversation)"
echo "GET http://3.110.104.45:3001/api/v1/conversations/test-123/messages"
curl -X GET "http://3.110.104.45:3001/api/v1/conversations/test-123/messages" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

echo ""
echo "🔍 Test 10: Send Message"
echo "POST http://3.110.104.45:3001/api/v1/messages"
curl -X POST "http://3.110.104.45:3001/api/v1/messages" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-123","content":"Test message","type":"text"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "---"

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
echo ""
echo "JWT Token: Valid until 2026-01-20"
echo "User ID: $USER_ID"
echo ""
echo "Check the HTTP status codes above:"
echo "  - 200: Success ✅"
echo "  - 401: Unauthorized (JWT validation issue) ❌"
echo "  - 404: Not Found (endpoint doesn't exist) ⚠️"
echo "  - 500: Server Error ⚠️"
echo ""
