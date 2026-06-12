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

// Nested catalog tree { category: { subcategory: [items] } } for a service area.
export const fetchFoodInventoryTree = async (area) => {
    const response = await axios.get(
        `${food_api_base}/inventory/list/${encodeURIComponent(area)}`,
    );
    return response.data;
};

// Only these fields are accepted by the backend (UpdateFoodItemDto). The API
// runs a whitelist+forbidNonWhitelisted ValidationPipe, so sending extra fields
// (createdAt, updatedAt, __v, …) makes the request fail — strip them here.
const FOOD_ITEM_FIELDS = [
    '_id', 'itemId', 'itemCode', 'itemName', 'veg', 'category', 'subcategory',
    'vendors', 'cuisine', 'active', 'service', 'price', 'currency',
    'quantity', 'minOrderQty', 'serves',
];

export const updateFoodInventory = async (item) => {
    const body = {};
    for (const k of FOOD_ITEM_FIELDS) {
        if (item[k] !== undefined) body[k] = item[k];
    }
    const response = await axios.put(
        `${food_api_base}/inventory/${encodeURIComponent(item._id)}`,
        body,
    );
    return response.data;
};
