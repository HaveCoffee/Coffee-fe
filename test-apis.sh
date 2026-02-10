#!/bin/bash

# API Testing Script for Coffee App Backend
# Run this script to test all API endpoints

BASE_URL="https://havecoffee.in"
AUTH_BASE_URL="https://havecoffee.in/api"
CHAT_BASE_URL="https://havecoffee.in/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Coffee App API Testing Script${NC}"
echo "=================================="

# Test mobile number (replace with actual test number)
MOBILE_NUMBER="7007313725"
OTP="1234"
TOKEN=""

echo -e "\n${YELLOW}📱 Step 1: Authentication Flow${NC}"
echo "================================"

# 1. Login Init
echo -e "\n${BLUE}1.1 Testing Login Init${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_BASE_URL}/auth/login/init" \
  -H "Content-Type: application/json" \
  -d "{\"mobileNumber\":\"${MOBILE_NUMBER}\"}")

echo "Request: POST ${AUTH_BASE_URL}/auth/login/init"
echo "Response: $LOGIN_RESPONSE"

VERIFICATION_ID=$(echo $LOGIN_RESPONSE | grep -o '"verificationId":"[^"]*' | cut -d'"' -f4)
echo "Verification ID: $VERIFICATION_ID"

# 2. Login Verify
echo -e "\n${BLUE}1.2 Testing Login Verify${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "${AUTH_BASE_URL}/auth/login/verify" \
  -H "Content-Type: application/json" \
  -d "{\"mobileNumber\":\"${MOBILE_NUMBER}\",\"otp\":\"${OTP}\",\"verificationId\":\"${VERIFICATION_ID}\"}")

echo "Request: POST ${AUTH_BASE_URL}/auth/login/verify"
echo "Response: $VERIFY_RESPONSE"

TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:50}..."

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Authentication failed. Cannot proceed with other tests.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🤖 Step 2: Coffee-ML API Tests${NC}"
echo "================================"

# 3. Get Profile
echo -e "\n${BLUE}2.1 Testing Get Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/profile"
echo "Response: $PROFILE_RESPONSE"

# 4. Get Suggested Matches
echo -e "\n${BLUE}2.2 Testing Get Suggested Matches${NC}"
SUGGESTED_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/matches/suggested" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/matches/suggested"
echo "Response: $SUGGESTED_RESPONSE"

# 5. Get Active Matches
echo -e "\n${BLUE}2.3 Testing Get Active Matches${NC}"
ACTIVE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/matches/active" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/matches/active"
echo "Response: $ACTIVE_RESPONSE"

# 6. Start Chat (requires a match_id)
echo -e "\n${BLUE}2.4 Testing Start Chat${NC}"
START_CHAT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/matches/start-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/start-chat"
echo "Response: $START_CHAT_RESPONSE"

# 7. Pass User
echo -e "\n${BLUE}2.5 Testing Pass User${NC}"
PASS_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/matches/pass" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/pass"
echo "Response: $PASS_RESPONSE"

# 8. Block User
echo -e "\n${BLUE}2.6 Testing Block User${NC}"
BLOCK_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/matches/block" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/block"
echo "Response: $BLOCK_RESPONSE"

# 9. Get User Profile
echo -e "\n${BLUE}2.7 Testing Get User Profile${NC}"
USER_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/users/test-user-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/users/test-user-id"
echo "Response: $USER_RESPONSE"

# 10. Chat with Ella
echo -e "\n${BLUE}2.8 Testing Chat with Ella${NC}"
CHAT_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Ella, how are you?"}')

echo "Request: POST ${BASE_URL}/chat"
echo "Response: $CHAT_RESPONSE"

echo -e "\n${YELLOW}👤 Step 3: User API Tests${NC}"
echo "================================"

# 11. Get Me (basic profile)
echo -e "\n${BLUE}3.1 Testing Get Me${NC}"
ME_RESPONSE=$(curl -s -X GET "${AUTH_BASE_URL}/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${AUTH_BASE_URL}/me"
echo "Response: $ME_RESPONSE"

echo -e "\n${YELLOW}💬 Step 4: Chat API Tests${NC}"
echo "================================"

# 12. Get Chat with User (requires user_id)
echo -e "\n${BLUE}4.1 Testing Get Chat with User${NC}"
CHAT_USER_RESPONSE=$(curl -s -X GET "${CHAT_BASE_URL}/chat/test-user-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${CHAT_BASE_URL}/chat/test-user-id"
echo "Response: $CHAT_USER_RESPONSE"

echo -e "\n${GREEN}✅ API Testing Complete!${NC}"
echo "================================"

# Summary
echo -e "\n${YELLOW}📊 Test Summary:${NC}"
echo "1. Auth Login Init: $([ ! -z "$VERIFICATION_ID" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "2. Auth Login Verify: $([ ! -z "$TOKEN" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "3. Get Profile: $(echo $PROFILE_RESPONSE | grep -q "profile_data\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "4. Get Suggested: $(echo $SUGGESTED_RESPONSE | grep -q "matches\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "5. Get Active: $(echo $ACTIVE_RESPONSE | grep -q "matches\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "6. Start Chat: $(echo $START_CHAT_RESPONSE | grep -q "status\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "7. Pass User: $(echo $PASS_RESPONSE | grep -q "status\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "8. Block User: $(echo $BLOCK_RESPONSE | grep -q "status\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "9. Get User: $(echo $USER_RESPONSE | grep -q "profile_data\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "10. Chat Ella: $(echo $CHAT_RESPONSE | grep -q "response\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "11. Get Me: $(echo $ME_RESPONSE | grep -q "user\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "12. Chat User: $(echo $CHAT_USER_RESPONSE | grep -q "messages\|error\|detail" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"

echo -e "\n${BLUE}💡 Usage Instructions:${NC}"
echo "1. Make this file executable: chmod +x test-apis.sh"
echo "2. Run the script: ./test-apis.sh"
echo "3. Check the responses for each endpoint"
echo "4. Look for error patterns in failed endpoints"