import axios from 'axios';
import { api_base } from './config';

const order_api_base = `${api_base}/order`

export const createOrder = async (order) => {
    try {
        const response = await axios.post(order_api_base, order);
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}

export const fetchAllOrders = async () => {
    try {
        const response = await axios.get(order_api_base);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const fetchOrderById = async (id) => {
    try {
        const response = await axios.get(`${order_api_base}/${encodeURIComponent(id)}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const updateOrder = async (id, order) => {
    try {
        const response = await axios.put(`${order_api_base}/${encodeURIComponent(id)}`, order);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
