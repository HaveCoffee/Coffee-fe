#!/bin/bash
# API Testing with havecoffee.in domain
JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNTUzZWZlYjdiZjIzMTlhNThjMmIwZTZlZmY0MjhiMCIsImlhdCI6MTc2ODc2MTM2NSwiZXhwIjoxNzY4OTM0MTY1fQ.p2YNcNer28OtbudObM3EOznJDd-UDsQmteSxbYuv3Ng"
USER_ID="f553efeb7bf2319a58c2b0e6eff428b0"

echo "🧪 Testing APIs with havecoffee.in domain"
echo "========================================="
echo ""

# Test 1: Auth Login Init
echo "1️⃣ Auth Login Init"
curl -s -X POST "http://havecoffee.in:3000/api/auth/login/init" \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9589074989"}' \
  -w "\nStatus: %{http_code}\n"
echo "---"

# Test 2: Coffee-ML Profile
echo ""
echo "2️⃣ Coffee-ML Get Profile"
curl -s -X GET "http://havecoffee.in:8000/api/profile" \
  -H "Authorization: Bearer $JWT" \
  -w "\nStatus: %{http_code}\n"
echo "---"

# Test 3: Coffee-ML Matches
echo ""
echo "3️⃣ Coffee-ML Get Matches"
curl -s -X GET "http://havecoffee.in:8000/api/matches/suggested" \
  -H "Authorization: Bearer $JWT" \
  -w "\nStatus: %{http_code}\n"
echo "---"

# Test 4: Chat Conversations
echo ""
echo "4️⃣ Chat Get Conversations"
curl -s -X GET "http://havecoffee.in:3001/api/v1/conversations" \
  -H "Authorization: Bearer $JWT" \
  -w "\nStatus: %{http_code}\n"
echo "---"

echo ""
echo "✅ Test complete!"
