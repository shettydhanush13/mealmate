import axios from 'axios';
import { vendors_api_base } from './config';

export const fetchVendors = async () => {
    const response = await axios.get(vendors_api_base);
    return response.data;
};

export const createVendor = async (vendor) => {
    const response = await axios.post(vendors_api_base, vendor);
    return response.data;
};

export const updateVendor = async (id, vendor) => {
    const response = await axios.put(`${vendors_api_base}/${encodeURIComponent(id)}`, vendor);
    return response.data;
};

export const deleteVendor = async (id) => {
    const response = await axios.delete(`${vendors_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};
