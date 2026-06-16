import axios from 'axios';
import { payments_api_base } from './config';

// Create a Razorpay order for a CaterKart order. kind = 'advance' | 'balance' | 'full'.
// Returns { orderId, amount, currency, keyId, name, description, prefill }.
export const createOrderPayment = async (orderId, kind = 'advance') => {
    const res = await axios.post(`${payments_api_base}/order/${encodeURIComponent(orderId)}`, { kind });
    return res.data;
};

// Verify the Checkout signature server-side and mark the order paid.
export const verifyPayment = async (payload) => {
    const res = await axios.post(`${payments_api_base}/verify`, payload);
    return res.data;
};

// Create a hosted Razorpay payment link for an order (Razorpay notifies the
// customer over SMS/email). Returns { url, id, amount }.
export const createPaymentLink = async (orderId, kind = 'balance') => {
    const res = await axios.post(`${payments_api_base}/order/${encodeURIComponent(orderId)}/link`, { kind });
    return res.data;
};

// Create a hosted Razorpay payment link for an explicit amount + customer.
// Used by subscription weekly billing (not tied to an order). Returns { url, id, amount }.
export const createDirectPaymentLink = async (payload) => {
    const res = await axios.post(`${payments_api_base}/link`, payload);
    return res.data;
};

// Reconcile an order's payment status from Razorpay (covers local/dev where the
// webhook can't reach the server). Returns the updated order doc.
export const syncOrderPayment = async (orderId) => {
    const res = await axios.post(`${payments_api_base}/order/${encodeURIComponent(orderId)}/sync`);
    return res.data;
};

// Inject the Razorpay Checkout SDK once (same pattern as zinroute).
export const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load payment SDK'));
    document.head.appendChild(s);
});

/**
 * Full one-shot flow: create the Razorpay order, open Checkout, verify on success.
 * Resolves with the verify response, or rejects with Error('__dismissed__') if the
 * user closes the modal.
 */
export const payForOrder = async (orderId, kind = 'advance') => {
    await loadRazorpay();
    const params = await createOrderPayment(orderId, kind);

    return new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: params.keyId,
            order_id: params.orderId,
            amount: params.amount,
            currency: params.currency,
            name: params.name || 'CaterKart',
            description: params.description || 'Order payment',
            prefill: params.prefill || {},
            theme: { color: '#ec430d' },
            handler: async (response) => {
                try {
                    const verified = await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    resolve(verified);
                } catch (err) {
                    reject(err);
                }
            },
            modal: { ondismiss: () => reject(new Error('__dismissed__')) },
        });
        rzp.open();
    });
};
