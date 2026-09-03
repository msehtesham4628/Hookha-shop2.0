export interface SendSMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private provider = process.env.SMS_PROVIDER || 'twilio';

  public async sendSMS(options: SendSMSOptions): Promise<{ success: boolean; messageId?: string }> {
    if (this.provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', options.to);
        params.append('From', process.env.TWILIO_FROM_NUMBER || '+18007858260');
        params.append('Body', options.message);

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('[SMSService] Twilio error:', data);
          return { success: false };
        }
        return { success: true, messageId: data.sid };
      } catch (err) {
        console.error('[SMSService] Twilio exception:', err);
        return { success: false };
      }
    } else if (this.provider === 'msg91' && process.env.MSG91_AUTH_KEY) {
      try {
        const res = await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authkey: process.env.MSG91_AUTH_KEY
          },
          body: JSON.stringify({
            template_id: process.env.MSG91_TEMPLATE_ID,
            sender: process.env.MSG91_SENDER_ID || 'SULTAN',
            mobiles: options.to.replace(/\D/g, '')
          })
        });

        const data = await res.json();
        return { success: res.ok, messageId: data.request_id };
      } catch (err) {
        console.error('[SMSService] MSG91 exception:', err);
        return { success: false };
      }
    }

    // Development & sandbox simulated SMS transmission
    console.log(`[SMSService - Sandbox SMS] Dispatched to: ${options.to} | Message: "${options.message}"`);
    return { success: true, messageId: `sms_sandbox_${Date.now()}` };
  }

  public async sendOTP(phone: string, otpCode: string): Promise<boolean> {
    const res = await this.sendSMS({
      to: phone,
      message: `Fumare Hookah Verification Code: ${otpCode}. Valid for 10 minutes. Do not share.`
    });
    return res.success;
  }
}

export const smsService = new SMSService();
