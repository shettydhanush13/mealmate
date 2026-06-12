import axios from 'axios';
import { combos_api_base } from './config';

export const fetchCombos = async ({ mealSlot, boxType } = {}) => {
    const params = {};
    if (mealSlot) params.mealSlot = mealSlot;
    if (boxType != null) params.boxType = boxType;
    const response = await axios.get(combos_api_base, { params });
    return response.data;
};

export const createCombo = async (combo) => {
    const response = await axios.post(combos_api_base, combo);
    return response.data;
};

export const updateCombo = async (id, combo) => {
    const response = await axios.put(`${combos_api_base}/${encodeURIComponent(id)}`, combo);
    return response.data;
};

export const deleteCombo = async (id) => {
    const response = await axios.delete(`${combos_api_base}/${encodeURIComponent(id)}`);
    return response.data;
};
