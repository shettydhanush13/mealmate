import axios from 'axios';
import { order_api_base } from './config';

export const createOrder = async (order) => {
    const response = await axios.post(order_api_base, order);
    return response.data;
};

export const fetchAllOrders = async (params = {}) => {
    const response = await axios.get(order_api_base, { params });
    return response.data;
};

export const fetchOrderById = async (id) => {
    const response = await axios.get(`${order_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};

export const fetchOrdersByPhone = async (phone) => {
    const response = await axios.get(`${order_api_base}/track/${encodeURIComponent(phone)}`);
    return response.data;
};

export const updateOrder = async (id, order) => {
    const response = await axios.put(`${order_api_base}/${encodeURIComponent(id)}`, order);
    return response.data;
};

// Assign (once) and return the order's sequential GST invoice number.
// Idempotent on the server — safe to call again; returns the existing number.
export const assignOrderInvoice = async (id) => {
    const response = await axios.post(`${order_api_base}/${encodeURIComponent(id)}/invoice`);
    return response.data; // { invoiceNo }
};

// Sequential vendor commission tax-invoice number (idempotent).
export const assignCommissionInvoice = async (id) => {
    const response = await axios.post(`${order_api_base}/${encodeURIComponent(id)}/commission-invoice`);
    return response.data; // { commissionInvoiceNo }
};

// Sequential vendor payout-statement number (idempotent).
export const assignPayoutNo = async (id) => {
    const response = await axios.post(`${order_api_base}/${encodeURIComponent(id)}/payout`);
    return response.data; // { payoutNo }
};
