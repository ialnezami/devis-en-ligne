# Email Service Setup Guide

This guide explains how to configure the email service for the Online Quotation Tool.

## Environment Variables

Add the following environment variables to your `.env` file:

### SMTP Configuration
```bash
# SMTP Server Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Authentication
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# From Address
EMAIL_FROM=noreply@yourcompany.com
```

### Advanced Configuration
```bash
# TLS Settings
EMAIL_TLS_REJECT_UNAUTHORIZED=true

# Rate Limiting
EMAIL_RATE_LIMIT_MAX_PER_MINUTE=60
EMAIL_RATE_LIMIT_MAX_PER_HOUR=1000
EMAIL_RATE_LIMIT_MAX_PER_DAY=10000

# Queue Settings
EMAIL_QUEUE_MAX_RETRIES=3
EMAIL_QUEUE_RETRY_DELAY=5000
EMAIL_QUEUE_MAX_CONCURRENCY=5

# Tracking
EMAIL_TRACKING_ENABLED=true
EMAIL_PIXEL_TRACKING=true
EMAIL_LINK_TRACKING=true
EMAIL_TRACKING_RETENTION_DAYS=90

# Unsubscribe
EMAIL_UNSUBSCRIBE_ENABLED=true
EMAIL_GLOBAL_UNSUBSCRIBE=true
EMAIL_CATEGORY_UNSUBSCRIBE=true
EMAIL_UNSUBSCRIBE_EMAIL=unsubscribe@yourcompany.com
```

## Popular Email Providers

### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Password, not regular password
```

**Note**: For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password instead of your regular password

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Amazon SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## Testing the Configuration

1. Start the application
2. Check the logs for "Email transporter initialized successfully"
3. Use the health check endpoint: `GET /notifications/email/health`
4. Send a test email using the API

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify username and password
   - For Gmail, ensure you're using an App Password
   - Check if 2FA is enabled (required for Gmail)

2. **Connection Refused**
   - Verify SMTP host and port
   - Check firewall settings
   - Ensure the email provider allows SMTP access

3. **TLS Errors**
   - Set `EMAIL_TLS_REJECT_UNAUTHORIZED=false` for development
   - Verify SSL/TLS settings match your provider

4. **Rate Limiting**
   - Reduce email frequency
   - Check provider-specific limits
   - Implement proper delays between emails

### Security Considerations

1. **Never commit email credentials to version control**
2. **Use environment variables for sensitive data**
3. **Implement proper authentication for email endpoints**
4. **Monitor email usage and implement rate limiting**
5. **Regularly rotate email passwords**

## Email Templates

The system comes with pre-built templates:
- Welcome Email
- Password Reset
- Quotation Created
- Approval Request

### Custom Templates

You can create custom templates via the API:
```bash
POST /notifications/email/templates
{
  "name": "Custom Template",
  "subject": "Subject with {{variable}}",
  "htmlTemplate": "<h1>Hello {{name}}</h1>",
  "textTemplate": "Hello {{name}}",
  "variables": ["name"],
  "category": "custom",
  "isActive": true
}
```

## Monitoring and Analytics

The email service provides:
- Email tracking (opens, clicks)
- Delivery statistics
- Bounce and failure tracking
- Performance metrics

Access via:
- `GET /notifications/email/stats` - Email statistics
- `GET /notifications/email/tracking/:trackingId` - Individual email tracking
- `GET /notifications/email/health` - Service health check

## Queue Management

The email service uses BullMQ for job processing:
- Failed emails are automatically retried
- Configurable retry attempts and delays
- Job monitoring and management
- Rate limiting and concurrency control

## Unsubscribe Management

Users can unsubscribe from:
- All emails (global unsubscribe)
- Specific categories (e.g., marketing, notifications)
- Individual email types

The system automatically respects unsubscribe preferences and provides:
- Unsubscribe endpoints
- Resubscribe functionality
- Unsubscribe list management (admin only)
