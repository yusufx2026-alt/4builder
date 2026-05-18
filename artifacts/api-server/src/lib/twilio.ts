import { logger } from "./logger";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<string> {
  const otp = generateOtp();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && from) {
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);
    await client.messages.create({
      body: `4Builder verification code: ${otp}`,
      from,
      to: phone,
    });
    logger.info({ phone }, "OTP sent via Twilio");
  } else {
    logger.info({ phone, otp }, "DEV MODE — Twilio not configured, OTP logged");
  }

  return otp;
}
