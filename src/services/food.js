import axios from 'axios';
import { food_api_base } from './config';

export const fetchFoodByArea = async (area, vegOnly = false) => {
    const response = await axios.get(
        `${food_api_base}/${encodeURIComponent(area)}`,
        { params: { vegOnly } },
    );
    return response.data;
};

export const fetchFoodInventory = async () => {
    const response = await axios.get(`${food_api_base}/inventory`);
    return response.data;
};

export const updateFoodInventory = async (item) => {
    const response = await axios.put(
        `${food_api_base}/inventory/${encodeURIComponent(item._id)}`,
        item,
    );
    return response.data;
};
