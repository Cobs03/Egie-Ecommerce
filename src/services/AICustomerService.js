import { supabase } from '../lib/supabase';

class AICustomerService {
  constructor() {
    this.storeSettings = null;
  }

  async loadStoreSettings() {
    if (this.storeSettings) return this.storeSettings;

    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      this.storeSettings = data;
      return data;
    } catch (error) {
      console.error('Error loading store settings:', error);
      return null;
    }
  }

  async getUserOrders(userId, limit = 5) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          status,
          total,
          tracking_number,
          courier_name,
          delivery_type,
          shipping_address_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return {
          type: 'no_orders',
          message: 'You have no orders yet. Start shopping to place your first order!'
        };
      }

      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('product_name, product_image, quantity, unit_price, total')
            .eq('order_id', order.id);

          let shippingAddress = null;
          if (order.shipping_address_id) {
            const { data: address } = await supabase
              .from('shipping_addresses')
              .select('street_address, barangay, city, province, postal_code, full_name, phone')
              .eq('id', order.shipping_address_id)
              .single();
            shippingAddress = address;
          }

          return {
            ...order,
            items: items || [],
            shipping_address: shippingAddress
          };
        })
      );

      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'only', head: true })
        .eq('user_id', userId);

      return {
        type: 'orders_list',
        orders: ordersWithDetails,
        hasMore: count > limit,
        moreCount: Math.max(0, count - limit)
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        type: 'error',
        message: 'Sorry, I could not retrieve your orders at this time. Please try again later.'
      };
    }
  }

  async getOrderByNumber(orderNumber, userId) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          status,
          total,
          subtotal,
          discount,
          shipping_fee,
          tracking_number,
          courier_name,
          delivery_type,
          shipping_address_id,
          payment_method
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .single();

      if (error || !order) {
        return `I could not find order ${orderNumber}. Please check the order number and try again.`;
      }

      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, product_image, quantity, unit_price, total')
        .eq('order_id', order.id);

      let shippingInfo = '';
      if (order.shipping_address_id) {
        const { data: address } = await supabase
          .from('shipping_addresses')
          .select('street_address, barangay, city, province, postal_code, full_name, phone')
          .eq('id', order.shipping_address_id)
          .single();

        if (address) {
          shippingInfo = `\n\nShipping To:\n${address.full_name}\n${address.street_address}, ${address.barangay}\n${address.city}, ${address.province} ${address.postal_code}\nPhone: ${address.phone}`;
        }
      }

      const itemsList = items.map(item => 
        `${item.product_name} x${item.quantity} - PHP ${item.total.toFixed(2)}`
      ).join('\n');

      return `Order ${order.order_number}\n\nStatus: ${order.status}\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\nItems:\n${itemsList}\n\nSubtotal: PHP ${order.subtotal?.toFixed(2) || 'N/A'}\nDiscount: PHP ${order.discount?.toFixed(2) || '0.00'}\nShipping: PHP ${order.shipping_fee?.toFixed(2) || 'N/A'}\nTotal: PHP ${order.total.toFixed(2)}\n\nDelivery Type: ${order.delivery_type || 'Standard'}${order.tracking_number ? `\nTracking: ${order.tracking_number}` : ''}${order.courier_name ? `\nCourier: ${order.courier_name}` : ''}${shippingInfo}`;
    } catch (error) {
      console.error('Error fetching order:', error);
      return 'Sorry, I could not retrieve the order details. Please try again later.';
    }
  }

  async trackOrder(orderNumber, userId) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          tracking_number,
          courier_name,
          delivery_type,
          created_at,
          total,
          shipping_address_id
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .single();

      if (error || !order) {
        return `I could not find order ${orderNumber}. Please check the order number and try again.`;
      }

      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, product_image, quantity, unit_price, total')
        .eq('order_id', order.id);

      let shippingAddress = null;
      if (order.shipping_address_id) {
        const { data: address } = await supabase
          .from('shipping_addresses')
          .select('street_address, barangay, city, province, postal_code, full_name, phone')
          .eq('id', order.shipping_address_id)
          .single();
        shippingAddress = address;
      }

      const statusDescriptions = {
        'pending': 'Your order has been received and is being processed.',
        'processing': 'Your order is being prepared for shipment.',
        'ready_for_pickup': 'Your order is ready for pickup at our location.',
        'shipped': 'Your order has been shipped and is on the way!',
        'delivered': 'Your order has been delivered successfully.',
        'cancelled': 'This order has been cancelled.',
        'refunded': 'This order has been refunded.'
      };

      return {
        type: 'order_tracking',
        orderNumber: order.order_number,
        status: order.status,
        description: statusDescriptions[order.status] || 'Order status updated.',
        trackingNumber: order.tracking_number,
        courier: order.courier_name,
        deliveryType: order.delivery_type,
        orderDate: new Date(order.created_at).toLocaleDateString(),
        total: order.total,
        items: items || [],
        shipping_address: shippingAddress
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      return 'Sorry, I could not track your order at this time. Please try again later.';
    }
  }

  async requestCancellation(orderNumber, userId, reason) {
    try {
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .single();

      if (fetchError || !order) {
        return `I could not find order ${orderNumber}. Please check the order number and try again.`;
      }

      if (order.status === 'cancelled') {
        return `Order ${orderNumber} has already been cancelled.`;
      }

      if (order.status === 'delivered' || order.status === 'shipped') {
        return `Order ${orderNumber} cannot be cancelled because it has already been ${order.status}. Please contact our support team for assistance.`;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      return `Order ${orderNumber} has been cancelled successfully. You will receive a refund within 5-7 business days.`;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return 'Sorry, I could not process your cancellation request. Please contact our support team directly.';
    }
  }

  getShippingPolicy() {
    return `SHIPPING POLICY

Shipping Options:
- Standard Delivery (5-7 business days) - PHP 50-150 depending on location
- Express Delivery (2-3 business days) - PHP 200-300 depending on location
- Store Pickup - FREE

Processing Time:
Orders are processed within 1-2 business days. You will receive a confirmation email once your order ships.

Shipping Coverage:
We ship nationwide across the Philippines. Remote areas may require additional delivery time.

Tracking:
Once shipped, you will receive a tracking number to monitor your delivery status.

Delivery Issues:
If you experience any delivery problems, please contact us immediately with your order number.`;
  }

  getReturnPolicy() {
    return `RETURN POLICY

Return Window:
You may return items within 30 days of delivery for a full refund or exchange.

Eligible Returns:
- Items must be unused and in original packaging
- Tags and labels must be attached
- Include proof of purchase (receipt or order confirmation)

Non-Returnable Items:
- Opened cosmetics or personal care items
- Custom or personalized products
- Sale or clearance items marked as final sale

How to Return:
1. Contact our customer service team
2. Provide your order number and reason for return
3. We will send you return instructions
4. Ship the item back using our prepaid label
5. Refund processed within 5-7 business days after receiving the return

Return Shipping:
FREE return shipping for defective or incorrect items. For other returns, a PHP 100 shipping fee may apply.`;
  }

  getRefundPolicy() {
    return `REFUND POLICY

Refund Processing:
Refunds are processed within 5-7 business days after we receive your returned item.

Refund Method:
Refunds will be issued to your original payment method:
- Credit/Debit Card: 7-14 business days
- GCash/PayMaya: 3-5 business days
- Bank Transfer: 5-7 business days

Partial Refunds:
In some cases, only partial refunds are granted:
- Items showing signs of use or damage
- Items returned after 30 days
- Items missing parts or accessories

Exchange vs Refund:
You can choose between a refund or exchange for a different product. Exchanges are processed faster than refunds.

Refund Notifications:
You will receive an email confirmation once your refund has been processed.

Questions?
Contact our customer service team if you have questions about your refund status.`;
  }

  getWarrantyInfo() {
    return `WARRANTY INFORMATION

Standard Warranty:
All products come with a manufacturer's warranty. Warranty periods vary by product:
- Electronics: 1 year
- Appliances: 1-2 years
- Furniture: 6 months to 1 year
- Accessories: 30-90 days

What's Covered:
- Manufacturing defects
- Faulty materials or workmanship
- Malfunctions under normal use

What's NOT Covered:
- Accidental damage or misuse
- Normal wear and tear
- Unauthorized repairs or modifications
- Damage from improper care

How to Claim Warranty:
1. Contact us with your order number and issue description
2. Provide photos or video of the defect
3. We will arrange repair, replacement, or refund
4. Keep your receipt and warranty card

Extended Warranty:
Extended warranty options may be available for certain products. Ask us for details when making your purchase.`;
  }

  getPaymentMethods() {
    return `PAYMENT METHODS

We accept the following payment options:

Online Payments:
- Credit/Debit Cards (Visa, Mastercard, JCB, American Express)
- GCash
- PayMaya
- Bank Transfer

Cash Options:
- Cash on Delivery (COD) - Available for orders under PHP 5,000
- Cash payment at store pickup

Payment Security:
All online transactions are secured with SSL encryption. We never store your complete card details.

Failed Payments:
If your payment fails, please verify your card details or try a different payment method. Contact your bank if issues persist.

Payment Confirmation:
You will receive an email confirmation once your payment is successfully processed.

Installment Options:
Credit card installment plans may be available for purchases over PHP 3,000. Contact us for details.`;
  }

  async getStoreInfo() {
    const settings = await this.loadStoreSettings();
    
    if (!settings) {
      return 'Store information is temporarily unavailable. Please try again later.';
    }

    let response = `ABOUT OUR STORE\n\n`;
    
    if (settings.brand_name) {
      response += `Welcome to ${settings.brand_name}!\n\n`;
    }
    
    response += `We are your trusted destination for quality products and exceptional customer service.\n\n`;
    
    response += `What We Offer:\n`;
    response += `- Wide selection of quality products\n`;
    response += `- Competitive prices and regular promotions\n`;
    response += `- Fast and reliable shipping nationwide\n`;
    response += `- Secure payment options\n`;
    response += `- Responsive customer support\n\n`;
    
    response += `Why Shop With Us:\n`;
    response += `- Quality Guaranteed: All products are carefully selected\n`;
    response += `- Customer First: Your satisfaction is our priority\n`;
    response += `- Easy Returns: Hassle-free 30-day return policy\n`;
    response += `- Secure Shopping: Protected transactions and data privacy\n\n`;
    
    if (settings.contact_address || settings.showroom_hours) {
      response += `Visit Us:\n`;
      if (settings.contact_address) {
        response += `Location: ${settings.contact_address}\n`;
      }
      if (settings.showroom_hours) {
        response += `Hours: ${settings.showroom_hours}\n`;
      }
    }

    return response;
  }

  async getStoreLocation() {
    const settings = await this.loadStoreSettings();
    
    if (!settings || !settings.contact_address) {
      return 'Store location information is temporarily unavailable. Please contact our customer service.';
    }

    return `OUR LOCATION\n\n${settings.contact_address}\n\nYou can visit our showroom during business hours or contact us for directions.`;
  }

  async getStoreHours() {
    const settings = await this.loadStoreSettings();
    
    if (!settings || !settings.showroom_hours) {
      return 'Store hours information is temporarily unavailable. Please contact our customer service.';
    }

    return `STORE HOURS\n\n${settings.showroom_hours}\n\nWe look forward to serving you!`;
  }

  async getContactInfo() {
    const settings = await this.loadStoreSettings();
    
    if (!settings) {
      return 'Contact information is temporarily unavailable. Please try again later.';
    }

    let response = `CONTACT US\n\n`;
    
    if (settings.contact_email) {
      response += `Email: ${settings.contact_email}\n`;
    }
    
    if (settings.contact_phone) {
      response += `Phone: ${settings.contact_phone}\n`;
    }
    
    if (settings.contact_address) {
      response += `Address: ${settings.contact_address}\n`;
    }
    
    response += `\n`;
    
    if (settings.facebook_url || settings.instagram_url) {
      response += `Follow Us:\n`;
      if (settings.facebook_url) {
        response += `Facebook: ${settings.facebook_url}\n`;
      }
      if (settings.instagram_url) {
        response += `Instagram: ${settings.instagram_url}\n`;
      }
    }
    
    response += `\nWe typically respond within 24 hours during business days.`;

    return response;
  }

  async getLiveAgentInfo() {
    const settings = await this.loadStoreSettings();
    
    let response = `SPEAK WITH A LIVE AGENT\n\n`;
    response += `I'm here to help, but if you need personalized assistance, our customer service team is ready to assist you.\n\n`;
    
    response += `Contact Options:\n`;
    
    if (settings?.contact_email) {
      response += `Email: ${settings.contact_email}\n`;
    } else {
      response += `Email: Available through our contact form\n`;
    }
    
    if (settings?.contact_phone) {
      response += `Phone: ${settings.contact_phone}\n`;
    } else {
      response += `Phone: Available during business hours\n`;
    }
    
    if (settings?.facebook_url) {
      response += `Facebook Messenger: ${settings.facebook_url}\n`;
    }
    
    response += `\n`;
    
    if (settings?.showroom_hours) {
      response += `Support Hours: ${settings.showroom_hours}\n`;
    } else {
      response += `Support Hours: Monday-Saturday, 9:00 AM - 6:00 PM\n`;
    }
    
    response += `\nOur team will be happy to assist with:\n`;
    response += `- Complex order issues\n`;
    response += `- Custom product inquiries\n`;
    response += `- Bulk order requests\n`;
    response += `- Special accommodations\n`;
    response += `- Detailed product consultations`;

    return response;
  }

  detectCustomerServiceIntent(message) {
    const msg = message.toLowerCase();

    // Order tracking
    if (msg.match(/track|where is my|delivery status|shipping status/i)) {
      return 'track_order';
    }

    // View orders
    if (msg.match(/my orders|order history|past orders|previous orders|show.*orders/i)) {
      return 'view_orders';
    }

    // Order details
    if (msg.match(/order.*#?\d+|order number/i)) {
      return 'order_details';
    }

    // Cancellation
    if (msg.match(/cancel.*order|cancel my|stop my order/i)) {
      return 'cancel_order';
    }

    // Shipping policy
    if (msg.match(/shipping|delivery.*policy|how.*ship|shipping.*cost|delivery.*fee/i)) {
      return 'shipping_policy';
    }

    // Return policy
    if (msg.match(/return|exchange|send.*back/i)) {
      return 'return_policy';
    }

    // Refund policy
    if (msg.match(/refund|money back|get.*back.*money/i)) {
      return 'refund_policy';
    }

    // Warranty
    if (msg.match(/warranty|guarantee|defect/i)) {
      return 'warranty';
    }

    // Payment methods
    if (msg.match(/payment|pay|how.*much|accept.*card|payment.*method|gcash|paymaya/i)) {
      return 'payment_methods';
    }

    // Store info
    if (msg.match(/about.*store|who are you|about.*shop|your.*company/i)) {
      return 'store_info';
    }

    // Location
    if (msg.match(/location|address|where.*located|find.*store|visit/i)) {
      return 'store_location';
    }

    // Store hours
    if (msg.match(/hours|open|close|when.*open|business hours/i)) {
      return 'store_hours';
    }

    // Contact info
    if (msg.match(/contact|phone|email|reach.*you|call.*you/i)) {
      return 'contact_info';
    }

    // Live agent
    if (msg.match(/talk.*agent|speak.*person|human|representative|customer.*service/i)) {
      return 'live_agent';
    }

    return null;
  }

  async handleQuery(intent, message, userId = null) {
    switch (intent) {
      case 'view_orders':
        if (!userId) {
          return 'Please log in to view your orders.';
        }
        return await this.getUserOrders(userId);

      case 'track_order':
        if (!userId) {
          return 'Please log in to track your order. If you have your order number, you can also provide it for tracking.';
        }
        const trackMatch = message.match(/#?(\d{6,})/);
        if (trackMatch) {
          return await this.trackOrder(trackMatch[1], userId);
        }
        return 'Please provide your order number to track your order. For example: "Track order #123456"';

      case 'order_details':
        if (!userId) {
          return 'Please log in to view order details.';
        }
        const orderMatch = message.match(/#?(\d{6,})/);
        if (orderMatch) {
          return await this.getOrderByNumber(orderMatch[1], userId);
        }
        return 'Please provide your order number. For example: "Order #123456"';

      case 'cancel_order':
        if (!userId) {
          return 'Please log in to cancel an order.';
        }
        const cancelMatch = message.match(/#?(\d{6,})/);
        if (cancelMatch) {
          return await this.requestCancellation(cancelMatch[1], userId, 'Customer requested cancellation');
        }
        return 'Please provide your order number to cancel. For example: "Cancel order #123456"';

      case 'shipping_policy':
        return this.getShippingPolicy();

      case 'return_policy':
        return this.getReturnPolicy();

      case 'refund_policy':
        return this.getRefundPolicy();

      case 'warranty':
        return this.getWarrantyInfo();

      case 'payment_methods':
        return this.getPaymentMethods();

      case 'store_info':
        return await this.getStoreInfo();

      case 'store_location':
        return await this.getStoreLocation();

      case 'store_hours':
        return await this.getStoreHours();

      case 'contact_info':
        return await this.getContactInfo();

      case 'live_agent':
        return await this.getLiveAgentInfo();

      default:
        return null;
    }
  }
}

export default new AICustomerService();

