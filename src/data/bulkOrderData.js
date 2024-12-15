import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const bulkData = {
    id: uuidv4(),
    options: [
        {
            item: items['Idly/Vada']["Single Idly"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items['Idly/Vada']["Single Vada"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath['Kesari Bath'],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath['Khara Bath'],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath["Rice Bath"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Bath["Shavige Bath"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items["Fried Breakfast"].Bonda,
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items["Fried Breakfast"]["Mangalore Buns"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages.Tea,
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages.Coffee,
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
        {
            item: items.Beverages["Badam Milk"],
            desc: '',
            quantity: 0,
            minQuantity: 25,
        },
    ],
}
