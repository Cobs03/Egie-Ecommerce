# Dynamic Notification System - Implementation Guide

## Overview
The notification system is now fully dynamic and integrated with Supabase. Each user receives personalized notifications for:
- **Order Updates**: Automatic notifications when order status changes
- **Promotions**: Manual notifications sent by admins for discounts, vouchers, and promotions

## Database Setup

### 1. Run the SQL Script
Execute `CREATE_NOTIFICATION_SYSTEM.sql` in your Supabase SQL Editor:
```bash
Location: Egie-Ecommerce-Admin/database/CREATE_NOTIFICATION_SYSTEM.sql
```

This creates:
- `user_notifications` table
- Trigger function for automatic order notifications
- Functions for manual promotion notifications
- RLS policies for security

## Features Implemented

### 1. Automatic Order Notifications ✅
When an order status changes, customers automatically receive notifications:

| Order Status | Notification Title | Trigger |
|--------------|-------------------|---------|
| `pending` | Order Placed | Order created |
| `confirmed` | Order Confirmed | Status → confirmed |
| `processing` | Order Processing | Status → processing |
| `shipped` | Order Shipped | Status → shipped |
| `ready_for_pickup` | Ready for Pickup | Status → ready_for_pickup |
| `delivered` | Package Delivered | Status → delivered |
| `cancelled` | Order Cancelled | Status → cancelled |

**Notification Content Includes:**
- Order number (e.g., EGIE-20251116-75839)
- Status-specific message
- Product images (up to 4)
- Courier name (for shipped orders)
- Cancellation reason (if cancelled)

### 2. Notification Tabs 📑
Two separate tabs in the notification page:

**Order Updates Tab:**
- Shows order status changes
- Includes product images
- Click to view order tracking
- Auto-mark as read when clicked

**Promotions Tab:**
- Shows discount announcements
- Shows voucher codes
- Special offers
- "Copy Code" or "View Products" buttons

### 3. Real-time Badge Count 🔴
The notification bell icon shows:
- Red badge with unread count
- Updates in real-time
- Separate counts for order updates and promotions
- Badge disappears when all read

### 4. Smart Notification Actions 🎯
Each notification can have actions:
- **view_order**: Navigate to order tracking page
- **view_products**: Navigate to product category
- **copy_code**: Copy voucher/discount code

## How to Send Promotion Notifications (Admin)

### Method 1: Using Supabase SQL Editor

```sql
-- Send to ALL customers
SELECT create_promotion_notification(
  'Summer Sale',
  'Use the code SUMMER25 for a 25% discount on all accessories',
  NULL,  -- voucher_id (if applicable)
  NULL,  -- discount_id (if applicable)
  'copy_code',
  '{"code": "SUMMER25", "discount": "25%"}'::jsonb,
  'all'
);

-- Send to NEW users only (registered in last 30 days)
SELECT create_promotion_notification(
  'Welcome Discount',
  'Use the code NEW20 for 20% off your first purchase!',
  NULL,
  NULL,
  'copy_code',
  '{"code": "NEW20"}'::jsonb,
  'new'
);

-- Send to EXISTING customers (have placed orders)
SELECT create_promotion_notification(
  'Loyalty Reward',
  'Thank you for being a loyal customer! Enjoy 30% off',
  NULL,
  NULL,
  'view_products',
  '{"category": "laptops"}'::jsonb,
  'existing'
);
```

### Method 2: Using Frontend (To Be Implemented)

Create an admin panel page with a form:

```jsx
// Example admin component
<form onSubmit={handleSendNotification}>
  <input name="title" placeholder="Notification Title" />
  <textarea name="message" placeholder="Message" />
  <select name="targetUsers">
    <option value="all">All Customers</option>
    <option value="new">New Users</option>
    <option value="existing">Existing Customers</option>
  </select>
  <button type="submit">Send Notification</button>
</form>
```

## API Functions Available

### Frontend (Customer)

```javascript
import NotificationService from './services/NotificationService';

// Get all notifications
const { data, error } = await NotificationService.getUserNotifications();

// Get order updates only
const { data, error } = await NotificationService.getUserNotifications('order_update');

// Get promotions only
const { data, error } = await NotificationService.getUserNotifications('promotion');

// Get unread count
const { count } = await NotificationService.getUnreadCount();

// Mark as read
await NotificationService.markAsRead(notificationId);

// Mark all as read
await NotificationService.markAllAsRead('order_update');

// Subscribe to real-time updates
const subscription = NotificationService.subscribeToNotifications((payload) => {
  console.log('New notification:', payload);
  // Refresh notifications
});
```

### Backend (Admin)

```javascript
// Send promotion notification
const { count } = await NotificationService.sendPromotionNotification({
  title: 'Flash Sale!',
  message: 'Get 50% off on gaming peripherals this weekend only',
  actionType: 'view_products',
  actionData: { category: 'peripherals' },
  targetUsers: 'all'
});

console.log(`Notification sent to ${count} users`);
```

## Database Functions

### Available Functions

1. **`get_user_notifications(p_user_id, p_category, p_is_read, p_limit)`**
   - Fetches user notifications with filters
   - Returns: Array of notifications

2. **`get_unread_notification_count(p_user_id, p_category)`**
   - Gets count of unread notifications
   - Returns: Integer

3. **`mark_notification_as_read(p_notification_id, p_user_id)`**
   - Marks single notification as read
   - Returns: Boolean

4. **`mark_all_notifications_as_read(p_user_id, p_category)`**
   - Marks all notifications as read
   - Returns: Integer (count of marked)

5. **`create_promotion_notification(...)`**
   - Sends promotion to target users
   - Returns: Integer (count sent)

## Security

### RLS Policies Enabled ✅
- Users can only see their own notifications
- Users can only mark their own notifications as read
- Admins can view all notifications
- System can create notifications via triggers

### Permission Levels
- **Customer**: View/update own notifications
- **Admin**: View all notifications, send promotions
- **System**: Auto-create order notifications

## Real-time Updates

Notifications update in real-time using Supabase Realtime:
- New order placed → Notification appears instantly
- Admin sends promotion → All users receive immediately
- Notification marked as read → Badge count updates

## Testing Checklist

### Customer Side
- [ ] Place an order → Check "Order Placed" notification
- [ ] Order confirmed by admin → Check "Order Confirmed" notification
- [ ] Order shipped → Check "Order Shipped" notification with courier
- [ ] Order delivered → Check "Package Delivered" notification
- [ ] Click notification → Navigate to order tracking
- [ ] Mark as read → Badge count decreases
- [ ] Mark all as read → All marked, badge disappears

### Admin Side
- [ ] Send promotion to all users → Verify all receive
- [ ] Send to new users only → Verify targeting works
- [ ] Send to existing customers → Verify targeting works
- [ ] Include voucher code → Verify copy button works
- [ ] Include product link → Verify navigation works

## Troubleshooting

### Notifications not appearing?
1. Check if SQL script was executed
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Verify user is authenticated

### Badge count not updating?
1. Check if NotificationService is imported in Navbar
2. Verify real-time subscription is active
3. Check Supabase Realtime is enabled
4. Clear browser cache

### Order notifications not auto-creating?
1. Verify trigger is created: `trigger_order_notification`
2. Check order_items table has product images
3. Verify order status is changing
4. Check Supabase logs for trigger errors

## Future Enhancements

### Planned Features
- Email notifications (send email when order ships)
- Push notifications (browser notifications)
- Notification preferences (user can disable certain types)
- Notification history archive
- Admin dashboard for notification analytics
- Scheduled notifications
- Notification templates

### Admin Panel Features
- Visual notification creator UI
- Preview before sending
- Schedule notifications for later
- Target specific user segments
- A/B test different messages
- View delivery stats

## Examples

### Example: New Discount Notification
```sql
SELECT create_promotion_notification(
  'New Discounts',
  'Use the code 11111 for a 20% discount',
  NULL,
  NULL,
  'copy_code',
  '{"code": "11111"}'::jsonb,
  'all'
);
```

### Example: Summer Sale Notification
```sql
SELECT create_promotion_notification(
  'Summer Sale',
  'Use the code SUMMER25 for a 25% discount on all accessories',
  NULL,
  NULL,
  'view_products',
  '{"category": "accessories"}'::jsonb,
  'all'
);
```

### Example: Back to School Notification
```sql
SELECT create_promotion_notification(
  'Back to School',
  'Use the code BTS30 for 30% off on laptops and tablets',
  NULL,
  NULL,
  'view_products',
  '{"category": "laptops"}'::jsonb,
  'all'
);
```

## Summary

✅ **Implemented:**
- Dynamic notification system
- Two-tab interface (Order Updates & Promotions)
- Real-time badge count
- Auto-notifications on order status change
- Manual promotion notifications
- RLS security
- Real-time updates
- Action buttons (view order, copy code)

🔄 **Next Steps:**
1. Run SQL script in Supabase
2. Test order flow
3. Send test promotion
4. Build admin notification panel (optional)
5. Add email notifications (optional)

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify SQL script execution
3. Check browser console
4. Review RLS policies
5. Test with different user roles
