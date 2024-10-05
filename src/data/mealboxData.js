import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const bestSellerMealBoxData = {
    'Breakfast': {
        3 : [
            {
                id: uuidv4(),
                items: 3,
                name: 'South Breakfast Box',
                tags: ['Best Seller'],
                image: 'https://t4.ftcdn.net/jpg/04/65/28/87/360_F_465288715_F3uc0aZMhzSbNbftEzHSb6RfUVQfCHeU.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Mains': {
                        limit: 1,
                        options: [
                            items.Breakfast.Idly,
                            items.Breakfast['Single Idly Vada'],
                            items.Breakfast['Chow Chow Bath'],
                        ],
                    },
                    Accompaniments: {
                        limit: 2,
                        options: [
                            items.Accompaniments['Coconut Chutney'],
                            items.Accompaniments['Sambar']
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            },
            {
                id: uuidv4(),
                items: 3,
                name: 'Rice Bath Box',
                tags: ['Best Seller'],
                image: 'https://myfoodstory.com/wp-content/uploads/2022/04/Kavitha-Auntys-Rice-Bath-2-500x500.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Mains': {
                        limit: 1,
                        options: [
                            items.Breakfast['Bisi Bele Bath'],
                            items.Breakfast['Pongal'],
                            items['Rice Specialities']['Veg Pulav'],
                            items['Rice Specialities']['Tomato Rice'],
                            items['Rice Specialities']['Pudina Rice'],
                        ],
                    },
                    Accompaniments: {
                        limit: 2,
                        options: [
                            items.Accompaniments['Coconut Chutney'],
                            items.Accompaniments['Boondi'],
                            items['Additional Items']['Raitha']
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            },
            {
                id: uuidv4(),
                items: 3,
                name: 'Dosa Box',
                tags: ['Best Seller'],
                image: 'https://vismaifood.com/storage/app/uploads/public/8b4/19e/427/thumb__1200_0_0_0_auto.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Mains': {
                        limit: 1,
                        options: [
                            items.Breakfast['Set Dosa'],
                            items.Breakfast['Ghee Masala Dosa'],
                            items.Breakfast['Mysore Masala Dosa'],
                            items.Breakfast['Onion Dosa'],
                        ],
                    },
                    Accompaniments: {
                        limit: 2,
                        options: [
                            items.Accompaniments['Coconut Chutney'],
                            items.Accompaniments['Sambar']
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            }
        ],
        5 : [
            {
                id: uuidv4(),
                items: 5,
                name: 'South Breakfast Box',
                tags: ['Best Seller'],
                image: 'https://t4.ftcdn.net/jpg/04/65/28/87/360_F_465288715_F3uc0aZMhzSbNbftEzHSb6RfUVQfCHeU.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Mains 1': {
                        limit: 1,
                        options: [
                            items.Breakfast['Single Idly Vada'],
                            items.Breakfast['Set Dosa'],
                            items.Breakfast['Ghee Masala Dosa'],
                            items.Breakfast['Mysore Masala Dosa'],
                            items.Breakfast['Onion Dosa'],
                        ],
                    },
                    'Mains 2': {
                        limit: 1,
                        options: [
                            items.Breakfast['Khara Bath'],
                            items.Breakfast['Pongal'],
                            items.Breakfast['Bisi Bele Bath'],
                        ],
                    },
                    Accompaniments: {
                        limit: 2,
                        options: [
                            items.Accompaniments['Coconut Chutney'],
                            items.Accompaniments['Sambar'],
                            items.Accompaniments['Dal'],
                            items['Additional Items']['Raitha']
                        ],
                    },
                    Sweets: {
                        limit: 1,
                        options: [
                            items.Sweet['Dry Jamoon'],
                            items.Sweet['Gulab Jamoon'],
                            items.Sweet['Ras Malai'],
                            items.Sweet['Champakali'],
                            items.Breakfast['Kesari Bath'],
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            },
        ],
        8 : [

        ]
    },
    'Chinese' : {
        3 : [
            {
                id: uuidv4(),
                items: 3,
                name: 'Chinese box',
                tags: ['Best Seller'],
                image: 'https://media-cdn.tripadvisor.com/media/photo-s/17/6b/3d/a4/chinese-non-veg-meal.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Rice / Noodles': {
                        limit: 1,
                        options: [
                            items["Rice Specialities"]['Paneer Fried Rice'],
                            items["Rice Specialities"]['Mushroom Fried Rice'],
                            items["Noodles"]['Paneer Hakka Noodles'],
                            items["Noodles"]['Paneer Schezwan Noodles'],
                            items["Noodles"]['Paneer Burnt Garlic Noodles'],
                            items["Noodles"]['Mushroom Hakka Noodles'],
                            items["Noodles"]['Mushroom Schezwan Noodles'],
                            items["Noodles"]['Mushroom Burnt Garlic Noodles'],
                        ],
                    },
                    'Manchurian / Chilli': {
                        limit: 1,
                        options: [
                            items["Dry Item"]["Veg Ball Manchurian"],
                            items["Dry Item"]["Gobi Manchurian"],
                            items["Dry Item"]["Paneer Manchurian"],
                            items["Dry Item"]["Mushroom Manchurian"],
                            items["Dry Item"]["Babycorn Manchurian"],
                            items["Dry Item"]["Gobi Chilli"],
                            items["Dry Item"]["Paneer Chilli"],
                            items["Dry Item"]["Mushroom Chilli"],
                            items["Dry Item"]["Babycorn Chilli"],
                        ],
                    },
                    Gravy: {
                        limit: 1,
                        options: [
                            items.Chinese['Manchurian Gravy'],
                            items.Chinese['Schezwan Chutney'],
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            }
        ],
        5 : [
            {
                id: uuidv4(),
                items: 5,
                name: 'Chinese box',
                tags: ['Best Seller'],
                image: 'https://homeskitchen.in/img/chinese-meal-box.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Fried Rice': {
                        limit: 1,
                        options: [
                            items["Rice Specialities"]['Paneer Fried Rice'],
                            items["Rice Specialities"]['Mushroom Fried Rice'],
                            items["Rice Specialities"]['Paneer Schezwan Fried Rice'],
                            items["Rice Specialities"]['Mushroom Schezwan Fried Rice'],
                        ],
                    },
                    'Noodles': {
                        limit: 1,
                        options: [
                            items["Noodles"]['Paneer Hakka Noodles'],
                            items["Noodles"]['Paneer Schezwan Noodles'],
                            items["Noodles"]['Paneer Burnt Garlic Noodles'],
                            items["Noodles"]['Mushroom Hakka Noodles'],
                            items["Noodles"]['Mushroom Schezwan Noodles'],
                            items["Noodles"]['Mushroom Burnt Garlic Noodles'],
                        ],
                    },
                    'Manchurian / Chilli': {
                        limit: 1,
                        options: [
                            items["Dry Item"]["Veg Ball Manchurian"],
                            items["Dry Item"]["Gobi Manchurian"],
                            items["Dry Item"]["Paneer Manchurian"],
                            items["Dry Item"]["Mushroom Manchurian"],
                            items["Dry Item"]["Babycorn Manchurian"],
                            items["Dry Item"]["Gobi Chilli"],
                            items["Dry Item"]["Paneer Chilli"],
                            items["Dry Item"]["Mushroom Chilli"],
                            items["Dry Item"]["Babycorn Chilli"],
                        ],
                    },
                    'Soup': {
                        limit: 1,
                        options: [
                            items.Soup['Veg Manchow'],
                            items.Soup['Sweet Corn'],
                            items.Soup['Hout and Sour'],
                        ],
                    },
                    Gravy: {
                        limit: 1,
                        options: [
                            items.Chinese['Manchurian Gravy'],
                            items.Chinese['Schezwan Chutney'],
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            }
        ],
        8 : [
            {
                id: uuidv4(),
                items: 8,
                name: 'Chinese box',
                tags: ['Best Seller'],
                image: 'https://b.zmtcdn.com/data/pictures/chains/1/20075741/272d3a5213b8b54f883e5b6dd76cdbe0.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Fried Rice': {
                        limit: 1,
                        options: [
                            items["Rice Specialities"]['Paneer Fried Rice'],
                            items["Rice Specialities"]['Mushroom Fried Rice'],
                        ],
                    },
                    'Schezwan Rice': {
                        limit: 1,
                        options: [
                            items["Rice Specialities"]['Paneer Schezwan Fried Rice'],
                            items["Rice Specialities"]['Mushroom Schezwan Fried Rice'],
                        ],
                    },
                    'Noodles': {
                        limit: 1,
                        options: [
                            items["Noodles"]['Paneer Hakka Noodles'],
                            items["Noodles"]['Paneer Schezwan Noodles'],
                            items["Noodles"]['Paneer Burnt Garlic Noodles'],
                            items["Noodles"]['Mushroom Hakka Noodles'],
                            items["Noodles"]['Mushroom Schezwan Noodles'],
                            items["Noodles"]['Mushroom Burnt Garlic Noodles'],
                        ],
                    },
                    'Manchurian / Chilli': {
                        limit: 1,
                        options: [
                            items["Dry Item"]["Veg Ball Manchurian"],
                            items["Dry Item"]["Gobi Manchurian"],
                            items["Dry Item"]["Paneer Manchurian"],
                            items["Dry Item"]["Mushroom Manchurian"],
                            items["Dry Item"]["Babycorn Manchurian"],
                            items["Dry Item"]["Gobi Chilli"],
                            items["Dry Item"]["Paneer Chilli"],
                            items["Dry Item"]["Mushroom Chilli"],
                            items["Dry Item"]["Babycorn Chilli"],
                        ],
                    },
                    'Soup': {
                        limit: 1,
                        options: [
                            items.Soup['Veg Manchow'],
                            items.Soup['Sweet Corn'],
                            items.Soup['Hout and Sour'],
                        ],
                    },
                    'Sides': {
                        limit: 1,
                        options: [
                            items.Chinese['Honey Chilli Potato'],
                            items.Chinese['French Fries'],
                            items.Chinese['Sweet Corn Spicy'],
                        ],
                    },
                    Gravy: {
                        limit: 1,
                        options: [
                            items.Chinese['Manchurian Gravy'],
                            items.Chinese['Schezwan Chutney'],
                        ],
                    },
                    Sweet: {
                        limit: 1,
                        options: [
                            items.Sweet['Gulab Jamoon'],
                        ],
                    },
                    Extras: {
                        limit: 1,
                        options: [
                            items.Extras['Water Bottle']
                        ],
                    }
                }
            }
        ]
    }, 'North Indian' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            {
                id: uuidv4(),
                items: 8,
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
                            items['Bread']["Rumali Roti"]
                        ],
                    }, 
                    'Curries': {
                        limit: 2,
                        options: [
                            items['Curries']["Paneer Butter Masala"],
                            items['Curries']["Mix Veg"],
                            items['Curries']["Green Peas Masala"],
                            items['Curries']["Aloo Gobi"],
                            items['Curries']["Mushroom Masala"],
                            items['Curries']["Palak Paneer"]
                        ],
                    },
                    'Rice Specialities': {
                        limit: 1,
                        options: [
                            items['Rice Specialities']["Paneer Fried Rice"],
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
                            items['Sweet']["Champakali"],
                            items['Sweet']["Gulab Jamoon"],
                            items['Sweet']["Ras Malai"]
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
    }, 'South Indian' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            
        ]
    }, 'Snacks' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            
        ]
    }, 'Healthy' :{
        3 : [

        ],
        5 : [

        ],
        8 : [
            
        ]
    },
}

export const mealBoxOptions = {
    3 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '3 Compartment Breafast Box',
            tags: ['Best Seller'],
            person : {
                min: 10,
                max: 500
            },
            sections: {
                'Mains': {
                    limit: 2,
                    options: [
                        items.Breakfast.Idly,
                        items.Breakfast.Vada,
                        items.Breakfast['Kesari Bath'],
                        items.Breakfast['Khara Bath']
                    ],
                },
                Accompaniments: {
                    limit: 1,
                    options: [
                        items.Accompaniments['Coconut Chutney'],
                        items.Accompaniments['Corriander Chutney'],
                        items.Accompaniments['Tomato Chutney'],
                        items.Accompaniments['Sambar']
                    ],
                },
                Extras: {
                    limit: 1,
                    options: [
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
            sections: {
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
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
            sections: {
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
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
            sections: {
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
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
            sections: {
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'Healthy' : {
            id: uuidv4(),
            name: '3 Compartment Healthy Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
    },
    5 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '5 Compartment Breafast Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            }
        },
        'Chinese' : {
            id: uuidv4(),
            name: '5 Compartment Chinese Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'North Indian' : {
            id: uuidv4(),
            name: '5 Compartment North Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'South Indian' : {
            id: uuidv4(),
            name: '5 Compartment South Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'Snacks' : {
            id: uuidv4(),
            name: '5 Compartment Snacks Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'Healthy' : {
            id: uuidv4(),
            name: '3 Compartment Healthy Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
    },
    8 : {
        'Breakfast' : {
            id: uuidv4(),
            name: '8 Compartment Breafast Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            }
        },
        'Chinese' : {
            id: uuidv4(),
            name: '8 Compartment Chinese Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'North Indian' : {
            id: uuidv4(),
            name: '8 Compartment North Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'South Indian' : {
            id: uuidv4(),
            name: '8 Compartment South Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'Snacks' : {
            id: uuidv4(),
            name: '8 Compartment Snacks Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
        'Healthy' : {
            id: uuidv4(),
            name: '8 Compartment Healthy Box',
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
                Extras: {
                    limit: 1,
                    options: [
                        items.Extras['Water Bottle']
                    ],
                }
            },
        },
    }
};
