// backend/services/emailService.js
const { BrevoClient } = require('@getbrevo/brevo');
const User = require('../models/User');

// EMAIL_FROM is "Name <email@domain.com>" — parsed into Brevo's {name, email} sender shape.
const parseFrom = (fromStr) => {
  const match = /^(.*)<(.+)>$/.exec(fromStr || '');
  if (match) return { name: match[1].trim().replace(/^"|"$/g, '') || undefined, email: match[2].trim() };
  return { name: undefined, email: fromStr || undefined };
};
const SENDER = parseFrom(process.env.EMAIL_FROM || 'Marketplace <no-reply@example.com>');

let brevo = null;
if (process.env.BREVO_API_KEY) {
  brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
} else {
  console.warn('[emailService] BREVO_API_KEY not set — order emails are disabled.');
}

const sendMail = async ({ to, subject, html }) => {
  if (!brevo || !to) return; // no client configured, or recipient has no email — silent skip
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: SENDER,
      to: [{ email: to }],
    });
  } catch (e) {
    console.error('[emailService] Brevo API error:', e.statusCode, e.message, e.body ? JSON.stringify(e.body) : '');
  }
};

// ---- Templates ----

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const itemsRows = (items) => (items || []).map((i) => `
  <tr>
    <td style="padding:8px;border-bottom:1px solid #eee;">${i.name}${i.selectedOption ? ` (${i.selectedOption})` : ''}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}${i.unit ? ' ' + i.unit : ''}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(i.price)}</td>
  </tr>
`).join('');

const orderDateTime = (order) => new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

function customerConfirmationTemplate(order) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#4f46e5;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;">Order Confirmed</h2>
  </div>
  <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
    <p>Hi ${order.customerName},</p>
    <p>Your order from <strong>${order.shopName || 'the shop'}</strong> has been placed successfully.</p>
    <p style="color:#555;font-size:14px;">
      Order ID: <strong>${order._id}</strong><br/>
      Placed: ${orderDateTime(order)}<br/>
      Status: <strong>${order.status || 'Pending'}</strong>
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="text-align:left;padding:8px;">Item</th>
          <th style="text-align:center;padding:8px;">Qty</th>
          <th style="text-align:right;padding:8px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows(order.items)}</tbody>
    </table>
    <p style="text-align:right;font-size:16px;margin-top:12px;">
      <strong>Total: ${money(order.totalAmount)}</strong>
    </p>
    <p style="color:#555;font-size:14px;">Payment method: ${order.paymentMethod}</p>
    <p style="color:#999;font-size:12px;margin-top:20px;">Thank you for your order!</p>
  </div>
</div>`;
}

function shopNewOrderTemplate(order) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#059669;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;">New Order Received</h2>
  </div>
  <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
    <p style="color:#555;font-size:14px;">
      Order ID: <strong>${order._id}</strong><br/>
      Received: ${orderDateTime(order)}
    </p>
    <p>
      Customer: <strong>${order.customerName}</strong><br/>
      Contact: <strong>${order.customerContact}</strong><br/>
      Address: ${order.customerAddress}
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="text-align:left;padding:8px;">Item</th>
          <th style="text-align:center;padding:8px;">Qty</th>
          <th style="text-align:right;padding:8px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows(order.items)}</tbody>
    </table>
    <p style="text-align:right;font-size:16px;margin-top:12px;">
      <strong>Total: ${money(order.totalAmount)}</strong>
    </p>
    <p style="color:#555;font-size:14px;">Payment method: ${order.paymentMethod}</p>
    <p style="color:#999;font-size:12px;margin-top:20px;">Log in to your dashboard to manage this order.</p>
  </div>
</div>`;
}

function statusUpdateTemplate(order, newStatus) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#2563eb;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;">Order Update</h2>
  </div>
  <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
    <p>Hi ${order.customerName},</p>
    <p style="font-size:16px;">Your order is now: <strong>${newStatus}</strong></p>
    <p style="color:#555;font-size:14px;">
      Order ID: <strong>${order._id}</strong><br/>
      Shop: ${order.shopName || 'your shop'}
    </p>
    <p style="color:#999;font-size:12px;margin-top:20px;">Track your order for live updates.</p>
  </div>
</div>`;
}

// ---- Orchestration ----

async function notifyNewOrder(order) {
  try {
    const [shopUser, customerUser] = await Promise.all([
      User.findById(order.shop).select('email'),
      order.customer ? User.findById(order.customer).select('email') : Promise.resolve(null),
    ]);

    await Promise.allSettled([
      shopUser?.email
        ? sendMail({ to: shopUser.email, subject: `New order — ${order.shopName || 'your shop'}`, html: shopNewOrderTemplate(order) })
        : Promise.resolve(),
      customerUser?.email
        ? sendMail({ to: customerUser.email, subject: `Order confirmed — ${order.shopName || 'your order'}`, html: customerConfirmationTemplate(order) })
        : Promise.resolve(),
    ]);
  } catch (e) {
    console.error('[emailService] notifyNewOrder failed:', e.message);
  }
}

async function notifyOrderStatusChange(order, newStatus) {
  try {
    if (!order.customer) return;
    const customerUser = await User.findById(order.customer).select('email');
    if (!customerUser?.email) return;
    await sendMail({
      to: customerUser.email,
      subject: `Order update — ${order.shopName || 'your order'}`,
      html: statusUpdateTemplate(order, newStatus),
    });
  } catch (e) {
    console.error('[emailService] notifyOrderStatusChange failed:', e.message);
  }
}

module.exports = { notifyNewOrder, notifyOrderStatusChange };
