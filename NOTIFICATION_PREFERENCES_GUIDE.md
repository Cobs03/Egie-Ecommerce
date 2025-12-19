# Notification Preferences Implementation

## Overview
Users can now control which notifications they want to receive through the Settings page. Preferences are stored in the database and can be used to filter which users receive specific types of notifications.

## Features Implemented

### 1. **Notification Types**

**Email Notifications:**
- ✅ Order Updates - Notifications about order status changes
- ✅ Promotions & Deals - Marketing emails about sales
- ✅ Stock Alerts - Alerts when wishlist items are back in stock

**Push Notifications:**
- ✅ Order Updates - Browser/app push notifications for orders
- ✅ Promotions & Deals - Push notifications about sales

### 2. **User Interface**
- Toggle switches for each notification type
- Real-time toggle updates
- Save button to persist changes to database
- Loading state while saving
- Success/error toast notifications

### 3. **Database Storage**
Preferences are stored in the `profiles` table as a JSONB column:

```json
{
  "email_order_updates": true,
  "email_promotions": true,
  "email_stock_alerts": false,
  "push_order_updates": true,
  "push_promotions": false
}
```

## Setup Instructions

### 1. Run Database Migration
Execute the SQL file in Supabase:
```sql
-- File: database/ADD_NOTIFICATION_PREFERENCES.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_order_updates": true,
  "email_promotions": true,
  "email_stock_alerts": false,
  "push_order_updates": true,
  "push_promotions": false
}'::jsonb;
```

### 2. Test the Feature
1. Go to **Settings** → **Notifications** tab
2. Toggle any notification preference on/off
3. Click "Save Preferences"
4. Verify toast notification appears
5. Refresh page and verify settings are persisted

## Usage in Your System

### When Sending Order Update Emails

Before sending an order update email, check if the user wants to receive them:

```javascript
// Check if user wants email order updates
const { data: profile } = await supabase
  .from('profiles')
  .select('notification_preferences')
  .eq('id', userId)
  .single();

if (profile?.notification_preferences?.email_order_updates) {
  // Send the email
  await sendOrderUpdateEmail(userEmail, orderDetails);
}
```

### When Sending Promotional Emails

Query only users who opted in for promotions:

```javascript
// Get all users who want promotional emails
const { data: users } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('notification_preferences->>email_promotions', 'true');

// Send promotional email to each user
for (const user of users) {
  await sendPromotionalEmail(user.email, campaignDetails);
}
```

### When Sending Push Notifications

```javascript
// Check if user wants push notifications for orders
const { data: profile } = await supabase
  .from('profiles')
  .select('notification_preferences')
  .eq('id', userId)
  .single();

if (profile?.notification_preferences?.push_order_updates) {
  // Send push notification
  await sendPushNotification(userId, {
    title: 'Order Update',
    body: 'Your order has been shipped!',
    data: { orderId: order.id }
  });
}
```

## Database Queries

### Get Users Who Want Order Updates
```sql
SELECT id, email, notification_preferences 
FROM profiles 
WHERE notification_preferences->>'email_order_updates' = 'true';
```

### Get Users Who Want Promotional Emails
```sql
SELECT id, email, notification_preferences 
FROM profiles 
WHERE notification_preferences->>'email_promotions' = 'true';
```

### Count Users by Preference
```sql
SELECT 
  COUNT(*) FILTER (WHERE notification_preferences->>'email_order_updates' = 'true') as email_orders,
  COUNT(*) FILTER (WHERE notification_preferences->>'email_promotions' = 'true') as email_promos,
  COUNT(*) FILTER (WHERE notification_preferences->>'push_order_updates' = 'true') as push_orders
FROM profiles;
```

## Benefits

✅ **GDPR/Privacy Compliant** - Users control their communication preferences
✅ **Reduced Spam** - Only send emails to users who want them
✅ **Better Engagement** - Users more likely to read notifications they opted into
✅ **Cost Savings** - Fewer unnecessary emails = lower email service costs
✅ **User Satisfaction** - Users appreciate control over notifications

## Future Enhancements

Consider adding these notification types:

- 📧 **Account Security** - Login alerts, password changes
- 📦 **Shipping Updates** - Detailed tracking updates
- 💬 **Review Reminders** - Remind users to review purchased products
- 🎂 **Birthday Offers** - Special birthday discounts
- 🔔 **Price Drop Alerts** - Notify when wishlist items go on sale
- 📱 **SMS Notifications** - Text message notifications

## Testing Checklist

- [x] Migration runs successfully
- [x] Default preferences are set for new users
- [x] Toggle switches work correctly
- [x] Save button updates database
- [x] Settings persist after page refresh
- [x] Loading state shows while saving
- [x] Success toast appears after saving
- [x] Error handling works if save fails

## Troubleshooting

**Issue: Preferences not saving**
- Check if migration ran successfully
- Verify user is logged in (check `user.id`)
- Check browser console for errors
- Verify RLS policies allow updates to profiles table

**Issue: Preferences reset after refresh**
- Verify `loadNotificationPreferences()` is called on mount
- Check if JSONB column exists in database
- Verify data is actually being saved (check in Supabase dashboard)

**Issue: Toggle switches not responding**
- Check if `toggleNotification()` function is working
- Verify state is updating correctly
- Check browser console for React errors
