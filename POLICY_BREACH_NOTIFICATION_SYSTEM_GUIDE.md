# Policy & Data Breach Notification System - Complete Guide

## 🎯 Overview

This comprehensive notification system ensures GDPR Article 34 and CCPA compliance by automatically notifying users of:
- Privacy Policy changes
- Terms of Service updates  
- Data breach incidents
- Security incidents

## 📋 Compliance Requirements Met

### GDPR Compliance
- ✅ **Article 34**: Data breach notification to users within 72 hours
- ✅ **Articles 13-14**: Transparency obligations for data processing changes
- ✅ **Article 7**: Records of consent (policy acceptances tracked)

### CCPA Compliance
- ✅ **§1798.100**: Notice of data collection practices and policy changes
- ✅ **§1798.150**: Breach notification requirements

## 🗄️ Database Schema

### Tables Created

#### 1. `policy_versions`
Tracks all versions of privacy policies and terms of service.

```sql
- id (uuid, primary key)
- policy_type (text: 'privacy_policy' or 'terms_of_service')
- version (text: e.g., '2.0', '3.1')
- title (text)
- summary (text: brief summary of changes)
- content (text: full policy content)
- changes_from_previous (text: list of changes)
- effective_date (timestamp)
- status (text: 'draft', 'published')
- published_at (timestamp)
- notification_sent (boolean)
- notification_sent_at (timestamp)
```

#### 2. `user_policy_acceptances`
Records when users accept policy versions.

```sql
- id (uuid, primary key)
- user_id (uuid, references users)
- policy_version_id (uuid, references policy_versions)
- accepted_at (timestamp)
- ip_address (text)
- user_agent (text)
```

#### 3. `data_breach_incidents`
Manages data breach tracking and reporting.

```sql
- id (uuid, primary key)
- incident_number (text, unique: 'INC-12345678')
- title (text)
- description (text)
- severity (text: 'low', 'medium', 'high', 'critical')
- breach_date (timestamp: when breach occurred)
- discovered_date (timestamp: when discovered)
- contained_date (timestamp: when contained)
- data_types_affected (text[]: array of data types)
- affected_users_count (integer)
- mitigation_steps (text)
- user_actions_required (text)
- users_notified (boolean)
- notification_sent_at (timestamp)
- notification_method (text: 'email', 'in_app', 'both')
- support_contact (text: email for user questions)
- status (text: 'investigating', 'contained', 'resolved')
```

#### 4. `security_incident_notifications`
Individual breach notifications sent to users.

```sql
- id (uuid, primary key)
- incident_id (uuid, references data_breach_incidents)
- user_id (uuid, references users)
- notification_type (text: 'data_breach', 'security_incident')
- subject (text)
- message (text)
- severity (text)
- email_sent (boolean)
- email_sent_at (timestamp)
- in_app_read (boolean)
- in_app_read_at (timestamp)
- delivery_method (text: 'email', 'in_app', 'both')
```

#### 5. `policy_change_notifications`
Individual policy change notifications sent to users.

```sql
- id (uuid, primary key)
- policy_version_id (uuid, references policy_versions)
- user_id (uuid, references users)
- subject (text)
- message (text)
- changes_summary (text)
- email_sent (boolean)
- email_sent_at (timestamp)
- in_app_read (boolean)
- in_app_read_at (timestamp)
- delivery_method (text: 'email', 'in_app', 'both')
```

## 🔧 Services

### PolicyBreachNotificationService

**Location:** `src/services/PolicyBreachNotificationService.js`

#### Key Methods

##### Policy Change Notifications

```javascript
// Send policy change notifications to all users who haven't accepted the new version
await PolicyBreachNotificationService.notifyPolicyChange(policyVersionId);

// Returns: { total, sent, failed, errors }
```

##### Data Breach Notifications

```javascript
// Send breach notifications to all affected users
await PolicyBreachNotificationService.notifyDataBreach(incidentId);

// Returns: { total, sent, failed, errors }
```

##### Get Unread Notifications

```javascript
// Get unread policy notifications
const policyNotifications = await PolicyBreachNotificationService.getUnreadPolicyNotifications(userId);

// Get unread security notifications
const securityNotifications = await PolicyBreachNotificationService.getUnreadSecurityNotifications(userId);
```

##### Mark as Read

```javascript
// Mark policy notification as read
await PolicyBreachNotificationService.markNotificationAsRead(notificationId, 'policy');

// Mark security notification as read
await PolicyBreachNotificationService.markNotificationAsRead(notificationId, 'security');
```

### Email Integration (Resend API)

The service automatically sends HTML emails via Resend API for:
- Policy changes
- Data breaches

**Email Templates Include:**
- Professional HTML styling
- Clear incident/policy details
- Action buttons linking to relevant pages
- Support contact information
- Compliance footer with unsubscribe info

## 🎨 Admin Interface Components

### PolicyVersionManagement.jsx

**Location:** `EGIE-Ecommerce-Admin/src/components/PolicyVersionManagement.jsx`

**Features:**
- Create new policy versions
- Edit draft policies
- Publish policies
- Send notifications to users
- Track notification status

**Usage:**
1. Click "Create New Version"
2. Fill in policy details:
   - Policy Type (Privacy Policy or Terms of Service)
   - Version number
   - Title
   - Summary of changes
   - Full content
   - Effective date
3. Save as draft
4. Review and publish
5. Send notifications to users

### BreachIncidentManagement.jsx

**Location:** `EGIE-Ecommerce-Admin/src/components/BreachIncidentManagement.jsx`

**Features:**
- Report new security incidents
- Track breach details
- Manage incident status
- Send breach notifications
- Monitor affected users

**Usage:**
1. Click "Report New Incident"
2. Fill in breach details:
   - Title and description
   - Severity (low, medium, high, critical)
   - Breach date and discovery date
   - Data types affected
   - Affected users count
   - Mitigation steps
   - Actions required from users
3. Save incident
4. Send notifications (MUST be within 72 hours per GDPR)
5. Mark as contained when resolved

## 🔐 User Notification Preferences

Users can control which notifications they receive in Settings > Notifications:

```javascript
notification_preferences table:
- email_privacy_policy_updates (boolean)
- email_tos_updates (boolean)
- email_data_breach (boolean)
- email_security_incidents (boolean)
```

**Note:** Data breach notifications CANNOT be disabled (legal requirement).

## 📧 Email Templates

### Policy Change Email
- Subject: "Important: [Policy Type] Update - Action Required"
- Includes:
  - Personalized greeting
  - Summary of changes
  - Effective date
  - Link to review updated policy
  - Acceptance information
  - Support contact

### Data Breach Email
- Subject: "🚨 URGENT: Security Incident Notification"
- Includes:
  - Incident number and severity
  - Breach description
  - Data types affected
  - Timeline (breach, discovery, containment)
  - Mitigation steps taken
  - Actions required from user
  - Security recommendations
  - Support contact
  - **Cannot be unsubscribed** (legal requirement)

## 🚀 Setup Instructions

### 1. Run Database Migration

```sql
-- Execute the SQL file in Supabase SQL Editor
-- File: CREATE_POLICY_AND_BREACH_NOTIFICATION_SYSTEM.sql
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Resend API Configuration
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_NOTIFICATION_FROM_EMAIL=notifications@yourdomain.com
VITE_SUPPORT_EMAIL=support@yourdomain.com
VITE_WEBSITE_URL=https://yourdomain.com
```

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Generate API key
4. Add to environment variables

### 4. Add Admin Routes

In your admin dashboard router, add:

```javascript
import PolicyVersionManagement from './components/PolicyVersionManagement';
import BreachIncidentManagement from './components/BreachIncidentManagement';

// In your routes:
{
  path: '/compliance/policies',
  element: <PolicyVersionManagement />
},
{
  path: '/compliance/breaches',
  element: <BreachIncidentManagement />
}
```

### 5. Update Admin Navigation

Add to admin navigation menu:

```javascript
{
  title: 'Policy Management',
  icon: <PolicyIcon />,
  path: '/compliance/policies'
},
{
  title: 'Breach Incidents',
  icon: <SecurityIcon />,
  path: '/compliance/breaches'
}
```

## 📊 Workflow Examples

### Policy Update Workflow

1. **Create New Version**
   - Admin creates policy version 2.0
   - Status: Draft

2. **Review and Publish**
   - Legal team reviews
   - Admin publishes policy
   - Status: Published

3. **Notify Users**
   - Admin clicks "Send Notifications"
   - System queries users who haven't accepted v2.0
   - Checks user notification preferences
   - Sends emails + creates in-app notifications
   - Tracks delivery status

4. **User Acceptance**
   - User logs in
   - Sees notification badge
   - Reviews policy
   - Continues using service (implicit acceptance)
   - OR explicitly accepts via checkbox
   - Record saved in `user_policy_acceptances`

### Data Breach Workflow

1. **Breach Detected**
   - Security team detects breach
   - Admin reports incident
   - Incident #INC-12345678 created

2. **Investigation**
   - Status: Investigating
   - Determine scope and affected users
   - Document data types affected
   - Identify mitigation steps

3. **Containment**
   - Breach contained
   - Status: Contained
   - Update containment date

4. **Notification (within 72 hours)**
   - Admin clicks "Notify Users"
   - System sends emails to ALL affected users
   - Ignores preference settings (legal requirement)
   - Creates in-app notifications
   - Logs all notifications

5. **Resolution**
   - Continue monitoring
   - Status: Resolved
   - Archive incident

## 🔍 Audit Trail

All notifications are logged via `ThirdPartyAuditService` for compliance audits:

```javascript
// Policy change email logged as:
{
  service: 'resend',
  action: 'send_email',
  metadata: {
    type: 'policy_change',
    policyType: 'privacy_policy',
    version: '2.0'
  }
}

// Breach notification logged as:
{
  service: 'resend',
  action: 'send_email',
  metadata: {
    type: 'data_breach',
    incidentNumber: 'INC-12345678',
    severity: 'high'
  }
}
```

## 📈 RPC Functions

### get_users_for_policy_notification

Returns users who need policy change notification (haven't accepted the new version).

```sql
SELECT get_users_for_policy_notification(
  'privacy_policy',  -- p_policy_type
  'policy-version-id' -- p_policy_version_id
);
```

### get_users_for_breach_notification

Returns users affected by a specific breach incident.

```sql
SELECT get_users_for_breach_notification('incident-id');
```

### mark_policy_notification_read

Marks a policy notification as read.

```sql
SELECT mark_policy_notification_read('notification-id');
```

### mark_security_notification_read

Marks a security notification as read.

```sql
SELECT mark_security_notification_read('notification-id');
```

## ⚠️ Important Notes

### Legal Requirements

1. **72-Hour Rule**: GDPR requires breach notification within 72 hours of discovery
2. **Cannot Opt Out**: Users cannot disable data breach notifications
3. **Record Keeping**: All notifications must be logged for audit purposes
4. **Content Requirements**: Breach notifications must include:
   - Nature of the breach
   - Data types affected
   - Likely consequences
   - Measures taken
   - Contact information

### Best Practices

1. **Test Email Delivery**: Test with a small group before mass notifications
2. **Verify Domain**: Ensure your domain is verified with Resend
3. **Monitor Failures**: Check notification results for failed deliveries
4. **Update Promptly**: Send breach notifications as soon as possible
5. **Clear Communication**: Use plain language, avoid legal jargon
6. **Provide Support**: Include clear support contact information

## 🧪 Testing

### Test Policy Notification

1. Create test policy version
2. Have test user account
3. Send notification
4. Verify:
   - Email received
   - In-app notification visible
   - Audit log entry created
   - Notification preferences honored

### Test Breach Notification

1. Create test incident
2. Mark user as affected (if filtering logic exists)
3. Send notification
4. Verify:
   - Email received (regardless of preferences)
   - Severity displayed correctly
   - Incident details accurate
   - Support contact included

## 📝 Summary

This notification system provides:

✅ **Complete GDPR/CCPA compliance** for transparency obligations
✅ **Automated email notifications** via Resend API
✅ **In-app notification delivery** for user awareness
✅ **User preference management** (except breach notifications)
✅ **Comprehensive audit trail** for compliance reporting
✅ **Admin management tools** for policies and incidents
✅ **HTML email templates** with professional styling
✅ **Tracking and reporting** for all notifications sent

Your e-commerce platform now has enterprise-grade notification and transparency capabilities that meet international data protection standards! 🎉
