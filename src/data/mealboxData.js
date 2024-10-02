import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const mealBoxOptions = {
    3 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '3 Compartment Breafast Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {
                'mains 1': {
                    limit: 1,
                    options: [
                        items.Breakfast.Idly,
                        items.Breakfast.Vada,
                        items.Breakfast['Kesari Bath'],
                        items.Breakfast.Upma
                    ],
                },
                'mains 2': {
                    limit: 1,
                    options: [
                        items.Breakfast.Idly,
                        items.Breakfast.Vada,
                        items.Breakfast['Kesari Bath'],
                        items.Breakfast.Upma
                    ],
                },
                accompaniments: {
                    limit: 1,
                    options: [
                        items.Accompaniments['Coconut Chutney'],
                        items.Accompaniments['Corriander Chutney'],
                        items.Accompaniments['Tomato Chutney'],
                        items.Accompaniments['Sambar']
                    ],
                },
                extras: {
                    limit: 4,
                    options: [
                        items.Extras['Tissues'],
                        items.Extras['Water Bottle']
                    ],
                }
            }
        },
        'Chinese' : {
            id: uuidv4(),
            name: '3 Compartment Chinese Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'North Indian' : {
            id: uuidv4(),
            name: '3 Compartment North Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'South Indian' : {
            id: uuidv4(),
            name: '3 Compartment South Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Snacks' : {
            id: uuidv4(),
            name: '3 Compartment Snacks Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Sweets' : {
            id: uuidv4(),
            name: '3 Compartment Sweet Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
    },
    5 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '3 Compartment Breafast Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {}
        },
        'Chinese' : {
            id: uuidv4(),
            name: '3 Compartment Chinese Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'North Indian' : {
            id: uuidv4(),
            name: '3 Compartment North Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'South Indian' : {
            id: uuidv4(),
            name: '3 Compartment South Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Snacks' : {
            id: uuidv4(),
            name: '3 Compartment Snacks Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Sweets' : {
            id: uuidv4(),
            name: '3 Compartment Sweet Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
    },
    8 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '3 Compartment Breafast Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {}
        },
        'Chinese' : {
            id: uuidv4(),
            name: '3 Compartment Chinese Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'North Indian' : {
            id: uuidv4(),
            name: '3 Compartment North Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'South Indian' : {
            id: uuidv4(),
            name: '3 Compartment South Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Snacks' : {
            id: uuidv4(),
            name: '3 Compartment Snacks Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
        'Sweets' : {
            id: uuidv4(),
            name: '3 Compartment Sweet Box',
            price: {
                min: 149,
                max: 199,
            },
            tags: ['Best Seller'],
            person : {
                min: 30,
                max: 500
            },
            sections: {},
        },
    }
};

export const bestSellerMealBoxData = {
    3 : {},
    5 : {},
    8 : {
        'North Indian' : [
            {
                id: uuidv4(),
                price: {
                    min: 299,
                    max: 299,
                },
                tags: ['Best Seller'],
                person : {
                    min: 10,
                    max: 0
                },
                image: "https://5.imimg.com/data5/ANDROID/Default/2020/8/VU/YQ/VV/40967555/img-20200811-wa0005-jpg.jpg",
                name: 'North Indian Meal box',
                sections : {
                    'Dry Item': {
                        limit: 1,
                        options: [
                            items['Dry Item']["Gobi Manchurian"],
                            items['Dry Item']["Gobi 65"],
                            items['Dry Item']["Babycorn Manchurian"],
                            items['Dry Item']["Babycorn Chilli"]
                        ],
                    },
                    'Bread': {
                        limit: 1,
                        options: [
                            items['Bread']["Kulcha"],
                            items['Bread']["Naan"],
                            items['Bread']["Tandoor Roti"],
                            items['Bread']["Rumali roti"]
                        ],
                    }, 
                    'Curries': {
                        limit: 2,
                        options: [
                            items['Curries']["Paneer Butter Masala"],
                            items['Curries']["Mix veg"],
                            items['Curries']["Green Peas Masala"],
                            items['Curries']["Aloo Gobi"],
                            items['Curries']["Mushroom Masala"],
                            items['Curries']["Palak Paneer"]
                        ],
                    },
                    'Rice Specialities': {
                        limit: 1,
                        options: [
                            items['Rice Specialities']["Veg Fried Rice"],
                            items['Rice Specialities']["Veg Biriyani"],
                            items['Rice Specialities']["Handi Biriyani"],
                            items['Rice Specialities']["Palak Rice"],
                            items['Rice Specialities']["Mughlai Biriyani"],
                            items['Rice Specialities']["Peas Pulav"]
                        ],
                    },
                    'Sweet': {
                        limit: 1,
                        options: [
                            items['Sweet']["Dry Jamoon"],
                            items['Sweet']["Campakali"],
                            items['Sweet']["Gulab Jamoon"],
                            items['Sweet']["Rasagulla"]
                        ],
                    },
                    'Fixed Items': {
                        limit: 2,
                        fixed: true,
                        options: [
                            items['Additional Items']["Raitha"],
                            items['Additional Items']["Green Salad"]
                        ],
                    }           
                }
            },
        ]
    }
}
