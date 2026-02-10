#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNTUzZWZlYjdiZjIzMTlhNThjMmIwZTZlZmY0MjhiMCIsImlhdCI6MTc2ODc2MTM2NSwiZXhwIjoxNzY4OTM0MTY1fQ.p2YNcNer28OtbudObM3EOznJDd-UDsQmteSxbYuv3Ng"
USER_ID="f553efeb7bf2319a58c2b0e6eff428b0"

echo "🧪 Coffee-ML API Tests"
echo "======================"

echo ""
echo "1️⃣ Get Own Profile"
curl -s "http://havecoffee.in:8000/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo "2️⃣ Get Public Profile"
curl -s "http://havecoffee.in:8000/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo "3️⃣ Get Suggested Matches"
curl -s "http://havecoffee.in:8000/api/matches/suggested" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo "4️⃣ Get Active Chats"
curl -s "http://havecoffee.in:8000/api/matches/active" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo "5️⃣ Start Chat"
curl -s -X POST "http://havecoffee.in:8000/api/matches/start-chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test123"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "6️⃣ Pass User"
curl -s -X POST "http://havecoffee.in:8000/api/matches/pass" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test123"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "7️⃣ Block User"
curl -s -X POST "http://havecoffee.in:8000/api/matches/block" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"match_id":"test123"}' \
  -w "\nStatus: %{http_code}\n\n"
