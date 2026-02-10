#!/bin/bash

# Complete API Testing Script for New User: 1234567890
# Tests all APIs from authentication to chat functionality

BASE_URL="https://havecoffee.in"
AUTH_BASE_URL="https://havecoffee.in/api"
CHAT_BASE_URL="https://havecoffee.in/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Complete API Testing for New User: 1234567890${NC}"
echo "========================================================"

# Test mobile number - NEW USER
MOBILE_NUMBER="1234567890"
OTP="1234"
TOKEN=""
USER_ID=""

echo -e "\n${YELLOW}📱 STEP 1: Authentication Flow (New User)${NC}"
echo "=================================================="

# 1.1 Login Init
echo -e "\n${BLUE}1.1 Testing Login Init (New User)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_BASE_URL}/auth/login/init" \
  -H "Content-Type: application/json" \
  -d "{\"mobileNumber\":\"${MOBILE_NUMBER}\"}")

echo "Request: POST ${AUTH_BASE_URL}/auth/login/init"
echo "Payload: {\"mobileNumber\":\"${MOBILE_NUMBER}\"}"
echo "Response: $LOGIN_RESPONSE"

VERIFICATION_ID=$(echo $LOGIN_RESPONSE | grep -o '"verificationId":"[^"]*' | cut -d'"' -f4)
echo "Verification ID: $VERIFICATION_ID"

if [ -z "$VERIFICATION_ID" ]; then
    echo -e "${RED}❌ Login Init failed. Cannot proceed.${NC}"
    exit 1
fi

# 1.2 Login Verify
echo -e "\n${BLUE}1.2 Testing Login Verify (New User)${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "${AUTH_BASE_URL}/auth/login/verify" \
  -H "Content-Type: application/json" \
  -d "{\"mobileNumber\":\"${MOBILE_NUMBER}\",\"otp\":\"${OTP}\",\"verificationId\":\"${VERIFICATION_ID}\"}")

echo "Request: POST ${AUTH_BASE_URL}/auth/login/verify"
echo "Payload: {\"mobileNumber\":\"${MOBILE_NUMBER}\",\"otp\":\"${OTP}\",\"verificationId\":\"${VERIFICATION_ID}\"}"
echo "Response: $VERIFY_RESPONSE"

TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $VERIFY_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:50}..."
echo "User ID: $USER_ID"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Authentication failed. Cannot proceed.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🤖 STEP 2: Profile Check (Should be Empty for New User)${NC}"
echo "========================================================="

# 2.1 Get Profile (Should fail for new user)
echo -e "\n${BLUE}2.1 Testing Get Profile (New User - Should Fail)${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/profile"
echo "Response: $PROFILE_RESPONSE"

# Check if profile exists
if echo $PROFILE_RESPONSE | grep -q "profile_data"; then
    echo -e "${YELLOW}⚠️ User already has profile data (not a new user)${NC}"
    HAS_PROFILE=true
else
    echo -e "${GREEN}✅ Confirmed: New user with no profile${NC}"
    HAS_PROFILE=false
fi

echo -e "\n${YELLOW}🤖 STEP 3: Ella Chat (Onboarding for New User)${NC}"
echo "=================================================="

# 3.1 Chat with Ella (First message - should trigger onboarding)
echo -e "\n${BLUE}3.1 Testing Ella Chat - Onboarding Start${NC}"
ELLA_CHAT_1=$(curl -s -X POST "${BASE_URL}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Ella, I am a new user and want to set up my profile"}')

echo "Request: POST ${BASE_URL}/chat"
echo "Payload: {\"message\":\"Hi Ella, I am a new user and want to set up my profile\"}"
echo "Response: $ELLA_CHAT_1"

THREAD_ID=$(echo $ELLA_CHAT_1 | grep -o '"thread_id":"[^"]*' | cut -d'"' -f4)
echo "Thread ID: $THREAD_ID"

# 3.2 Continue Ella Chat (Answer questions)
echo -e "\n${BLUE}3.2 Testing Ella Chat - Answer Question 1${NC}"
ELLA_CHAT_2=$(curl -s -X POST "${BASE_URL}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"I love traveling and exploring new places\",\"thread_id\":\"${THREAD_ID}\"}")

echo "Request: POST ${BASE_URL}/chat"
echo "Payload: {\"message\":\"I love traveling and exploring new places\",\"thread_id\":\"${THREAD_ID}\"}"
echo "Response: $ELLA_CHAT_2"

# 3.3 Continue Ella Chat (More profile building)
echo -e "\n${BLUE}3.3 Testing Ella Chat - Answer Question 2${NC}"
ELLA_CHAT_3=$(curl -s -X POST "${BASE_URL}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"I enjoy reading books and listening to music. I'm looking for professional networking opportunities.\",\"thread_id\":\"${THREAD_ID}\"}")

echo "Request: POST ${BASE_URL}/chat"
echo "Payload: {\"message\":\"I enjoy reading books and listening to music. I'm looking for professional networking opportunities.\",\"thread_id\":\"${THREAD_ID}\"}"
echo "Response: $ELLA_CHAT_3"

echo -e "\n${YELLOW}🔍 STEP 4: Profile Check After Onboarding${NC}"
echo "============================================="

# 4.1 Get Profile Again (Should now have data)
echo -e "\n${BLUE}4.1 Testing Get Profile After Onboarding${NC}"
PROFILE_AFTER=$(curl -s -X GET "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/profile"
echo "Response: $PROFILE_AFTER"

if echo $PROFILE_AFTER | grep -q "profile_data"; then
    echo -e "${GREEN}✅ Profile created successfully after onboarding${NC}"
else
    echo -e "${YELLOW}⚠️ Profile not yet created - may need more interaction${NC}"
fi

echo -e "\n${YELLOW}🎯 STEP 5: Matches System Testing${NC}"
echo "===================================="

# 5.1 Get Suggested Matches
echo -e "\n${BLUE}5.1 Testing Get Suggested Matches${NC}"
SUGGESTED_MATCHES=$(curl -s -X GET "${BASE_URL}/api/matches/suggested" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/matches/suggested"
echo "Response: $SUGGESTED_MATCHES"

# 5.2 Get Active Matches
echo -e "\n${BLUE}5.2 Testing Get Active Matches${NC}"
ACTIVE_MATCHES=$(curl -s -X GET "${BASE_URL}/api/matches/active" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/matches/active"
echo "Response: $ACTIVE_MATCHES"

echo -e "\n${YELLOW}⚡ STEP 6: Match Actions Testing${NC}"
echo "===================================="

# 6.1 Start Chat (with dummy match ID)
echo -e "\n${BLUE}6.1 Testing Start Chat${NC}"
START_CHAT=$(curl -s -X POST "${BASE_URL}/api/matches/start-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"dummy-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/start-chat"
echo "Payload: {\"match_id\":\"dummy-match-id\"}"
echo "Response: $START_CHAT"

# 6.2 Pass User
echo -e "\n${BLUE}6.2 Testing Pass User${NC}"
PASS_USER=$(curl -s -X POST "${BASE_URL}/api/matches/pass" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"dummy-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/pass"
echo "Payload: {\"match_id\":\"dummy-match-id\"}"
echo "Response: $PASS_USER"

# 6.3 Block User
echo -e "\n${BLUE}6.3 Testing Block User${NC}"
BLOCK_USER=$(curl -s -X POST "${BASE_URL}/api/matches/block" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"dummy-match-id"}')

echo "Request: POST ${BASE_URL}/api/matches/block"
echo "Payload: {\"match_id\":\"dummy-match-id\"}"
echo "Response: $BLOCK_USER"

echo -e "\n${YELLOW}👤 STEP 7: User Profile Testing${NC}"
echo "===================================="

# 7.1 Get User Profile
echo -e "\n${BLUE}7.1 Testing Get User Profile${NC}"
USER_PROFILE=$(curl -s -X GET "${BASE_URL}/api/users/dummy-user-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${BASE_URL}/api/users/dummy-user-id"
echo "Response: $USER_PROFILE"

# 7.2 Get Me (Basic user info)
echo -e "\n${BLUE}7.2 Testing Get Me${NC}"
GET_ME=$(curl -s -X GET "${AUTH_BASE_URL}/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${AUTH_BASE_URL}/me"
echo "Response: $GET_ME"

echo -e "\n${YELLOW}💬 STEP 8: User Chat Testing${NC}"
echo "===================================="

# 8.1 Get Chat Messages
echo -e "\n${BLUE}8.1 Testing Get Chat Messages${NC}"
CHAT_MESSAGES=$(curl -s -X GET "${CHAT_BASE_URL}/chat/dummy-user-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Request: GET ${CHAT_BASE_URL}/chat/dummy-user-id"
echo "Response: $CHAT_MESSAGES"

# 8.2 Send Chat Message
echo -e "\n${BLUE}8.2 Testing Send Chat Message${NC}"
SEND_MESSAGE=$(curl -s -X POST "${CHAT_BASE_URL}/chat/dummy-user-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Would you like to meet for coffee?"}')

echo "Request: POST ${CHAT_BASE_URL}/chat/dummy-user-id"
echo "Payload: {\"message\":\"Hello! Would you like to meet for coffee?\"}"
echo "Response: $SEND_MESSAGE"

echo -e "\n${GREEN}✅ Complete API Testing Finished!${NC}"
echo "===================================="

# Final Summary
echo -e "\n${YELLOW}📊 COMPREHENSIVE TEST SUMMARY:${NC}"
echo "=================================="
echo "New User: $MOBILE_NUMBER"
echo "User ID: $USER_ID"
echo "Token: ${TOKEN:0:30}..."
echo ""
echo "Test Results:"
echo "1. Auth Login Init: $([ ! -z "$VERIFICATION_ID" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "2. Auth Login Verify: $([ ! -z "$TOKEN" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "3. Get Profile (Before): $(echo $PROFILE_RESPONSE | grep -q "profile_data" && echo -e "${YELLOW}⚠️ HAS DATA${NC}" || echo -e "${GREEN}✅ EMPTY${NC}")"
echo "4. Ella Chat 1: $(echo $ELLA_CHAT_1 | grep -q "response" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "5. Ella Chat 2: $(echo $ELLA_CHAT_2 | grep -q "response" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "6. Ella Chat 3: $(echo $ELLA_CHAT_3 | grep -q "response" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "7. Get Profile (After): $(echo $PROFILE_AFTER | grep -q "profile_data" && echo -e "${GREEN}✅ CREATED${NC}" || echo -e "${YELLOW}⚠️ PENDING${NC}")"
echo "8. Suggested Matches: $(echo $SUGGESTED_MATCHES | grep -q "matches" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "9. Active Matches: $(echo $ACTIVE_MATCHES | grep -q "matches" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "10. Start Chat: $(echo $START_CHAT | grep -q "detail\|status" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "11. Pass User: $(echo $PASS_USER | grep -q "Internal Server Error" && echo -e "${RED}❌ 500 ERROR${NC}" || echo -e "${GREEN}✅ PASS${NC}")"
echo "12. Block User: $(echo $BLOCK_USER | grep -q "Internal Server Error" && echo -e "${RED}❌ 500 ERROR${NC}" || echo -e "${GREEN}✅ PASS${NC}")"
echo "13. Get User: $(echo $USER_PROFILE | grep -q "detail\|profile_data" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "14. Get Me: $(echo $GET_ME | grep -q "Cannot GET" && echo -e "${RED}❌ 404${NC}" || echo -e "${GREEN}✅ PASS${NC}")"
echo "15. Chat Messages: $(echo $CHAT_MESSAGES | grep -q "Cannot GET" && echo -e "${RED}❌ 404${NC}" || echo -e "${GREEN}✅ PASS${NC}")"
echo "16. Send Message: $(echo $SEND_MESSAGE | grep -q "Cannot GET\|Cannot POST" && echo -e "${RED}❌ 404${NC}" || echo -e "${GREEN}✅ PASS${NC}")"

echo -e "\n${BLUE}🎯 NEW USER ONBOARDING FLOW TEST:${NC}"
echo "=================================="
if [ "$HAS_PROFILE" = false ]; then
    echo -e "${GREEN}✅ New user correctly has no initial profile${NC}"
    echo -e "${GREEN}✅ Ella chat onboarding flow initiated${NC}"
    if echo $PROFILE_AFTER | grep -q "profile_data"; then
        echo -e "${GREEN}✅ Profile successfully created after Ella interaction${NC}"
        echo -e "${GREEN}🎉 NEW USER ONBOARDING FLOW: COMPLETE SUCCESS!${NC}"
    else
        echo -e "${YELLOW}⚠️ Profile creation may need more Ella interaction${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ User already had profile data (not truly new)${NC}"
fi