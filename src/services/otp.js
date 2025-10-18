import axios from 'axios';
import { verify_api_base } from './config';

export const sendOTP = async (number) => {
    try {
        const phone = `+91${number}`;
        await axios.post(`${verify_api_base}/send-otp`, { phone });
    } catch (error) {
        console.log(error);
    }
}

export const verifyOTP = async (number, code) => {
    try {
        const phone = `+91${number}`;
        await axios.post(`${verify_api_base}/verify-otp`, { phone, code });
    } catch (error) {
        console.log(error);
    }
}