import axios from 'axios';
import { api_base } from './config';

const food_api_base = `${api_base}/food`

export const fetchFoodByArea = async (area, vegOnly = false) => {
    try {
        const response = await axios.get(`${food_api_base}/${area}?vegOnly=${vegOnly}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

