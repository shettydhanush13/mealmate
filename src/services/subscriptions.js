import axios from 'axios';
import { subscriptions_api_base } from './config';

// Create a subscription enquiry (a lead — the team follows up with a quote).
export const createSubscription = async (payload) => {
    const response = await axios.post(subscriptions_api_base, payload);
    return response.data;
};

// Admin: list enquiries. Returns { data, page, limit, total }.
export const fetchSubscriptions = async (params = {}) => {
    const response = await axios.get(subscriptions_api_base, { params });
    return response.data;
};

// Admin: a single enquiry by id.
export const fetchSubscriptionById = async (id) => {
    const response = await axios.get(`${subscriptions_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};

// Admin: update status / internal notes.
export const updateSubscription = async (id, patch) => {
    const response = await axios.put(`${subscriptions_api_base}/${encodeURIComponent(id)}`, patch);
    return response.data;
};

// Allocate (once) the sequential weekly tax-invoice number for a given week.
export const assignSubscriptionWeekInvoice = async (id, week) => {
    const response = await axios.post(`${subscriptions_api_base}/${encodeURIComponent(id)}/invoice`, { week });
    return response.data; // { week, invoiceNo }
};
