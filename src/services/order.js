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

export const updateOrder = async (id, order) => {
    const response = await axios.put(`${order_api_base}/${encodeURIComponent(id)}`, order);
    return response.data;
};
