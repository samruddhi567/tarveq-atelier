/**
 * WhatsApp Notification Service for TARVEQ ATELIER
 * 
 * Supports:
 * 1. Official WhatsApp Click-to-Chat prefilled links for Admin 1 & Admin 2 (Active MVP)
 * 2. Meta WhatsApp Cloud API Integration (Future-Ready Architecture)
 */

export interface OrderNotificationPayload {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    houseNo?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  items: Array<{
    name: string;
    size?: string;
    length?: string;
    colour?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerNotes?: string;
}

export const ADMIN_PHONE_1 = '919307859693'; // Admin 1: +91 9307859693
export const ADMIN_PHONE_2 = '918809271583'; // Admin 2: +91 8809271583

/**
 * Formats a clean, professional, readable WhatsApp order notification text
 */
export function formatOrderNotificationText(order: OrderNotificationPayload): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const address = order.shippingAddress;
  const addressLines = [
    address.houseNo ? `${address.houseNo}, ${address.street}` : address.street,
    address.city,
    `${address.state} - ${address.pincode}`,
    address.landmark ? `Landmark: ${address.landmark}` : null,
  ].filter(Boolean).join('\n');

  const itemsList = order.items
    .map((it, idx) => {
      const details = [
        it.size ? `Size: ${it.size}` : null,
        it.length ? `Inseam: ${it.length}` : null,
        it.colour ? `Colour: ${it.colour}` : null,
        `Qty: ${it.quantity}`,
        `Price: ₹${it.price.toLocaleString('en-IN')}`,
      ].filter(Boolean).join(' • ');

      return `Item ${idx + 1}:\n*${it.name}*\n${details}`;
    })
    .join('\n\n');

  const deliveryStr = order.deliveryCharge === 0 ? '₹0 (Free Delivery)' : `₹${order.deliveryCharge.toLocaleString('en-IN')}`;

  return `*TARVEQ ATELIER – NEW ORDER*

*Order ID:* ${order.orderId}
*Date:* ${dateStr}
*Order Status:* Pending Confirmation

----------------------------------
*CUSTOMER DETAILS*
*Name:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Email:* ${order.customerEmail || 'Not provided'}

----------------------------------
*DELIVERY ADDRESS*
${addressLines}

----------------------------------
*ORDERED PIECES*
${itemsList}

----------------------------------
*PRICE SUMMARY*
*Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}
*Discount:* ₹${order.discount.toLocaleString('en-IN')}
*Delivery:* ${deliveryStr}
*Total Amount:* ₹${order.totalAmount.toLocaleString('en-IN')}

----------------------------------
*PAYMENT INFORMATION*
*Payment Method:* ${order.paymentMethod}
*Payment Status:* ${order.paymentStatus}

*CUSTOMER INSTRUCTIONS:*
${order.customerNotes || 'None'}

Thank you for choosing TARVEQ ATELIER.`;
}

/**
 * Generates official Click-to-Chat URLs for Admin 1 and Admin 2
 */
export function generateWhatsAppUrls(order: OrderNotificationPayload) {
  const message = formatOrderNotificationText(order);
  const encoded = encodeURIComponent(message);

  return {
    admin1Phone: ADMIN_PHONE_1,
    admin2Phone: ADMIN_PHONE_2,
    admin1Url: `https://wa.me/${ADMIN_PHONE_1}?text=${encoded}`,
    admin2Url: `https://wa.me/${ADMIN_PHONE_2}?text=${encoded}`,
    rawMessage: message,
  };
}

/**
 * FUTURE-READY: WhatsApp Cloud API Integration Hook
 * 
 * To activate automatic background messaging in the future:
 * 1. Set WHATSAPP_CLOUD_API_TOKEN in .env
 * 2. Set WHATSAPP_PHONE_NUMBER_ID in .env
 * 3. Provide approved Meta message template
 */
export async function sendCloudApiNotification(order: OrderNotificationPayload): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      sent: false,
      reason: 'WhatsApp Cloud API credentials not configured. Using Click-to-Chat MVP mode.',
    };
  }

  try {
    const text = formatOrderNotificationText(order);
    const recipients = [ADMIN_PHONE_1, ADMIN_PHONE_2];

    for (const recipient of recipients) {
      await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: { body: text },
        }),
      });
    }

    return { sent: true };
  } catch (error: any) {
    console.error('[WhatsApp Cloud API] Notification failed:', error);
    return { sent: false, reason: error.message };
  }
}
