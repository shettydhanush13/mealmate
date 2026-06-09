import axios from 'axios';
import { services_api_base } from './config';

export const fetchServicesByEvent = async (event) => {
    const response = await axios.get(`${services_api_base}/${encodeURIComponent(event)}`);
    return response.data;
};

export const fetchInventory = async (category) => {
    const response = await axios.get(
        `${services_api_base}/inventory/${encodeURIComponent(category)}`,
    );
    return response.data;
};

export const deleteService = async (category, id) => {
    const response = await axios.delete(
        `${services_api_base}/inventory/${encodeURIComponent(category)}/${encodeURIComponent(id)}`,
    );
    return response.data;
};

export const updateService = async (category, item) => {
    const response = await axios.put(
        `${services_api_base}/inventory/${encodeURIComponent(category)}/${encodeURIComponent(item._id)}`,
        item,
    );
    return response.data;
};
