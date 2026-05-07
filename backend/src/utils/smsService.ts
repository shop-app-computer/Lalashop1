/**
 * SMS Service to handle sending OTP via different providers.
 * You can configure your provider in .env
 */

export const sendSMS = async (phone: string, message: string) => {
  const provider = process.env.SMS_PROVIDER || "LOG"; // Default to LOG if not configured

  try {
    switch (provider.toUpperCase()) {
      case "THAIBULKSMS":
        return await sendThaiBulkSMS(phone, message);
      case "LOG":
      default:
        console.log("-----------------------------------------");
        console.log(`[SMS LOG] To: ${phone}`);
        console.log(`[SMS LOG] Message: ${message}`);
        console.log("-----------------------------------------");
        return { success: true, message: "Logged to console" };
    }
  } catch (error: any) {
    console.error("SMS Sending Error:", error.message);
    throw new Error("Failed to send SMS. Please check SMS configuration.");
  }
};

/**
 * Example implementation for ThaiBulkSMS (Popular in Thailand)
 */
const sendThaiBulkSMS = async (phone: string, message: string) => {
  const apiKey = process.env.SMS_API_KEY;
  const apiSecret = process.env.SMS_API_SECRET;
  const sender = process.env.SMS_SENDER || "LALA";

  if (!apiKey || !apiSecret) {
    throw new Error("ThaiBulkSMS API Key or Secret is missing in .env");
  }

  const response = await fetch("https://api-v2.thaibulksms.com/sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`
    },
    body: new URLSearchParams({
      msisdn: phone,
      message: message,
      sender: sender,
    })
  });

  const data = await response.json();
  return data;
};
