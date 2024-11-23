import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const bulkData = {
    id: uuidv4(),
    options: [
        {
            item: items['Idly/Vada'].Idly,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items['Idly/Vada'].Vada,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath['Kesari Bath'],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath['Khara Bath'],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages.Tea,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages.Coffee,
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages["Badam Milk"],
            desc: 'Min order of 25',
            quantity: 0,
            minQuantity: 25,
        }
    ],
}