import { v4 as uuidv4 } from "uuid";
import { formatDate } from "../utils/util";
export const ordersData = [
    {
        number : '8971780778',
        orders : [
            {
                id : uuidv4(),
                "people": 25,
                "orderDate": formatDate(new Date()),
                "type": "bulk",
                "orderData" : {
                    "orderName" : "Bulk Breakfats/Snacks",
                    "price": {
                        "pricepax": "₹0.00",
                        "totalFoodPrice": "₹1,250.00",
                        "serviceCharge": "₹0.00",
                        "totalPrice": "₹1,250.00",
                        "discountPax": "₹63.00",
                        "totalDiscount": "₹63.00",
                        "finalPrice": "₹1,187.00"
                    },
                    "special_request": "hello",
                    "menu_sections": [
                        "Single Idly : 25",
                        "Single Vada : 25"
                    ],
                    "date": "09/01/2025, 12:45:49",
                },
                "customerData": {
                    "name": "W",
                    "phone": "8971780778",
                    "address": "0508, B2, KSR CORDELIA, DASARAHALLI",
                    "area": "CHANNASANDRA",
                    "pincode": "560024"
                }
            },
            {
                id : uuidv4(),
                "people": 100,
                "orderDate": formatDate(new Date()),
                "type": "menu",
                "orderData" : {
                    "orderName" : "South Indian Buffet",
                    "price": {
                        "pricepax": "₹329.00",
                        "totalFoodPrice": "₹32,900.00",
                        "serviceCharge": "₹2,000.00",
                        "totalPrice": "₹34,900.00",
                        "discountedPax": "₹307.00",
                        "discountPax": "₹22.00",
                        "totalDiscount": "₹2,200.00",
                        "finalPrice": "₹32,700.00"
                    },
                    "special_request": "",
                    "menu_sections": [
                        "WELCOME DRINK: Mint Lime",
                        "PALLYA: Beans-Carrot, Thondekaayi-Cashew",
                        "MAINS: Akki Rotti",
                        "CURRY: Veg Kurma",
                        "RICE: Veg Pulav / Raitha",
                        "FIXED ITEMS: Kosumbari, White Rice, Rasam, Sambar, Papad, Curd, Bajji, Pickle, Salt, Sweet Beeda, Holige With Ghee, Payasa",
                        "EXTRA SWEETS: Ice Cream",
                        "EXTRAS: Water Bottle"
                    ],
                    "date": "09/01/2025, 13:59:50",
                },
                "customerData": {
                    "name": "QEFWF",
                    "phone": "8971780778",
                    "address": "0508, B2, KSR CORDELIA, DASARAHALLI",
                    "area": "RACHENAHALLI",
                    "pincode": "560024"
                }
            }
        ]
    }
]