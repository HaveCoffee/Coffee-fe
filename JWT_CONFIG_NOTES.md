# JWT Configuration Notes

## Issue: 401 Unauthorized Errors

If you're seeing `Could not validate credentials` errors when calling Coffee-ML API endpoints, this indicates a JWT secret mismatch.

## Required Configuration

**Coffee-ML Service expects:**
- JWT_SECRET_KEY: `SUPER_SECRET_KEY_FOR_JWT_SIGNING`
- Token payload must contain: `user_id` (UUID format)
- Algorithm: HS256

**Action Required:**

The Auth Service must use the **same** JWT_SECRET_KEY. Please update the Auth Service environment variables:

```
JWT_SECRET_KEY=SUPER_SECRET_KEY_FOR_JWT_SIGNING
JWT_ALGORITHM=HS256
```

## Token Payload Requirements

The JWT token payload must include:
```json
{
  "user_id": "uuid-string-here",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Verification

After updating the Auth Service configuration:
1. User logs in/signs up → receives JWT token
2. Token is used for Coffee-ML API calls
3. Coffee-ML validates token using shared secret
4. If validation succeeds, API calls work correctly

## Debugging

The app logs JWT token payload (decoded client-side) to help debug:
- Check console logs for `[JWT] 🔍 Token payload decoded`
- Verify `user_id` field exists in payload
- Verify token is being sent in `Authorization: Bearer <token>` header
