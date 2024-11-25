import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const bulkOrderCategories = ['Breakfast', 'Lunch/Dinner', 'Snacks'];

export const bulkData = {
    id: uuidv4(),
    options: [
        {
            item: items['Idly/Vada'].Idly,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items['Idly/Vada'].Vada,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Bath['Kesari Bath'],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Bath['Khara Bath'],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Beverages.Tea,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Beverages.Coffee,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Beverages["Badam Milk"],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Breakfast']
        },
        {
            item: items.Beverages.Tea,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Snacks']
        },
        {
            item: items.Beverages.Coffee,
            desc: 'Min order of 26',
            quantity: 0,
            minQuantity: 25,
            type: ['Snacks']
        },
        {
            item: items.Beverages["Badam Milk"],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
            type: ['Snacks']
        },
    ],
}