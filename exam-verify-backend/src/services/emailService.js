import logger from '../utils/logger.js';

/**
 * Email notification service for ExamVerify.
 *
 * In production, connect a transactional email provider (SendGrid, Mailgun, SES, etc.)
 * by setting EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS env vars.
 *
 * In development, emails are logged to the console.
 */

const APP_NAME = 'ExamVerify';
const FROM_ADDRESS = process.env.EMAIL_FROM || 'noreply@examverify.edu.ng';

// Simple HTML email wrapper
const wrapHtml = (title, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:#141413;padding:24px 32px;">
      <h1 style="margin:0;color:#faf9f5;font-size:20px;letter-spacing:-0.3px;">${APP_NAME}</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#141413;font-size:18px;">${title}</h2>
      ${body}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. Digitizing Academic Integrity.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send an email. Falls back to console logging in dev mode.
 */
const sendEmail = async ({ to, subject, html }) => {
  // Check if email transport is configured
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    try {
      // Dynamic import to avoid hard dependency
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `${APP_NAME} <${FROM_ADDRESS}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Email send failed to ${to}:`, error);
      return false;
    }
  }

  // Dev fallback: log to console
  logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`);
  return true;
};

/**
 * Send welcome email after registration.
 */
export const sendWelcomeEmail = async (user) => {
  const html = wrapHtml(
    `Welcome to ${APP_NAME}!`,
    `
    <p style="color:#374151;line-height:1.7;">Hi <strong>${user.name}</strong>,</p>
    <p style="color:#374151;line-height:1.7;">
      Your account has been created successfully. You can now log in and complete
      your student registration for exam clearance.
    </p>
    <div style="margin:24px 0;text-align:center;">
      <a href="${process.env.CLIENT_URL}/auth/login"
         style="display:inline-block;padding:12px 28px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Log In to Your Account
      </a>
    </div>
    <p style="color:#9ca3af;font-size:13px;">If you didn't create this account, please ignore this email.</p>
    `
  );

  return sendEmail({ to: user.email, subject: `Welcome to ${APP_NAME}`, html });
};

/**
 * Notify student that payment has been verified.
 */
export const sendPaymentConfirmation = async (student, payment) => {
  const html = wrapHtml(
    'Payment Confirmed',
    `
    <p style="color:#374151;line-height:1.7;">Hi <strong>${student.name}</strong>,</p>
    <p style="color:#374151;line-height:1.7;">
      Your payment has been verified successfully.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;color:#166534;font-weight:600;">Payment Details</p>
      <p style="margin:0;color:#374151;font-size:14px;">
        Reference: <strong>${payment.rrr || payment.orderId}</strong><br>
        Amount: <strong>&#8358;${payment.amount?.toLocaleString()}</strong><br>
        Status: <strong style="color:#16a34a;">Completed</strong>
      </p>
    </div>
    <p style="color:#374151;line-height:1.7;">
      You can now generate your QR exam entry pass from your dashboard.
    </p>
    <div style="margin:24px 0;text-align:center;">
      <a href="${process.env.CLIENT_URL}/student/qr-code"
         style="display:inline-block;padding:12px 28px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Generate QR Pass
      </a>
    </div>
    `
  );

  return sendEmail({ to: student.email, subject: `${APP_NAME} — Payment Confirmed`, html });
};

/**
 * Notify student of verification result (approved or denied).
 */
export const sendVerificationResult = async (student, verification) => {
  const isApproved = verification.status === 'approved';
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusLabel = isApproved ? 'Approved' : 'Denied';
  const bgColor = isApproved ? '#f0fdf4' : '#fef2f2';
  const borderColor = isApproved ? '#bbf7d0' : '#fecaca';

  const html = wrapHtml(
    `Exam Entry ${statusLabel}`,
    `
    <p style="color:#374151;line-height:1.7;">Hi <strong>${student.name}</strong>,</p>
    <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;color:${statusColor};font-weight:700;font-size:16px;">
        Entry ${statusLabel}
      </p>
      <p style="margin:0;color:#374151;font-size:14px;">
        Hall: <strong>${verification.examHall || 'N/A'}</strong><br>
        Time: <strong>${new Date(verification.verifiedAt).toLocaleString()}</strong>
        ${verification.denialReason ? `<br>Reason: <strong>${verification.denialReason}</strong>` : ''}
        ${verification.notes ? `<br>Notes: ${verification.notes}` : ''}
      </p>
    </div>
    ${!isApproved ? `
    <p style="color:#374151;line-height:1.7;">
      If you believe this was an error, please contact your department's exam officer.
    </p>
    ` : ''}
    `
  );

  return sendEmail({ to: student.email, subject: `${APP_NAME} — Exam Entry ${statusLabel}`, html });
};

/**
 * Notify student that their QR code has been generated.
 */
export const sendQRGeneratedEmail = async (student) => {
  const html = wrapHtml(
    'Your Exam Pass is Ready',
    `
    <p style="color:#374151;line-height:1.7;">Hi <strong>${student.name}</strong>,</p>
    <p style="color:#374151;line-height:1.7;">
      Your secure QR exam entry pass has been generated and is ready for use.
      Please download and print it before your examination.
    </p>
    <div style="margin:24px 0;text-align:center;">
      <a href="${process.env.CLIENT_URL}/student/qr-code"
         style="display:inline-block;padding:12px 28px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        View &amp; Download Pass
      </a>
    </div>
    <p style="color:#9ca3af;font-size:13px;">
      Your QR pass is valid for 30 days and is secured with AES-256 encryption.
    </p>
    `
  );

  return sendEmail({ to: student.email, subject: `${APP_NAME} — Exam Pass Ready`, html });
};

export default {
  sendWelcomeEmail,
  sendPaymentConfirmation,
  sendVerificationResult,
  sendQRGeneratedEmail,
};
