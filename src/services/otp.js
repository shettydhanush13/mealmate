import axios from 'axios';
import { verify_api_base } from './config';

export const sendOTP = async (number) => {
    const phone = `+91${number}`;
    const response = await axios.post(`${verify_api_base}/send-otp`, { phone });
    return response.data;
};

export const verifyOTP = async (number, code) => {
    const phone = `+91${number}`;
    const response = await axios.post(`${verify_api_base}/verify-otp`, { phone, code });
    return response.data;
};
