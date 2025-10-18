import axios from 'axios';
import { food_api_base } from './config';

export const fetchFoodByArea = async (area, vegOnly = false) => {
    try {
        const response = await axios.get(`${food_api_base}/${area}?vegOnly=${vegOnly}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const fetchFoodInventory = async () => {
    try {
        const response = await axios.get(`${food_api_base}/inventory`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const updateFoodInventory = async (item) => {
    try {
        const response = await axios.put(`${food_api_base}/inventory/${item._id}`, item);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


