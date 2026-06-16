import axios from 'axios';
import { admins_api_base } from './config';

export const fetchAdmins = async () => {
    const response = await axios.get(admins_api_base);
    return response.data;
};

// check whether a 10-digit phone number is a registered admin
export const checkIsAdmin = async (phone) => {
    const response = await axios.get(`${admins_api_base}/is-admin/${encodeURIComponent(phone)}`);
    return !!response.data?.isAdmin;
};

// role + scope: { isAdmin, type: 'admin'|'vendor', vendorName, name, phone }
export const fetchAdminProfile = async (phone) => {
    const response = await axios.get(`${admins_api_base}/profile/${encodeURIComponent(phone)}`);
    return response.data || { isAdmin: false };
};

export const createAdmin = async (admin) => {
    const response = await axios.post(admins_api_base, admin);
    return response.data;
};

export const deleteAdmin = async (id) => {
    const response = await axios.delete(`${admins_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};
