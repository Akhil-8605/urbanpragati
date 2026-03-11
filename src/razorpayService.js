/**
 * Razorpay Payment Service
 * Handles payment processing, order creation, and payment verification
 * 
 * Configuration needed in .env:
 * REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
 */

// ─── LOAD RAZORPAY SCRIPT ──────────────────────────────────────────────────────
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
export const createRazorpayOrder = async (amount, description) => {
    try {
        // In a real implementation, this would call your backend API
        // For demo purposes, return a mock order
        return {
            id: `order_${Date.now()}`,
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
    } catch (error) {
        console.error('[v0] Error creating Razorpay order:', error);
        throw error;
    }
};

// ─── PROCESS RAZORPAY PAYMENT ──────────────────────────────────────────────────
export const processRazorpayPayment = async (options) => {
    const {
        orderId,
        amount,
        description,
        ownerName,
        email,
        phone,
        onSuccess,
        onError,
    } = options;

    try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            throw new Error('Razorpay script failed to load');
        }

        const razorpay = window.Razorpay;
        if (!razorpay) {
            throw new Error('Razorpay is not available');
        }

        const paymentOptions = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_id',
            order_id: orderId,
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            name: 'Urban Pragati',
            description: description,
            prefill: {
                name: ownerName,
                email: email,
                contact: phone,
            },
            theme: {
                color: '#FF6F00', // Urban Pragati saffron color
            },
            handler: (response) => {
                // Payment successful
                if (onSuccess) {
                    onSuccess(response);
                }
            },
            modal: {
                ondismiss: () => {
                    if (onError) {
                        onError({ error: 'Payment cancelled by user' });
                    }
                },
            },
        };

        const paymentWindow = new razorpay(paymentOptions);
        paymentWindow.open();
    } catch (error) {
        console.error('[v0] Error processing Razorpay payment:', error);
        if (onError) {
            onError(error);
        }
    }
};

// ─── VERIFY RAZORPAY PAYMENT ──────────────────────────────────────────────────
export const verifyRazorpayPayment = async (paymentResponse) => {
    try {
        // In a real implementation, this would call your backend API
        // Backend would verify using Razorpay API signature
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = paymentResponse;

        // Verify signature (should be done on backend for security)
        return {
            verified: true,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        };
    } catch (error) {
        console.error('[v0] Error verifying payment:', error);
        throw error;
    }
};

// ─── GET PAYMENT GATEWAY KEY ──────────────────────────────────────────────────
export const getRazorpayKeyId = () => {
    const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!keyId) {
        console.warn('[v0] Razorpay Key ID not found in environment variables');
        return 'rzp_test_id'; // Fallback for demo
    }
    return keyId;
};

// ─── FORMAT AMOUNT FOR DISPLAY ─────────────────────────────────────────────────
export const formatPaymentAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};
