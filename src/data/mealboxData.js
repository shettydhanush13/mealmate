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
                            items['Idly/Vada'].Idly,
                            items['Idly/Vada']['Single Idly Vada'],
                            items.Bath['Chow Chow Bath'],
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
                            items.Bath['Bisi Bele Bath'],
                            items.Bath['Pongal'],
                            items.Rice['Veg Pulav'],
                            items.Rice['Tomato Rice'],
                            items.Rice['Pudina Rice'],
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
                    'Dosa': {
                        limit: 1,
                        options: [
                            items.Dosa['Set Dosa'],
                            items.Dosa['Ghee Masala Dosa'],
                            items.Dosa['Mysore Masala Dosa'],
                            items.Dosa['Onion Dosa'],
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
                            items['Idly/Vada']['Single Idly Vada'],
                            items.Dosa['Set Dosa'],
                            items.Dosa['Ghee Masala Dosa'],
                            items.Dosa['Mysore Masala Dosa'],
                            items.Dosa['Onion Dosa'],
                        ],
                    },
                    'Mains 2': {
                        limit: 1,
                        options: [
                            items.Bath['Khara Bath'],
                            items.Bath['Pongal'],
                            items.Bath['Bisi Bele Bath'],
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
                            items.Bath['Kesari Bath'],
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
                            items["Rice"]['Paneer Fried Rice'],
                            items["Rice"]['Mushroom Fried Rice'],
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
                            items["Rice"]['Paneer Fried Rice'],
                            items["Rice"]['Mushroom Fried Rice'],
                            items["Rice"]['Paneer Schezwan Fried Rice'],
                            items["Rice"]['Mushroom Schezwan Fried Rice'],
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
                            items.Soup['Hot and Sour'],
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
                            items["Rice"]['Paneer Fried Rice'],
                            items["Rice"]['Mushroom Fried Rice'],
                        ],
                    },
                    'Schezwan Rice': {
                        limit: 1,
                        options: [
                            items["Rice"]['Paneer Schezwan Fried Rice'],
                            items["Rice"]['Mushroom Schezwan Fried Rice'],
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
                            items.Soup['Hot and Sour'],
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
    },
    'North Indian' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            {
                id: uuidv4(),
                items: 8,
                tags: ['Best Seller'],
                person : {
                    min: 10,
                    max: 0
                },
                image: "https://5.imimg.com/data5/ANDROID/Default/2020/8/VU/YQ/VV/40967555/img-20200811-wa0005-jpg.jpg",
                name: 'North Indian Meal box',
                sections : {
                    'Bread': {
                        limit: 1,
                        options: [
                            items['Breads']["Kulcha"],
                            items['Breads']["Naan"],
                            items['Breads']["Tandoor Roti"],
                            items['Breads']["Rumali Roti"]
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
                    'Rice': {
                        limit: 1,
                        options: [
                            items['Rice']["Veg Biriyani"],
                            items['Rice']["Handi Biriyani"],
                            items['Rice']["Mughlai Biriyani"],
                            items['Rice']["Peas Pulav"],
                            items['Rice']["Veg Pulav"]
                        ],
                    },
                    'Dal': {
                        limit: 1,
                        options: [
                            items['Curries']["Dal Tadka"],
                            items['Curries']["Dal Fry"],
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
                    'Accompaniments': {
                        limit: 2,
                        fixed: true,
                        options: [
                            items['Additional Items']["Raitha"],
                            items['Additional Items']["Green Salad"],
                            items['Additional Items']["Papad"],
                            items['Additional Items']["Curd"],
                            items['Additional Items']["Curd Rice"],
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
        ]
    },
    'South Indian' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            {
                id: uuidv4(),
                items: 8,
                name: 'South Indian Meal Box',
                tags: ['Best Seller'],
                image: 'https://media-cdn.tripadvisor.com/media/photo-s/17/6b/3d/a4/chinese-non-veg-meal.jpg',
                person : {
                    min: 10,
                },
                sections: {
                    'Mains': {
                        limit: 1,
                        options: [
                            items["Fried Breakfast"]['Poori'],
                        ],
                    },
                    'Curry': {
                        limit: 1,
                        options: [
                            items["Curries"]['Sagu'],
                            items["Curries"]['Koot'],
                        ],
                    },
                    'Fixed Items': {
                        limit: 4,
                        options: [
                            items['Additional Items']['Green Salad'],
                            items["Additional Items"]['White Rice'],
                            items["Additional Items"]['Rasam'],
                            items["Accompaniments"]['Sambar'],
                        ],
                    },
                    'Pallya': {
                        limit: 1,
                        options: [
                            items['Choice']['Of Your Choice'],
                        ],
                    },
                    'Sweet': {
                        limit: 1,
                        options: [
                            items["Sweet"]['Holige With Ghee'],
                            items["Sweet"]['Payasa'],
                        ],
                    },
                    'Finisher': {
                        limit: 1,
                        options: [
                            items["Additional Items"]['Curd Rice'],
                            items["Additional Items"]['Curd'],
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
    },
    'Snacks' : {
        3 : [

        ],
        5 : [

        ],
        8 : [
            
        ]
    },
    'Healthy' :{
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
                        items['Idly/Vada'].Idly,
                        items['Idly/Vada'].Vada,
                        items.Bath['Kesari Bath'],
                        items.Bath['Khara Bath']
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
