# Firebase Cloud Messaging Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in the Online Quotation Tool.

## Prerequisites

- Google account
- Firebase project
- Node.js application

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "online-quotation-tool")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Cloud Messaging

1. In your Firebase project, go to "Project settings" (gear icon)
2. Click on the "Cloud Messaging" tab
3. Note your **Project ID** (you'll need this later)
4. Click "Generate new private key" to download your service account key

## Step 3: Configure Service Account

1. Download the service account key JSON file
2. Open the file and note the following values:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 4: Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content\n-----END PRIVATE KEY-----"

# Optional Firebase Settings
FIREBASE_LOG_LEVEL=info
FIREBASE_MOCK_RESPONSES=false
FIREBASE_TEST_TOKENS=token1,token2,token3
FIREBASE_TEST_TOPICS=test,development
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` should include the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- Use double quotes around the private key value
- The private key contains newlines represented as `\n`

## Step 5: Install Dependencies

Install the required Firebase packages:

```bash
npm install firebase-admin
npm install @nestjs/bull bull
```

## Step 6: Configure Firebase Admin SDK

The Firebase Admin SDK is automatically initialized in the `PushNotificationService`. The service will:

1. Read environment variables
2. Initialize the Firebase app
3. Set up messaging capabilities
4. Handle authentication automatically

## Step 7: Client-Side Setup

### Web (React)

1. Install Firebase client SDK:
```bash
npm install firebase
```

2. Create Firebase configuration file (`src/firebase/config.js`):
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

3. Request notification permission and get token:
```javascript
import { getToken, onMessage } from './firebase/config';

// Request permission
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key'
      });
      
      // Send token to your backend
      await registerDeviceToken(token);
    }
  } catch (error) {
    console.error('Failed to get notification permission:', error);
  }
};

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  // Show notification or update UI
});
```

### Android (React Native)

1. Install Firebase React Native SDK:
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

2. Configure Android project:
   - Add `google-services.json` to `android/app/`
   - Update `android/build.gradle`
   - Update `android/app/build.gradle`

3. Request permission and get token:
```javascript
import messaging from '@react-native-firebase/messaging';

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    // Send token to your backend
    await registerDeviceToken(token);
  }
};

// Handle foreground messages
const unsubscribe = messaging().onMessage(async remoteMessage => {
  console.log('Message received:', remoteMessage);
  // Show notification or update UI
});
```

### iOS (React Native)

1. Install Firebase React Native SDK:
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

2. Configure iOS project:
   - Add `GoogleService-Info.plist` to iOS project
   - Update `ios/Podfile`
   - Configure capabilities in Xcode

3. Request permission and get token:
```javascript
import messaging from '@react-native-firebase/messaging';

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    // Send token to your backend
    await registerDeviceToken(token);
  }
};

// Handle foreground messages
const unsubscribe = messaging().onMessage(async remoteMessage => {
  console.log('Message received:', remoteMessage);
  // Show notification or update UI
});
```

## Step 8: Backend Integration

### Register Device Token

Send a POST request to register a device token:

```bash
POST /push-notifications/devices/register
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "userId": "user-id",
  "companyId": "company-id",
  "token": "firebase-device-token",
  "platform": "web",
  "deviceId": "unique-device-id",
  "deviceName": "Chrome Browser",
  "appVersion": "1.0.0",
  "osVersion": "Windows 10"
}
```

### Send Push Notification

Send a POST request to send a push notification:

```bash
POST /push-notifications/send
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "tokens": ["device-token-1", "device-token-2"],
  "options": {
    "title": "New Quotation",
    "body": "You have a new quotation request",
    "data": {
      "quotationId": "123",
      "type": "new"
    },
    "priority": "high"
  }
}
```

### Schedule Notification

Send a POST request to schedule a notification:

```bash
POST /push-notifications/schedule
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "templateId": "template-id",
  "recipients": ["user-id-1", "user-id-2"],
  "scheduledAt": "2024-01-15T10:00:00Z",
  "timezone": "UTC",
  "repeat": "daily",
  "repeatConfig": {
    "interval": 1,
    "endDate": "2024-01-31T10:00:00Z"
  }
}
```

## Step 9: Testing

### Test with Firebase Console

1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Fill in notification details
4. Select target (topic, user segment, or specific devices)
5. Send the message

### Test with Your API

1. Register a test device token
2. Send a test notification using your API
3. Verify the notification appears on the device

### Test Notifications

```bash
# Test device registration
curl -X POST http://localhost:3000/push-notifications/devices/register \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "companyId": "test-company",
    "token": "test-token",
    "platform": "web",
    "deviceId": "test-device"
  }'

# Test sending notification
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["test-token"],
    "options": {
      "title": "Test Notification",
      "body": "This is a test notification"
    }
  }'
```

## Step 10: Monitoring and Analytics

### Firebase Console

- **Analytics**: View notification performance
- **Crashlytics**: Monitor app crashes
- **Performance**: Track notification delivery times

### Your Backend

- **Logs**: Check application logs for errors
- **Statistics**: Use `/push-notifications/stats` endpoint
- **Device Management**: Monitor device token registrations

## Troubleshooting

### Common Issues

1. **Invalid Private Key**
   - Ensure the private key includes the full PEM format
   - Check for proper escaping of newlines

2. **Permission Denied**
   - Verify the service account has the necessary permissions
   - Check if Cloud Messaging API is enabled

3. **Token Not Received**
   - Verify client-side permission request
   - Check browser/device notification settings
   - Ensure proper Firebase configuration

4. **Notifications Not Delivered**
   - Check device token validity
   - Verify notification payload format
   - Check rate limiting settings

### Debug Mode

Enable debug logging by setting:

```bash
FIREBASE_LOG_LEVEL=debug
```

### Test Mode

Enable test mode for development:

```bash
FIREBASE_MOCK_RESPONSES=true
```

## Security Considerations

1. **Service Account Key**
   - Keep the private key secure
   - Never commit to version control
   - Use environment variables

2. **Token Validation**
   - Validate device tokens on the backend
   - Implement rate limiting
   - Monitor for suspicious activity

3. **User Privacy**
   - Request explicit permission
   - Allow users to opt out
   - Provide clear privacy policy

## Performance Optimization

1. **Batch Notifications**
   - Use `sendToMultipleDevices` for multiple recipients
   - Implement proper queuing for large batches

2. **Token Management**
   - Regularly clean up invalid tokens
   - Implement token refresh mechanisms
   - Monitor token usage patterns

3. **Rate Limiting**
   - Respect Firebase rate limits
   - Implement exponential backoff
   - Queue notifications when limits are reached

## Next Steps

1. **Customize Templates**: Create notification templates for different use cases
2. **Implement Topics**: Use topics for targeted notifications
3. **Add Analytics**: Track notification engagement and performance
4. **A/B Testing**: Test different notification strategies
5. **User Preferences**: Allow users to customize notification settings

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [NestJS Documentation](https://docs.nestjs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
