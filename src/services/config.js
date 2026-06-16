// API base URL.
// Override per-environment with REACT_APP_API_BASE (CRA reads this from .env / the shell).
// Falls back to the local backend on port 4000 (3000/3001 are taken by other apps locally).
const api_base = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
// Production example: REACT_APP_API_BASE=https://caterkart-api.onrender.com

export const verify_api_base = `${api_base}/verify`;
export const order_api_base = `${api_base}/order`;
export const food_api_base = `${api_base}/food`;
export const services_api_base = `${api_base}/services`;
export const combos_api_base = `${api_base}/combos`;
export const vendors_api_base = `${api_base}/vendors`;
export const admins_api_base = `${api_base}/admins`;
export const pincodes_api_base = `${api_base}/pincodes`;
export const reviews_api_base = `${api_base}/reviews`;
export const subscriptions_api_base = `${api_base}/subscriptions`;
export const payments_api_base = `${api_base}/payments`;
