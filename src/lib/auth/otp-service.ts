import nodemailer from "nodemailer";

export interface SendOtpResult {
  success: boolean;
  channel: "email" | "sms";
  target: string;
  deliveredReal: boolean;
  provider?: string;
  message: string;
  error?: string;
}

/**
 * Dispatches a real branded email containing the 6-digit OTP passcode
 */
export async function sendRealEmailOtp(
  recipientEmail: string,
  otpCode: string,
  userName: string = "Focus Forge Scholar"
): Promise<SendOtpResult> {
  // 1. Try Resend API if key is provided
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || "Focus Forge <auth@focusforge.io>",
          to: [recipientEmail],
          subject: `${otpCode} is your Focus Forge Verification Code`,
          html: getEmailHtmlTemplate(otpCode, userName),
        }),
      });

      if (response.ok) {
        return {
          success: true,
          channel: "email",
          target: recipientEmail,
          deliveredReal: true,
          provider: "Resend",
          message: `Real verification email delivered to ${recipientEmail}`,
        };
      }
    } catch (err: any) {
      console.warn("Resend email dispatch error, falling back to SMTP:", err.message);
    }
  }

  // 2. Try Nodemailer SMTP (Gmail, Brevo, SendGrid, Amazon SES, Custom SMTP)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Focus Forge" <${smtpUser}>`,
        to: recipientEmail,
        subject: `[Focus Forge] ${otpCode} - Your Verification Code`,
        html: getEmailHtmlTemplate(otpCode, userName),
        text: `Your Focus Forge 6-digit verification code is: ${otpCode}. Valid for 10 minutes.`,
      });

      return {
        success: true,
        channel: "email",
        target: recipientEmail,
        deliveredReal: true,
        provider: "SMTP",
        message: `Real verification email dispatched to ${recipientEmail}`,
      };
    } catch (smtpErr: any) {
      console.error("SMTP error dispatching email:", smtpErr);
      return {
        success: false,
        channel: "email",
        target: recipientEmail,
        deliveredReal: false,
        error: smtpErr.message,
        message: `Failed to deliver email via SMTP: ${smtpErr.message}`,
      };
    }
  }

  return {
    success: true,
    channel: "email",
    target: recipientEmail,
    deliveredReal: false,
    provider: "Local Development / Sandbox",
    message: `SMTP / Resend credentials not configured in .env.local. OTP code generated: ${otpCode}`,
  };
}

/**
 * Dispatches a real SMS containing the 6-digit OTP passcode
 */
export async function sendRealSmsOtp(
  phoneNumber: string,
  otpCode: string
): Promise<SendOtpResult> {
  const cleanPhone = phoneNumber.replace(/\s+/g, "");

  // 1. Try Twilio REST API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        To: cleanPhone,
        From: twilioFrom,
        Body: `[Focus Forge] Your 6-digit authentication passcode is: ${otpCode}. Valid for 10 minutes. Do not share this code.`,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          channel: "sms",
          target: phoneNumber,
          deliveredReal: true,
          provider: "Twilio",
          message: `Real SMS dispatched to ${phoneNumber}`,
        };
      } else {
        throw new Error(data.message || "Twilio error");
      }
    } catch (twilioErr: any) {
      console.error("Twilio SMS dispatch failed:", twilioErr);
      return {
        success: false,
        channel: "sms",
        target: phoneNumber,
        deliveredReal: false,
        error: twilioErr.message,
        message: `Twilio SMS failed: ${twilioErr.message}`,
      };
    }
  }

  // 2. Try Fast2SMS (Popular for Indian Mobile Numbers +91)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && (cleanPhone.startsWith("+91") || cleanPhone.length === 10)) {
    try {
      const normalizedNumber = cleanPhone.replace("+91", "");
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpCode,
          numbers: normalizedNumber,
        }),
      });

      const data = await res.json();
      if (data.return) {
        return {
          success: true,
          channel: "sms",
          target: phoneNumber,
          deliveredReal: true,
          provider: "Fast2SMS",
          message: `Real SMS delivered to ${phoneNumber}`,
        };
      }
    } catch (f2sErr: any) {
      console.error("Fast2SMS error:", f2sErr);
    }
  }

  return {
    success: true,
    channel: "sms",
    target: phoneNumber,
    deliveredReal: false,
    provider: "Local Development / Sandbox",
    message: `Twilio/Fast2SMS credentials not configured in .env.local. OTP code generated: ${otpCode}`,
  };
}

/**
 * Beautiful Crimson & Obsidian Dark Theme Email Template
 */
function getEmailHtmlTemplate(otpCode: string, userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Focus Forge Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520px" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0D0D0D; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(255, 42, 77, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1A1A1A;">
              <div style="display: inline-block; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">
                <span style="color: #FF2A4D;">⚡ FOCUS</span> FORGE
              </div>
              <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                Identity Verification Protocol
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0;">
                Hello, ${userName}
              </h2>
              <p style="font-size: 14px; line-height: 22px; color: #A1A1AA; margin: 0 0 24px 0;">
                Use the following 6-digit verification code to authenticate your Focus Forge account and retrieve your verified study records.
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #141414; border: 1px solid #FF2A4D40; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #FF2A4D; text-shadow: 0 0 20px rgba(255, 42, 77, 0.5);">
                  ${otpCode}
                </div>
                <div style="font-size: 12px; color: #71717A; margin-top: 8px;">
                  Expires in 10 minutes • Do not share this code with anyone
                </div>
              </div>

              <p style="font-size: 12px; line-height: 18px; color: #71717A; margin: 0;">
                If you did not request this verification code, please disregard this email. Your account remains protected.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #080808; border-top: 1px solid #1A1A1A; text-align: center;">
              <p style="font-size: 11px; color: #52525B; margin: 0;">
                Focus Forge Inc. • Forge your focus. Build your future.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
