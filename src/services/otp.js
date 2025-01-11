import axios from 'axios';

export const sendOTP = async (phone) => {
    try {
        const response = axios.post('http://localhost:3001/otp/send-otp', { phone });
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}

export const verifyOTP = async (phone, code) => {
    try {
        const response = axios.post('http://localhost:3001/otp/verify-otp', { phone, code });
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}