import axios from 'axios';
import { reviews_api_base } from './config';

// { summary: { average, count }, reviews: [...] }
export const fetchReviews = async (vendorName) => {
    const response = await axios.get(`${reviews_api_base}/${encodeURIComponent(vendorName)}`);
    return response.data || { summary: { average: 0, count: 0 }, reviews: [] };
};

export const createReview = async ({ vendorName, rating, text, author }) => {
    const response = await axios.post(reviews_api_base, { vendorName, rating, text, author });
    return response.data;
};
