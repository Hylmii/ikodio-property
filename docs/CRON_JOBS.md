# Cron Jobs Configuration

This document explains the automated cron jobs setup in the Ikodio Property application.

## Overview

The application uses Vercel Cron Jobs to run automated tasks at scheduled intervals. All cron jobs are secured with a CRON_SECRET to prevent unauthorized access.

## Cron Jobs List

### 1. Auto-Cancel Expired Bookings
- **Path**: `/api/cron/auto-cancel`
- **Schedule**: `*/30 * * * *` (Every 30 minutes)
- **Purpose**: Automatically cancel bookings that haven't received payment within the deadline
- **Process**:
  1. Find bookings with status WAITING_PAYMENT
  2. Check if paymentDeadline has passed
  3. Cancel expired bookings
  4. Update booking status to CANCELLED

### 2. Check-in Reminder (Old)
- **Path**: `/api/cron/checkin-reminder`
- **Schedule**: `0 8 * * *` (Daily at 8:00 AM)
- **Purpose**: Legacy check-in reminder (to be deprecated)
- **Note**: This is the old implementation

### 3. Check-in Reminder (New)
- **Path**: `/api/cron/check-in-reminder`
- **Schedule**: `0 9 * * *` (Daily at 9:00 AM)
- **Purpose**: Send email reminders to guests one day before check-in (H-1)
- **Process**:
  1. Find all bookings with checkInDate = tomorrow
  2. Filter bookings that haven't received reminder email
  3. Send detailed email with:
     - Booking details (ID, property, room, dates)
     - Check-in information and guidelines
     - Preparation checklist
     - Property contact information
  4. Mark booking as reminderEmailSent = true

## Email Configuration

To send check-in reminder emails, configure the following environment variables:

```bash
# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Gmail Setup

If using Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account → Security
   - Select 2-Step Verification
   - Scroll to "App passwords"
   - Generate new app password
   - Use this password in SMTP_PASSWORD

## Security

All cron jobs require authentication via Bearer token:

```bash
Authorization: Bearer <CRON_SECRET>
```

Set the CRON_SECRET environment variable:

```bash
# Generate secure secret
openssl rand -hex 32

# Add to .env
CRON_SECRET="your-generated-secret"
```

## Vercel Deployment

Cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-cancel",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/check-in-reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Vercel Cron Configuration

1. Deploy to Vercel
2. Go to Project Settings → Cron Jobs
3. Verify scheduled cron jobs are listed
4. Add CRON_SECRET to Environment Variables

## Testing Cron Jobs

### Local Testing

Test cron jobs locally using curl:

```bash
# Test check-in reminder
curl -X GET http://localhost:3000/api/cron/check-in-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Production Testing

```bash
# Test on Vercel
curl -X GET https://your-app.vercel.app/api/cron/check-in-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

Check cron job execution logs in Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to Logs tab
3. Filter by function: `/api/cron/check-in-reminder`
4. Review execution logs, successes, and errors

## Email Template

The check-in reminder email includes:

### Header
- Professional Ikodio Property branding
- Friendly greeting with guest name

### Booking Details Card
- Booking ID
- Property name
- Room name
- Check-in and check-out dates
- Number of guests
- Total amount paid

### Check-in Information
- Standard check-in time (2:00 PM)
- Preparation checklist:
  - Valid ID requirement
  - Booking confirmation
  - Property rules
  - Check-in hours
  - Late arrival contact info

### Property Contact
- Full address (address, city, province)
- Phone number (if available)
- Email address

### Professional Footer
- Ikodio Property branding
- Copyright notice
- Professional styling with slate color scheme

## Database Schema

The check-in reminder requires this field in the Booking model:

```prisma
model Booking {
  // ... other fields
  
  // Email reminder flags
  reminderEmailSent Boolean @default(false)
  
  // ... other fields
}
```

## Error Handling

The cron job includes comprehensive error handling:

- **Unauthorized Access**: Returns 401 if CRON_SECRET is invalid
- **Email Failures**: Logs individual failures but continues processing
- **Database Errors**: Returns 500 with error details
- **Result Summary**: Returns count of successful/failed emails

Example response:

```json
{
  "success": true,
  "message": "Check-in reminder job completed",
  "results": {
    "total": 10,
    "success": 9,
    "failed": 1,
    "errors": [
      "Booking xyz123: SMTP connection timeout"
    ]
  }
}
```

## Maintenance

### Updating Schedule

To change cron job schedule:

1. Update `vercel.json`
2. Commit changes
3. Deploy to Vercel
4. Verify in Vercel Dashboard

### Debugging Email Issues

Common issues:

1. **SMTP Authentication Failed**
   - Verify SMTP_USER and SMTP_PASSWORD
   - Check Gmail app password is correct
   - Enable "Less secure app access" (if using old Gmail)

2. **Emails Not Sending**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall allows SMTP traffic
   - Test SMTP connection manually

3. **Wrong Timing**
   - Verify cron schedule syntax
   - Check server timezone (Vercel uses UTC)
   - Adjust schedule for timezone difference

### Performance Optimization

For high-volume applications:

1. **Batch Processing**: Process reminders in batches
2. **Queue System**: Use message queue for email sending
3. **Rate Limiting**: Implement email rate limiting
4. **Monitoring**: Set up alerts for failures

## Best Practices

1. **Testing**: Always test in staging before production
2. **Monitoring**: Set up error alerts and logging
3. **Security**: Keep CRON_SECRET secure and rotate regularly
4. **Email Content**: Update email templates based on user feedback
5. **Scheduling**: Adjust timing based on user timezone
6. **Error Recovery**: Implement retry logic for failed emails

## Future Improvements

Potential enhancements:

1. **Multi-language Support**: Send emails in user's language
2. **SMS Reminders**: Add SMS option for reminders
3. **Push Notifications**: Mobile app push notifications
4. **Custom Timing**: Allow users to choose reminder time
5. **Multiple Reminders**: H-1, H-3, H-7 reminders
6. **Calendar Integration**: iCal/Google Calendar invites
