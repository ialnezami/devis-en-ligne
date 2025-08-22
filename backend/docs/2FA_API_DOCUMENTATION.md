# Two-Factor Authentication API Documentation

## Overview

This document describes the Two-Factor Authentication (2FA) API endpoints for the Online Quotation Tool. The 2FA system implements TOTP (Time-based One-Time Password) using the industry-standard RFC 6238 specification.

## Features

- **TOTP Generation**: Secure time-based one-time password generation
- **QR Code Generation**: Easy setup with authenticator apps
- **Backup Codes**: 10 recovery codes for emergency access
- **Recovery System**: Account recovery for lost 2FA devices
- **Admin Controls**: Emergency 2FA disable for administrators

## Authentication

All 2FA endpoints require JWT authentication except for recovery endpoints. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. 2FA Setup

#### Generate 2FA Secret
```http
POST /auth/2fa/setup/generate
```

Generates a new TOTP secret and QR code for setting up 2FA.

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": ["ABC12345", "DEF67890", "GHI11111", ...],
  "message": "Scan the QR code with your authenticator app and verify with the 6-digit code"
}
```

#### Enable 2FA
```http
POST /auth/2fa/setup/enable
```

Enables 2FA after verifying the TOTP code from the authenticator app.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication has been enabled successfully",
  "backupCodes": ["ABC12345", "DEF67890", "GHI11111", ...]
}
```

### 2. 2FA Verification

#### Verify 2FA Code
```http
POST /auth/2fa/verify
```

Verifies a 2FA code during login or other operations.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "verified": true,
  "usedBackupCode": false
}
```

#### Verify 2FA with Backup Code
```http
POST /auth/2fa/verify
```

Use a backup code instead of TOTP code.

**Request Body:**
```json
{
  "code": "123456",
  "backupCode": "ABC12345"
}
```

**Response:**
```json
{
  "verified": true,
  "usedBackupCode": true
}
```

### 3. 2FA Management

#### Get 2FA Status
```http
GET /auth/2fa/status
```

Returns the current 2FA status for the authenticated user.

**Response:**
```json
{
  "enabled": true,
  "backupCodesCount": 8
}
```

#### Disable 2FA
```http
POST /auth/2fa/disable
```

Disables 2FA for the authenticated user.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication has been disabled successfully"
}
```

#### Regenerate Backup Codes
```http
POST /auth/2fa/backup-codes/regenerate
```

Generates new backup codes for the authenticated user.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Backup codes have been regenerated successfully",
  "backupCodes": ["XYZ98765", "WVU43210", "TSR55555", ...]
}
```

### 4. Recovery System

#### Initiate Recovery
```http
POST /auth/recovery/initiate
```

Starts the recovery process for users who lost access to 2FA.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Recovery email sent successfully"
}
```

#### Verify Recovery Token
```http
POST /auth/recovery/verify/{token}
```

Completes the recovery process by verifying the recovery token.

**Response:**
```json
{
  "message": "Two-factor authentication has been disabled. You can now log in with just your password.",
  "userId": "user-uuid"
}
```

### 5. Admin Endpoints

#### Check Backup Codes Status
```http
GET /auth/recovery/backup-codes-status/{userId}
```

**Required Role:** Admin

Checks the backup codes status for a specific user.

**Response:**
```json
{
  "hasBackupCodes": true,
  "remainingCodes": 5,
  "shouldRegenerate": true
}
```

#### Emergency Disable 2FA
```http
POST /auth/recovery/emergency-disable/{userId}
```

**Required Role:** Admin

Emergency disables 2FA for a user.

**Request Body:**
```json
{
  "reason": "User lost device and cannot access backup codes"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication has been emergency disabled by administrator",
  "reason": "User lost device and cannot access backup codes",
  "adminEmail": "admin@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Get Recovery Statistics
```http
GET /auth/recovery/stats
```

**Required Role:** Admin

Returns recovery statistics for the admin dashboard.

**Response:**
```json
{
  "totalActiveUsers": 150,
  "usersWith2FA": 45,
  "usersWithBackupCodes": 42,
  "recoveryRate": 93.33
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "2FA is already enabled for this user",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid 2FA code",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "error": "Forbidden"
}
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on 2FA endpoints to prevent brute force attacks
2. **Session Management**: 2FA verification should be tied to specific sessions
3. **Backup Code Security**: Backup codes should be hashed and single-use
4. **Recovery Process**: Recovery tokens should have short expiration times
5. **Audit Logging**: All 2FA operations should be logged for security monitoring

## Implementation Notes

- Uses the `speakeasy` library for TOTP generation and verification
- QR codes are generated using the `qrcode` library
- Backup codes are 8-character alphanumeric strings
- TOTP codes are 6-digit numbers with 30-second validity
- Recovery tokens expire after 24 hours
- All sensitive data is excluded from API responses

## Testing

Test the 2FA system using authenticator apps like:
- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password

## Support

For issues with the 2FA system, contact the system administrator or use the recovery process if you've lost access to your authenticator device.
