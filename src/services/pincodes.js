import axios from 'axios';
import { pincodes_api_base } from './config';

export const fetchPincodes = async () => {
    const response = await axios.get(pincodes_api_base);
    return response.data;
};

// serviceability for a pincode: { pincode, serviceable, area, vendorCount, vendors }
export const checkServiceability = async (pincode) => {
    const response = await axios.get(`${pincodes_api_base}/check/${encodeURIComponent(pincode)}`);
    return response.data || { serviceable: false, area: '' };
};

export const createPincode = async (data) => {
    const response = await axios.post(pincodes_api_base, data);
    return response.data;
};

export const updatePincode = async (id, data) => {
    const response = await axios.put(`${pincodes_api_base}/${encodeURIComponent(id)}`, data);
    return response.data;
};

export const deletePincode = async (id) => {
    const response = await axios.delete(`${pincodes_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};
