// Mock Payment Service (e.g. for Stripe or PayPal integration)
export const processPayment = async (amount: number, currency: string = "THB") => {
    try {
        // Logic to connect to payment gateway
        console.log(`Processing payment of ${amount} ${currency}`);
        return { success: true, transactionId: "trans_" + Date.now() };
    } catch (error) {
        throw new Error("Payment failed: " + error);
    }
};

export const refundPayment = async (transactionId: string) => {
    // Logic for refunds
    return { success: true, message: `Refund processed for ${transactionId}` };
};
