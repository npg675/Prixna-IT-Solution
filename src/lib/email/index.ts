import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Prixna IT Solution <noreply@prixnaitsolution.com.np>";
const TO_EMAIL = process.env.TO_EMAIL || "info@prixnaitsolution.com.np";

interface LeadEmailData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  location?: string;
  service?: string;
  message: string;
  preferredDate?: string;
  contactVia?: string;
  formType: string;
  referenceId: string;
}

export async function sendLeadNotificationEmail(data: LeadEmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a2230; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0a1a38; color: #ffffff; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">New Enquiry Received</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Prixna IT Solution — Lead Inbox</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257; width: 140px;">Reference ID</td>
            <td style="padding: 12px 0; font-family: monospace; background: #f0f4f9; padding: 8px 12px; border-radius: 4px;">${data.referenceId}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Name</td>
            <td style="padding: 12px 0;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Phone</td>
            <td style="padding: 12px 0;"><a href="tel:${data.phone}" style="color: #1e8bff; text-decoration: none;">${data.phone}</a></td>
          </tr>
          ${data.email ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Email</td>
            <td style="padding: 12px 0;"><a href="mailto:${data.email}" style="color: #1e8bff; text-decoration: none;">${data.email}</a></td>
          </tr>
          ` : ""}
          ${data.company ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Company</td>
            <td style="padding: 12px 0;">${data.company}</td>
          </tr>
          ` : ""}
          ${data.location ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Location</td>
            <td style="padding: 12px 0;">${data.location}</td>
          </tr>
          ` : ""}
          ${data.service ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Service Interest</td>
            <td style="padding: 12px 0;">${data.service}</td>
          </tr>
          ` : ""}
          ${data.preferredDate ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Preferred Date</td>
            <td style="padding: 12px 0;">${data.preferredDate}</td>
          </tr>
          ` : ""}
          ${data.contactVia ? `
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257;">Contact Via</td>
            <td style="padding: 12px 0;">${data.contactVia}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #324257; vertical-align: top;">Message</td>
            <td style="padding: 12px 0; white-space: pre-wrap;">${data.message}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 12px; font-weight: 600; color: #324257;">Quick Actions</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="https://wa.me/9779813714582?text=${encodeURIComponent(`Hello ${data.name}, thank you for your enquiry about ${data.service || "our services"}. Reference: ${data.referenceId}`)}" style="background: #25D366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reply on WhatsApp</a>
            <a href="tel:+9779813714582" style="background: #0a1a38; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Call Client</a>
          </div>
        </div>
        <p style="margin: 24px 0 0; font-size: 12px; color: #64748b;">Form type: ${data.formType} · Received at ${new Date().toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
New Enquiry Received — Prixna IT Solution

Reference ID: ${data.referenceId}
Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email}` : ""}
${data.company ? `Company: ${data.company}` : ""}
${data.location ? `Location: ${data.location}` : ""}
${data.service ? `Service Interest: ${data.service}` : ""}
${data.preferredDate ? `Preferred Date: ${data.preferredDate}` : ""}
${data.contactVia ? `Contact Via: ${data.contactVia}` : ""}

Message:
${data.message}

Form type: ${data.formType}
Received at: ${new Date().toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })}
  `.trim();

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping admin notification email");
    return { success: false, error: "Email not configured" };
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `New Enquiry: ${data.name} — ${data.service || "General"} (${data.referenceId})`,
      html,
      text,
      replyTo: data.email || undefined,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send lead notification email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendAutoReplyEmail(data: LeadEmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || !data.email) {
    return { success: false, error: "Email not configured or no recipient email" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a2230; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0a1a38; color: #ffffff; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Thank You for Contacting Us</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p>Dear ${data.name.split(" ")[0]},</p>
        <p>We've received your enquiry and our team will review it shortly. Here's a summary of what you submitted:</p>
        <div style="background: #f0f4f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>Reference ID:</strong> ${data.referenceId}</p>
          <p style="margin: 0 0 8px;"><strong>Service Interest:</strong> ${data.service || "General Consultation"}</p>
          <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })}</p>
        </div>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our team will call you back on <strong>${data.phone}</strong> during business hours (Sun–Fri, 9:30 AM – 6:30 PM)</li>
          <li>We'll discuss your requirements and recommend a suitable solution</li>
          <li>If needed, we'll schedule a free consultation or site visit</li>
        </ul>
        <p>Prefer to chat on WhatsApp? <a href="https://wa.me/9779813714582" style="color: #1e8bff;">Message us directly</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #64748b;">Prixna IT Solution Pvt. Ltd. · Koteshwor-32, Kathmandu, Nepal · +977 9813714582</p>
      </div>
    </body>
    </html>
  `;

  const resend = getResend();
  if (!resend) {
    return { success: false, error: "Email not configured" };
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `We received your enquiry — Reference: ${data.referenceId}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send auto-reply email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}