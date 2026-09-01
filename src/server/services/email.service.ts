export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey = process.env.RESEND_API_KEY;
  private fromEmail = process.env.RESEND_FROM_EMAIL || 'concierge@sultanhookah.com';
  private fromName = process.env.RESEND_FROM_NAME || 'Sultan Hookah Co.';

  public async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const formattedFrom = `${this.fromName} <${this.fromEmail}>`;

    if (this.apiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            from: formattedFrom,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text
          })
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('[EmailService] Resend API error:', data);
          return { success: false };
        }
        return { success: true, messageId: data.id };
      } catch (err) {
        console.error('[EmailService] Failed to send email via Resend:', err);
        return { success: false };
      }
    }

    // In development / demo environment without live key: log cleanly
    console.log(`[EmailService - Sandbox Delivery] To: ${options.to} | Subject: "${options.subject}"`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  public async sendOTP(email: string, otpCode: string): Promise<boolean> {
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfcfd; color: #121417;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #121417; text-transform: uppercase;">Sultan Hookah Co.</h1>
          <p style="color: #71717a; font-size: 13px; letter-spacing: 1px;">HAUTE SHISHA & LUXURY SMOKING ARTIFACTS</p>
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="font-size: 18px; font-weight: 600; margin-top: 0;">Your Verification Security Code</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #52525b;">Use the 6-digit one-time passkey below to securely access your customer portal. This code is valid for 10 minutes and should not be shared.</p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #09090b; background-color: #f4f4f5; padding: 14px 28px; border-radius: 6px; border: 1px solid #d4d4d8;">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 0;">If you did not request this passkey, please disregard this transmission immediately.</p>
        </div>
      </div>
    `;

    const res = await this.sendEmail({
      to: email,
      subject: `Your Sultan Hookah Security Passkey: ${otpCode}`,
      html,
      text: `Your Sultan Hookah verification code is ${otpCode}. It expires in 10 minutes.`
    });

    return res.success;
  }

  public async sendOrderConfirmation(email: string, orderData: { orderNumber: string; total: number; customerName: string }): Promise<boolean> {
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfcfd; color: #121417;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #121417; text-transform: uppercase;">Sultan Hookah Co.</h1>
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #15803d;">Order Confirmed: #${orderData.orderNumber}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #52525b;">Thank you, ${orderData.customerName}. Your order has been placed and is currently being prepared with double-boxed anti-break luxury packing.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 600;">Total Charged: $${orderData.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    `;

    const res = await this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderData.orderNumber} | Sultan Hookah Co.`,
      html,
      text: `Thank you for your order #${orderData.orderNumber}. Total: $${orderData.total.toFixed(2)}.`
    });

    return res.success;
  }

  public async sendPasswordReset(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfcfd;">
        <div style="background: #fff; border: 1px solid #e4e4e7; padding: 32px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Password Reset Request</h2>
          <p style="color: #52525b; font-size: 14px;">Click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #18181b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #a1a1aa;">Direct link: ${resetUrl}</p>
        </div>
      </div>
    `;

    const res = await this.sendEmail({
      to: email,
      subject: 'Reset your Sultan Hookah account password',
      html,
      text: `Reset your password by visiting: ${resetUrl}`
    });

    return res.success;
  }
}

export const emailService = new EmailService();
