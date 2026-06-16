import axios from 'axios';
import { verify_api_base } from './config';
import { setToken } from './authToken';

export const sendOTP = async (number) => {
    const phone = `+91${number}`;
    const response = await axios.post(`${verify_api_base}/send-otp`, { phone });
    return response.data;
};

export const verifyOTP = async (number, code) => {
    const phone = `+91${number}`;
    const response = await axios.post(`${verify_api_base}/verify-otp`, { phone, code });
    // On success the backend returns a JWT — persist it so subsequent staff/
    // customer API calls are authenticated (the axios interceptor attaches it).
    if (response.data?.token) setToken(response.data.token);
    return response.data;
};
