# Card Payment Integration Guide

## ✅ What's Been Added

### 1. PayMongoService Enhancements
- **Updated `createPaymentIntent()`** - Now supports card, GCash, and PayMaya
- **Added `createCardPaymentMethod()`** - Creates payment method with card details
- Both methods handle 3D Secure authentication automatically

### 2. CardPayment Component
- **Location**: `src/components/CardPayment.jsx`
- **Features**:
  - Card number formatting (auto-adds spaces)
  - Real-time validation
  - Cardholder name input
  - Expiry date (MM/YYYY)
  - CVC/CVV input
  - 3D Secure support
  - Secure processing through PayMongo
  - Loading states and error handling

## 🎯 How to Use

### In Your Checkout Page

```jsx
import CardPayment from '../components/CardPayment';
import GCashPayment from '../components/GCashPayment';

// In your component
const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'gcash', 'card'

// Payment method selector
<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
  <option value="cod">Cash on Delivery</option>
  <option value="gcash">GCash</option>
  <option value="card">Credit/Debit Card</option>
</select>

// Conditional rendering
{paymentMethod === 'card' && (
  <CardPayment 
    orderData={{
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
      userEmail: user.email,
      userPhone: user.phone,
      shippingAddress: {
        street: address.street,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code
      }
    }}
    onSuccess={(paymentIntent) => {
      console.log('Payment successful!', paymentIntent);
      // Navigate to success page or update order
    }}
    onCancel={() => setPaymentMethod('cod')}
  />
)}

{paymentMethod === 'gcash' && (
  <GCashPayment 
    orderData={...}
    onSuccess={...}
    onCancel={...}
  />
)}
```

## 🔐 Security Features

1. **3D Secure Authentication** - Automatically handled for eligible cards
2. **PCI Compliance** - Card data goes directly to PayMongo (never stored on your server)
3. **Encrypted Transmission** - All data sent over HTTPS
4. **Tokenization** - Card details converted to secure tokens

## 📋 Supported Cards

- **Visa** ✅
- **Mastercard** ✅
- **JCB** ✅
- **American Express** ✅ (if enabled in PayMongo dashboard)

## 💳 Payment Flow

1. Customer enters card details
2. Card validation (client-side)
3. Payment Intent created
4. Payment Method created with card details
5. Payment Method attached to Intent
6. 3D Secure authentication (if required)
7. Payment processed
8. Customer redirected to success page

## ⚙️ Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
VITE_PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

## 🧪 Testing Cards

PayMongo provides test cards for development:

**Successful Payment:**
- Card: `4343 4343 4343 4345`
- Expiry: Any future date
- CVC: Any 3 digits

**Failed Payment:**
- Card: `4571 7360 0000 0183`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure Authentication:**
- Card: `4120 0000 0000 0007`
- Expiry: Any future date
- CVC: Any 3 digits
- OTP: `123456`

## 🎨 Customization

### Styling
The component uses Tailwind CSS. You can customize colors and layout by editing `CardPayment.jsx`.

### Validation
Card validation happens in `validateCard()` function. You can add additional rules if needed.

### Error Messages
All error messages are customizable in the component state.

## 📊 Admin Side

The stock deduction system already handles card payments:
- Stock deducts when payment status becomes "paid"
- Works the same as GCash payments
- Order auto-confirms on successful payment

## 🚀 Next Steps

1. **Test the integration** with PayMongo test cards
2. **Style the payment selector** in your checkout page
3. **Handle payment success** - Update order status, send confirmation email
4. **Handle payment failure** - Show error, allow retry
5. **Add payment history** - Track all card transactions

## 🔗 Useful Links

- [PayMongo Documentation](https://developers.paymongo.com/docs)
- [PayMongo Dashboard](https://dashboard.paymongo.com/)
- [Test Cards](https://developers.paymongo.com/docs/testing)

## ⚠️ Important Notes

- Always use test keys in development
- Enable live mode in PayMongo dashboard before going production
- Comply with PCI DSS requirements
- Never log or store raw card numbers
- Test 3D Secure flow thoroughly

## 🆘 Troubleshooting

**Error: "Failed to create payment intent"**
- Check if PAYMONGO_SECRET_KEY is set correctly
- Verify amount is at least ₱20.00

**Error: "Failed to create payment method"**
- Check if PAYMONGO_PUBLIC_KEY is set correctly
- Verify card number format (15-16 digits)

**3D Secure not working**
- Check return_url is correct
- Test with 3DS test card (4120 0000 0000 0007)

**Payment succeeds but order not updating**
- Check webhook configuration in PayMongo dashboard
- Verify payment status handling in your backend
