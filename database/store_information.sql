-- ============================================
-- Store Information Table
-- Stores FAQs, policies, and store details for AI assistant
-- ============================================

-- Create store_information table
CREATE TABLE IF NOT EXISTS store_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- 'shipping', 'returns', 'payment', 'warranty', 'faq', 'contact', 'store'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[], -- For search matching
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_store_info_category ON store_information(category);
CREATE INDEX IF NOT EXISTS idx_store_info_active ON store_information(is_active);
CREATE INDEX IF NOT EXISTS idx_store_info_keywords ON store_information USING GIN(keywords);

-- Enable RLS
ALTER TABLE store_information ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active store information" ON store_information;
DROP POLICY IF EXISTS "Only admins can modify store information" ON store_information;

-- Policy: Everyone can read active store information
CREATE POLICY "Anyone can read active store information"
  ON store_information
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can modify store information
CREATE POLICY "Only admins can modify store information"
  ON store_information
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- Insert Essential FAQs and Policies
-- ============================================

-- Clear existing data
TRUNCATE TABLE store_information;

-- Shipping Information
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('shipping', 'How long does shipping take?', 
'We offer two delivery options: Local Delivery takes 3-7 business days within Metro Manila and 7-14 business days for provincial areas. Store Pickup is available immediately once your order is ready (usually within 24 hours). Orders are processed within 24 hours on business days.', 
ARRAY['shipping', 'delivery', 'how long', 'time', 'days', 'when will', 'arrive', 'receive', 'local delivery'], 
10),

('shipping', 'What are the shipping fees?', 
'Shipping fees vary by location: Metro Manila - ₱150 (standard), Luzon - ₱250, Visayas - ₱350, Mindanao - ₱400. Store Pickup is FREE! Free shipping may be available on orders over ₱50,000 within Metro Manila.', 
ARRAY['shipping fee', 'delivery cost', 'how much', 'charge', 'price', 'free shipping', 'pickup'], 
11),

('shipping', 'What delivery options do you have?', 
'We offer two delivery options: 1) Local Delivery - We deliver to your address nationwide across the Philippines. 2) Store Pickup - FREE pickup at our showroom during business hours. Choose your preferred option at checkout!', 
ARRAY['delivery options', 'pickup', 'store pickup', 'local delivery', 'how to receive'], 
12),

('shipping', 'What areas do you deliver to?', 
'We deliver nationwide across the Philippines! This includes all Metro Manila areas, Luzon provinces, Visayas, and Mindanao. You can also choose FREE Store Pickup at our showroom.', 
ARRAY['area', 'location', 'deliver', 'coverage', 'where', 'province', 'city', 'nationwide'], 
13);

-- Return & Refund Policy
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('returns', 'What is your return policy?', 
'We offer a 30-day return policy on all products. Items must be in original condition with all packaging, accessories, and seals intact. Software, opened games, and consumables are non-returnable unless defective. Return shipping is covered by us if the item is defective, otherwise customer shoulders return shipping.', 
ARRAY['return', 'refund', 'exchange', '30 days', 'money back', 'bring back', 'not satisfied'], 
20),

('returns', 'How do I return a product?', 
'To return a product: 1) Contact us within 30 days with your order number, 2) We''ll provide return instructions and shipping label if applicable, 3) Pack the item securely in original packaging, 4) Ship it back or drop it at our store, 5) Refund will be processed within 7-10 business days after we receive and inspect the item.', 
ARRAY['return process', 'how to return', 'return procedure', 'steps'], 
21),

('returns', 'Can I return an opened product?', 
'Opened products can be returned only if they are defective or damaged on arrival. For non-defective items, returns are accepted only if the product remains sealed in its original packaging. This policy is in place for hygiene and resale purposes.', 
ARRAY['opened', 'used', 'unsealed', 'return opened'], 
22);

-- Payment Methods
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('payment', 'What payment methods do you accept?', 
'We accept: Credit/Debit Cards (Visa, Mastercard), GCash, PayMaya, and Cash on Delivery (COD) for Metro Manila orders. All card and e-wallet payments are processed securely through PayMongo for your safety.', 
ARRAY['payment', 'pay', 'how to pay', 'gcash', 'card', 'visa', 'mastercard', 'paymaya', 'cod', 'cash', 'payment methods', 'credit card', 'debit card'], 
30),

('payment', 'Is Cash on Delivery available?', 
'Yes! Cash on Delivery (COD) is available for orders within Metro Manila. A small COD processing fee may apply. Payment must be made in cash to the delivery rider upon receipt. Please have exact change ready if possible.', 
ARRAY['cod', 'cash on delivery', 'pay on delivery', 'cash', 'payment on delivery'], 
31),

('payment', 'How do I pay with GCash?', 
'To pay with GCash: 1) Select GCash as your payment method at checkout, 2) You''ll be redirected to the secure GCash payment page, 3) Log in to your GCash account, 4) Review and confirm the payment amount, 5) Complete the transaction. Payment confirmation is instant and you''ll receive an order confirmation!', 
ARRAY['gcash', 'how to pay gcash', 'gcash payment', 'ewallet', 'e-wallet'], 
32),

('payment', 'How do I pay with card?', 
'To pay with credit/debit card: 1) Select "Credit Card" or "Debit Card" at checkout, 2) Enter your card details securely on our PayMongo payment page, 3) Complete verification if required by your bank, 4) Receive instant payment confirmation. We accept Visa and Mastercard.', 
ARRAY['card payment', 'credit card', 'debit card', 'visa', 'mastercard', 'how to pay card'], 
33);

-- Warranty Information
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('warranty', 'Do your products have warranty?', 
'Yes! All products come with manufacturer warranty ranging from 1-3 years depending on the brand and product type. We provide full warranty support and will assist you with any warranty claims or repairs.', 
ARRAY['warranty', 'guarantee', 'coverage', 'protection', 'how long warranty'], 
40),

('warranty', 'How do I claim warranty?', 
'To claim warranty: 1) Contact us with your order number and issue description, 2) Provide proof of purchase and photos/videos of the defect, 3) We''ll assess if it''s covered under warranty, 4) If approved, we''ll coordinate with the manufacturer for repair or replacement. Turnaround time is typically 7-14 days.', 
ARRAY['claim warranty', 'warranty process', 'defective', 'broken', 'not working', 'repair'], 
41),

('warranty', 'What does warranty cover?', 
'Warranty covers manufacturing defects and hardware failures under normal use. It does NOT cover: physical damage (drops, liquid damage), misuse, unauthorized repairs, cosmetic damage, or software issues. Always read the specific warranty terms included with your product.', 
ARRAY['warranty coverage', 'what covered', 'included', 'warranty terms'], 
42);

-- Store Information  
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('store', 'Where is your store located?', 
'Our showroom is located at: Block 21 Lot 23 Caypombo, Sta. Maria, Bulacan. You can visit us to see products in person, test gaming peripherals, get technical advice from our staff, or pick up your orders for FREE. We''re easy to find and happy to help!', 
ARRAY['location', 'address', 'where', 'store', 'visit', 'showroom', 'branch', 'find you', 'directions'], 
50),

('store', 'What are your store hours?', 
'Showroom Hours: Mon-Sunday: 8:00 AM - 5:00 PM. We''re open 7 days a week! Closed on major holidays only. For holiday hours or special schedules, check our website or Facebook page for updates.', 
ARRAY['hours', 'open', 'time', 'schedule', 'when open', 'operating hours', 'what time', 'closed'], 
51),

('store', 'Can I pick up my order at the store?', 
'Absolutely! Store Pickup is FREE and highly recommended. Choose "Store Pickup" during checkout. You''ll receive a notification when your order is ready (usually within 24 hours). Visit during our showroom hours: Mon-Sunday: 8:00 AM - 5:00 PM. Bring a valid ID and your order number!', 
ARRAY['pickup', 'pick up', 'store pickup', 'get from store', 'self pickup', 'collect order'], 
52),

('store', 'Can I test products before buying?', 
'Yes! Visit our showroom to see and test products in person. We have display units for keyboards, mice, monitors, headsets, and gaming chairs. For high-value items like GPUs or processors, we can show you the products (unopened). Our staff can also provide technical advice and recommendations!', 
ARRAY['test', 'try', 'demo', 'see product', 'hands on', 'display', 'physical store'], 
53);

-- Contact Information
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('contact', 'How can I contact customer support?', 
'You can reach us through: Email: egiegameshop2025@gmail.com | Phone: +639151855519 (Mon-Sunday: 8:00 AM - 5:00 PM) | Facebook: facebook.com | Instagram: instagram.com | AI Chat: Available 24/7 on our website. We typically respond within 1-2 hours during business hours!', 
ARRAY['contact', 'support', 'help', 'email', 'phone', 'chat', 'reach', 'call', 'message', 'customer service'], 
60),

('contact', 'Do you have Facebook or social media?', 
'Yes! Follow us for updates, promotions, and PC building tips: Facebook: facebook.com | Instagram: instagram.com | TikTok: Check our website for link. Message us on any platform for quick support or browse our latest products and gaming content!', 
ARRAY['facebook', 'social media', 'instagram', 'follow', 'fb', 'page', 'tiktok', 'social'], 
61),

('contact', 'What is your email address?', 
'Our official email is: egiegameshop2025@gmail.com. We respond to all emails within 1-2 hours during business hours (Mon-Sunday: 8:00 AM - 5:00 PM). For urgent inquiries, you can also message us on Facebook or call +639151855519.', 
ARRAY['email', 'email address', 'contact email', 'support email'], 
62);

-- General FAQs
INSERT INTO store_information (category, question, answer, keywords, display_order) VALUES
('faq', 'Do you price match?', 
'We strive to offer competitive pricing! While we may not have a formal price match policy, we review our prices regularly. If you find a significantly lower price from an authorized retailer for an identical product, contact us and we''ll see what we can do. Send us the competitor''s quote at egiegameshop2025@gmail.com.', 
ARRAY['price match', 'cheaper', 'lower price', 'discount', 'beat price', 'competitive'], 
70),

('faq', 'Do you offer bulk discounts?', 
'Yes! We offer special pricing for bulk orders (5+ units) and corporate/business purchases. Perfect for internet cafes, offices, or gaming centers. Contact our sales team at egiegameshop2025@gmail.com with your requirements for a customized quote and volume discounts.', 
ARRAY['bulk', 'wholesale', 'business', 'corporate', 'quantity discount', 'many units', 'volume'], 
71),

('faq', 'Do you build custom PCs?', 
'Yes! We offer custom PC building services. Use our AI assistant or browse our components to choose your parts, and we''ll assemble, test, and optimize your PC. We provide professional cable management and stress testing. Delivery time is 3-5 business days for custom builds. Building service may be complimentary with purchase!', 
ARRAY['build pc', 'custom pc', 'assemble', 'build service', 'pc building', 'gaming pc', 'workstation'], 
72),

('faq', 'What if my item arrives damaged?', 
'If your item arrives damaged or defective: 1) Take clear photos/videos immediately upon unboxing, 2) Contact us within 24 hours at egiegameshop2025@gmail.com, 3) We''ll arrange FREE pickup and replacement, 4) Replacement ships within 1-2 business days. We stand behind every product we sell and will make it right!', 
ARRAY['damaged', 'broken', 'defective', 'arrived damaged', 'doa', 'not working', 'faulty'], 
73),

('faq', 'Do you have vouchers or promo codes?', 
'Yes! We regularly offer vouchers and discount codes. Check our website homepage, follow us on Facebook/Instagram for exclusive codes, or subscribe to our newsletter. Vouchers can be applied at checkout. Some vouchers have minimum purchase requirements or expiration dates.', 
ARRAY['voucher', 'promo code', 'discount code', 'coupon', 'promo', 'discount'], 
74),

('faq', 'Can I track my order?', 
'Yes! Once your order is confirmed, you can track it in the "My Orders" section after signing in. You''ll receive email notifications when your order status changes (confirmed, processing, shipped, ready for pickup, delivered). For detailed tracking, provide your order number to our AI assistant!', 
ARRAY['track order', 'order status', 'where is my order', 'tracking', 'order tracking'], 
75);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_store_information_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_store_information_timestamp ON store_information;

CREATE TRIGGER trigger_update_store_information_timestamp
  BEFORE UPDATE ON store_information
  FOR EACH ROW
  EXECUTE FUNCTION update_store_information_timestamp();

COMMENT ON TABLE store_information IS 'Stores FAQs, policies, and store information for AI shopping assistant';

-- ============================================
-- DYNAMIC STORE INFORMATION
-- 
-- This table stores FAQ templates. The AI automatically fetches real-time data from 
-- the `website_settings` table and replaces these placeholders:
--
-- - Block 21 Lot 23 Caypombo, Sta. Maria, Bulacan → website_settings.contact_address
-- - +639151855519 → website_settings.contact_phone
-- - egiegameshop2025@gmail.com → website_settings.contact_email
-- - Mon-Sunday: 8:00 AM - 5:00 PM → website_settings.showroom_hours
--
-- When admins update website_settings in the admin panel, the AI will automatically
-- use the new values - NO NEED to update this table manually!
--
-- To add/edit FAQs: Update rows in Supabase Table Editor → store_information
-- ============================================
