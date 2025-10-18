import axios from 'axios';
import { services_api_base } from './config';

export const fetchServicesByEvent = async (event) => {
    try {
        const response = await axios.get(`${services_api_base}/${event}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const fetchInventory = async (category) => {
    try {
        const response = await axios.get(`${services_api_base}/inventory/${category}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const deleteService = async (category, id) => {
    try {
        const response = await axios.delete(`${services_api_base}/inventory/${category}/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const updateService = async (category, item) => {
    try {
        const response = await axios.put(`${services_api_base}/inventory/${category}/${item._id}`, item);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

