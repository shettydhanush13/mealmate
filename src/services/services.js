import axios from 'axios';
import { api_base } from './config';

const services_api_base = `${api_base}/services`

export const fetchServicesByEvent = async (event) => {
    try {
        const response = await axios.get(`${services_api_base}/${event}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}