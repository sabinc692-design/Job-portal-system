import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApplicationStatusEmailPayload {
  /** Job seeker's email address (recipient) */
  to: string;
  /** Job seeker's full name */
  applicantName: string;
  /** Job title they applied for */
  jobTitle: string;
  /** Company name */
  companyName: string;
  /** Recruiter / employer email – used as From + Reply-To */
  employerEmail: string;
  /** Recruiter / employer display name */
  employerName: string;
  /** Application status: "HIRED" | "REJECTED" | "SHORTLISTED" | "INTERVIEW" | "REVIEWING" */
  status: string;
  /** Optional internal notes from the recruiter */
  notes?: string;
}

// ---------------------------------------------------------------------------
// Transporter factory – creates a Gmail transporter using the EMPLOYER's email
// ---------------------------------------------------------------------------

function createTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass, // Gmail App Password for the employer account
    },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

// ---------------------------------------------------------------------------
// Status-specific copy helpers
// ---------------------------------------------------------------------------

function getStatusDetails(status: string): {
  subject: string;
  headline: string;
  body: string;
  color: string;
  emoji: string;
} {
  switch (status) {
    case "HIRED":
      return {
        subject: "🎉 Congratulations! You've been selected",
        headline: "You have been selected for the role!",
        body: "We are thrilled to inform you that after a thorough review of your application and qualifications, we have decided to move forward with an offer. We were truly impressed by your skills and experience, and we look forward to having you join our team.",
        color: "#10b981",
        emoji: "🎉",
      };
    case "REJECTED":
      return {
        subject: "Update on your job application",
        headline: "Thank you for your application",
        body: "After careful consideration of your application and reviewing all candidates, we regret to inform you that we will not be moving forward with your application at this time. We appreciate the time and effort you invested in this process, and we encourage you to apply for future openings that match your profile.",
        color: "#ef4444",
        emoji: "📋",
      };
    case "SHORTLISTED":
      return {
        subject: "✅ You've been shortlisted!",
        headline: "Great news — you're shortlisted!",
        body: "We are pleased to inform you that your application has been reviewed and you have been shortlisted for the position. Our team was impressed by your profile, and we will be in touch shortly with the next steps.",
        color: "#8b5cf6",
        emoji: "✅",
      };
    case "INTERVIEW":
      return {
        subject: "📅 Interview Invitation",
        headline: "You've been invited for an interview!",
        body: "Congratulations! We would like to invite you to an interview for the position. We were impressed with your application and would love to learn more about your experience and qualifications. Please reply to this email to coordinate a suitable date and time.",
        color: "#f59e0b",
        emoji: "📅",
      };
    case "REVIEWING":
      return {
        subject: "Your application is being reviewed",
        headline: "Your application is under review",
        body: "We wanted to let you know that your application is currently being reviewed by our hiring team. We appreciate your patience and will update you on the status as soon as possible.",
        color: "#3b82f6",
        emoji: "🔍",
      };
    default:
      return {
        subject: "Update on your application",
        headline: "Application Status Update",
        body: "We have an update regarding your application. Please check your portal for the latest status.",
        color: "#6b7280",
        emoji: "📢",
      };
  }
}

// ---------------------------------------------------------------------------
// HTML email builder
// ---------------------------------------------------------------------------

function buildEmailHtml(payload: ApplicationStatusEmailPayload, details: ReturnType<typeof getStatusDetails>): string {
  const safe = {
    applicantName: escapeHtml(payload.applicantName), jobTitle: escapeHtml(payload.jobTitle),
    companyName: escapeHtml(payload.companyName), employerName: escapeHtml(payload.employerName),
    notes: payload.notes ? escapeHtml(payload.notes) : "",
  };
  const notesBlock = safe.notes
    ? `
    <div style="margin-top:24px; padding:16px; background:#f9fafb; border-left:4px solid ${details.color}; border-radius:0 8px 8px 0;">
      <p style="margin:0 0 6px 0; font-size:12px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.05em;">Note from Recruiter</p>
      <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6;">${safe.notes}</p>
    </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${details.subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, ${details.color}, ${details.color}cc); padding:36px 40px; text-align:center;">
              <div style="font-size:48px; margin-bottom:12px;">${details.emoji}</div>
              <h1 style="margin:0; font-size:22px; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                ${details.headline}
              </h1>
              <p style="margin:8px 0 0 0; font-size:14px; color:rgba(255,255,255,0.85);">
                Application for <strong>${safe.jobTitle}</strong> at <strong>${safe.companyName}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px 0; font-size:16px; color:#111827; font-weight:600;">
                Dear ${safe.applicantName},
              </p>
              <p style="margin:0 0 20px 0; font-size:14px; color:#4b5563; line-height:1.7;">
                ${details.body}
              </p>

              <!-- Job Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:0; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px 0; font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em;">Position Applied</p>
                    <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">${safe.jobTitle}</p>
                    <p style="margin:4px 0 0 0; font-size:13px; color:#6b7280;">${safe.companyName}</p>
                  </td>
                </tr>
              </table>

              ${notesBlock}

              <p style="margin:28px 0 0 0; font-size:14px; color:#4b5563; line-height:1.7;">
                If you have any questions or need further information, please feel free to reply directly to this email.
              </p>

              <p style="margin:20px 0 0 0; font-size:14px; color:#374151;">
                Best regards,<br/>
                <strong style="color:#111827;">${safe.employerName}</strong><br/>
                <span style="color:#6b7280; font-size:13px;">${safe.companyName}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 40px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                This email was sent via <strong>JobPortal</strong> on behalf of ${safe.companyName}.<br/>
                You are receiving this because you applied for a position through our platform.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Sends an application status email FROM the employer's Gmail account TO the job seeker.
 *
 * Requirements: The employer must have a Gmail account with an App Password.
 * The employer's email & App Password are fetched from env vars set at runtime,
 * but here we accept them as parameters so individual employer credentials can be used.
 *
 * Since we cannot hold individual App Passwords per employer, we use the platform's
 * configured Gmail credentials but set the employer's email as the Reply-To and
 * display name so replies go directly to the recruiter.
 */
export async function sendApplicationStatusEmail(
  payload: ApplicationStatusEmailPayload
): Promise<void> {
  // Platform Gmail credentials from environment
  const platformUser = process.env.GMAIL_USER;
  const platformPass = process.env.GMAIL_APP_PASSWORD;

  if (!platformUser || !platformPass) {
    console.warn(
      "[EmailService] GMAIL_USER or GMAIL_APP_PASSWORD not configured. Skipping email notification."
    );
    return;
  }

  const details = getStatusDetails(payload.status);
  const html = buildEmailHtml(payload, details);

  const transporter = createTransporter(platformUser, platformPass);

  const mailOptions = {
    // From shows the employer's name + company, sent via platform account
    from: `"${payload.employerName || process.env.GMAIL_FROM_NAME || "Job-Portal System"}" <${platformUser}>`,
    // Replies go directly to the employer (recruiter)
    replyTo: `"${payload.employerName}" <${payload.employerEmail}>`,
    to: payload.to,
    subject: `${details.subject} — ${payload.jobTitle} at ${payload.companyName}`,
    html,
    text: `Dear ${payload.applicantName},\n\n${details.body}\n\nPosition: ${payload.jobTitle} at ${payload.companyName}\n\nBest regards,\n${payload.employerName}\n${payload.companyName}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[EmailService] Status email (${payload.status}) sent to ${payload.to} — MessageId: ${info.messageId}`
    );
  } catch (error: any) {
    // Don't throw — email failure should NOT block the status update
    console.error(
      `[EmailService] Failed to send email to ${payload.to}:`,
      error?.message || error
    );
  }
}
