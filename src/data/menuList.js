import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const menuList = [
    {
        id: uuidv4(),
        price: {
            min:  Math.floor(299*0.9),
            max: 299,
        },
        tags: ['Best Seller'],
        person : {
            min: 30,
            max: 500
        },
        image: "https://cf0316.s3.amazonaws.com/cookificom/cuisine/6-south-indian/cookificomcuisine6-south-indiansi-banner-3ba806-fbe8c3.jpg",
        name: 'South Indian Buffet',
        sections : {
            'Welcome Drink': {
                limit: 1,
                options: [
                    items['Welcome Drink']["Mint Lime"],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon'],
                    items['Welcome Drink']['Butterscotch']
                ],
            },
            'Pallya': {
                limit: 2,
                options: [
                    items.Pallya["Beans-Carrot"],
                    items.Pallya["Thondekaayi-Cashew"],
                    items.Pallya["Suvarnagadde-Kabul Chana"],
                    items.Pallya["Aloo-Matar"],
                    items.Pallya["Bendi dry"]
                ],
            },
            'Mains': {
                limit: 1,
                options: [
                    items.Rotti["Akki Rotti"],
                    items['Fried Breakfast'].Poori
                ],
            },
            'Curry': {
                limit: 1,
                options: [
                    items.Curries['Veg Kurma'],
                    items.Curries['Chana Masala'],
                    items.Curries['Paneer Butter Masala'] //40 pax extra
                ],
            },

            'Rice': {
                limit: 1,
                options: [
                    items.Rice['Veg Pulav'],
                    items.Rice['Pudina Rice'],
                    items.Rice["Lemon Rice"],
                    items.Rice.Puliyogare,
                    items.Rice["Ghee Rice"]
                ],
            },
            'Fixed Items': {
                limit: null,
                fixed: true,
                options: [
                    items['Additional Items']['Kosumbari'],
                    items['Additional Items']['White Rice'],
                    items['Additional Items']['Rasam'],
                    items.Accompaniments.Sambar,
                    items['Additional Items']['Papad'],
                    items['Additional Items'].Curd,
                    items["Fried Breakfast"].Bajji,
                    items['Additional Items']['Pickle'],
                    items['Additional Items']['Salt'],
                    items['Additional Items']['Beeda'],
                    items.Sweet['Holige With Ghee'],
                    items.Sweet['Payasa'],
                ],
            },
            'Extra Sweets': {
                limit: null,
                options: [
                    items["Extra Sweet"]['Dry Jamoon'],
                    items["Extra Sweet"]['Gulab Jamoon'],
                    items["Extra Sweet"].Champakali,
                    items["Extra Sweet"].Jahangir,
                    items["Extra Sweet"]["Malai Sandwich"],
                    items["Extra Sweet"].Jalebi,
                    items["Additional Items"]["Ice Cream"]
                ],
            },
            Extras: {
                limit: null,
                options: [
                    items.Extras['Tissues'],
                    items.Extras.Cutlery,
                    items.Extras['Buffet Plate'],
                    items.Extras['Water Bottle']
                ],
            } 
        }
    },
    {
        id: uuidv4(),
        price: {
            min: Math.floor(399*0.9),
            max: 399,
        },
        tags: ['Best Seller'],
        person : {
            min: 30,
            max: 500
        },
        image: "https://assets.zeezest.com/blogs/PROD_Seven%20Must-Try%20North%20Indian%20Restaurants%20In%20Bangalore%20For%20A%20Gastronomic%20Delight_1716886806667_thumb_500.jpeg",
        name: 'North Indian Buffet',
        sections : {
            'Welcome Drink': {
                limit: 1,
                options: [
                    items['Welcome Drink']["Mint Lime"],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon'],
                    items['Welcome Drink']['Butterscotch']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hot and Sour'],
                    items.Soup['Veg Manchow']
                ],
            },
            'Dry Item': {
                limit: 1,
                options: [
                    items['Dry Item']["Any Gobi Item"],
                    items['Dry Item']["Any Babycorn Item"],
                    items['Dry Item']["Any Paneer Item"],
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    items.Breads['Kulcha'],
                    items.Breads['Naan'],
                    items.Breads['Tandoor Roti'],
                    items.Breads['Butter Tandoor Roti'],
                    items.Breads['Rumali Roti']
                ],
            }, 
            'Curry': {
                limit: 1,
                options: [
                    items.Curries['Paneer Butter Masala'],
                    items.Curries['Palak Paneer'],
                    items.Curries['Mix Veg'],
                    items.Curries['Green Peas Masala'],
                    items.Curries['Aloo Gobi'],
                    items.Curries['Mushroom Masala'],
                ],
            },
            'Rice': {
                limit: 1,
                options: [
                    items['Rice']['Veg Biriyani'],
                    items['Rice']['Handi Biriyani'],
                    items['Rice']['Palak Rice'],
                    items['Rice']['Mughlai Biriyani'],
                    items['Rice']['Peas Pulav'],
                    items['Rice']['Paneer Fried Rice'],
                    items.Rice["Ghee Rice"]
                ],
            },
            'Sweets': {
                limit: null,
                options: [
                    items["Extra Sweet"]['Dry Jamoon'],
                    items["Extra Sweet"]['Champakali'],
                    items["Extra Sweet"]['Gulab Jamoon'],
                    items["Extra Sweet"]['Ras Malai'],
                    items["Extra Sweet"].Jahangir,
                    items["Extra Sweet"]["Malai Sandwich"],
                    items["Extra Sweet"].Jalebi,
                    items["Additional Items"]["Ice Cream"]
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    items['Additional Items']['Raitha'],
                    items['Additional Items']['Green Salad'],
                    items['Additional Items']['White Rice'],
                    items['Additional Items']['Rasam'],
                    items['Additional Items']['Papad'],
                    items['Additional Items']['Curd Rice'],
                    items['Additional Items']['Beeda'],
                ],
            },
            Extras: {
                limit: null,
                options: [
                    items.Extras['Tissues'],
                    items.Extras.Cutlery,
                    items.Extras['Buffet Plate'],
                    items.Extras['Water Bottle']
                ],
            }            
        }
    },
    {
        id: uuidv4(),
        price: {
            min:  Math.floor(449*0.9),
            max: 449,
        },
        tags: ['Best Seller'],
        person : {
            min: 30,
            max: 500
        },
        image: "https://cdn0.weddingwire.in/article/4333/3_2/960/jpg/123334-maharaja-bhog-2.jpeg",
        name: 'South & North Buffet',
        sections : {
            'Welcome Drink': {
                limit: 1,
                options: [
                    items['Welcome Drink']["Mint Lime"],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon'],
                    items['Welcome Drink']['Butterscotch'],
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hot and Sour'],
                    items.Soup['Veg Manchow']
                ],
            },
            'Dry Item': {
                limit: 2,
                options: [
                    items['Dry Item']["Any Gobi Item"],
                    items['Dry Item']["Any Babycorn Item"],
                    items['Dry Item']["Any Paneer Item"],
                ],
            },
            'Rice': {
                limit: 1,
                options: [
                    items['Rice']['Paneer Fried Rice'],
                    items['Rice']['Veg Biriyani'],
                    items['Rice']['Handi Biriyani'],
                    items['Rice']['Palak Rice'],
                    items['Rice']['Mughlai Biriyani'],
                    items['Rice']['Peas Pulav'],
                    items.Rice['Veg Pulav'],
                    items.Rice['Pudina Rice'],
                    items.Rice["Lemon Rice"],
                    items.Rice.Puliyogare,
                    items.Rice["Ghee Rice"]
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    items['Fried Breakfast']['Poori'],
                    items.Rotti['Akki Rotti'],
                    items.Breads['Rumali Roti'],
                    items.Breads['Kulcha'],
                    items.Breads['Naan'],
                    items.Breads['Tandoor Roti'],
                    items.Breads['Butter Tandoor Roti'],
                    items.Breads['Rumali Roti']
                ],
            }, 
            'Curries': {
                limit: 1,
                options: [
                    items.Curries['Mix Veg'],
                    items.Curries['Paneer Butter Masala'],
                    items.Curries['Palak Paneer'],
                    items.Curries['Green Peas Masala'],
                    items.Curries['Aloo Gobi'],
                    items.Curries['Mushroom Masala'],
                    items.Curries["Chana Masala"],
                ],
            },
            'Sweets': {
                limit: null,
                options: [
                    items["Extra Sweet"]['Dry Jamoon'],
                    items["Extra Sweet"]['Champakali'],
                    items["Extra Sweet"]['Gulab Jamoon'],
                    items["Extra Sweet"]['Ras Malai'],
                    items["Extra Sweet"].Jahangir,
                    items["Extra Sweet"]["Malai Sandwich"],
                    items["Extra Sweet"].Jalebi,
                    items["Extra Sweet"]['Holige With Ghee'],
                    items["Extra Sweet"]['Payasa'],
                    items["Additional Items"]["Ice Cream"]
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    items['Additional Items']['Raitha'],
                    items['Additional Items']['Green Salad'],
                    items['Additional Items']['White Rice'],
                    items['Additional Items']['Rasam'],
                    items.Accompaniments.Sambar,
                    items['Additional Items']['Papad'],
                    items['Additional Items']['Curd Rice'],
                    items["Fried Breakfast"].Bajji,
                    items['Additional Items']['Pickle'],
                    items['Additional Items']['Salt'],
                    items['Additional Items']['Beeda'],
                ],
            },
            Extras: {
                limit: null,
                options: [
                    items.Extras['Tissues'],
                    items.Extras.Cutlery,
                    items.Extras['Buffet Plate'],
                    items.Extras['Water Bottle']
                ],
            }            
        }
    },
    {
        id: uuidv4(),
        active: false,
        price: {
            min: Math.floor(599*0.9),
            max: 599,
        },
        tags: ['Best Seller'],
        person : {
            min: 30,
            max: 500
        },
        image: "https://img.freepik.com/free-photo/side-view-people-celebrating-tamil-new-year_23-2151210764.jpg",
        name: 'Deluxe Buffet ( Coming Soon )',
        sections : {
            'Test' : {
                limit: 4,
                options: []
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    items['Additional Items']['Raitha'],
                    items['Additional Items']['Green Salad'],
                    items['Additional Items']['White Rice'],
                    items['Additional Items']['Rasam'],
                    items['Additional Items']['Papad'],
                    items['Additional Items']['Curd Rice'],
                    items['Additional Items']['Pickle'],
                    items['Additional Items']['Salt'],
                    items['Additional Items']['Beeda'],
                    items['Additional Items']['Ice Cream'],
                ],
            },
            'Welcome Drink': {
                limit: 1,
                options: [
                    items['Welcome Drink']['Pudina Lime'],
                    items['Welcome Drink']['Butterscotch'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hot and Sour'],
                    items.Soup['Veg Manchow']
                ],
            },
            'Dry Item': {
                limit: 2,
                options: [
                    items['Dry Item']["Any Gobi Item"],
                    items['Dry Item']["Any Babycorn Item"],
                    items['Dry Item']["Any Paneer Item"],
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    items['Fried Breakfast']['Poori'],
                    items.Rotti['Akki Rotti'],
                    items.Breads['Rumali Roti'],
                    items.Breads['Kulcha'],
                    items.Breads['Naan'],
                    items.Breads['Tandoor Roti'],
                    items.Breads['Butter Tandoor Roti'],
                    items.Breads['Rumali Roti']
                ],
            }, 
            'Curries': {
                limit: 1,
                options: [
                    items.Curries['Paneer Butter Masala'],
                    items.Curries['Mix Veg'],
                    items.Curries['Green Peas Masala'],
                    items.Curries['Aloo Gobi'],
                    items.Curries['Mushroom Masala'],
                    items.Curries['Palak Paneer'],
                    items.Curries["Chana Masala"],
                ],
            },
            'Rice': {
                limit: 1,
                options: [
                    items['Rice']['Paneer Fried Rice'],
                    items['Rice']['Veg Biriyani'],
                    items['Rice']['Handi Biriyani'],
                    items['Rice']['Palak Rice'],
                    items['Rice']['Mughlai Biriyani'],
                    items['Rice']['Peas Pulav'],
                    items.Rice['Veg Pulav'],
                    items.Rice['Pudina Rice'],
                    items.Rice["Lemon Rice"],
                    items.Rice.Puliyogare
                ],
            },
            'Sweet': {
                limit: 3,
                options: [
                    items["Extra Sweet"]['Dry Jamoon'],
                    items["Extra Sweet"]['Champakali'],
                    items["Extra Sweet"]['Gulab Jamoon'],
                    items["Extra Sweet"]['Ras Malai'],
                    items["Extra Sweet"].Jahangir,
                    items["Extra Sweet"]["Malai Sandwich"],
                    items["Extra Sweet"].Jalebi,
                    items["Extra Sweet"]['Holige With Ghee'],
                    items["Extra Sweet"]['Payasa'],
                    items["Additional Items"]["Ice Cream"]
                ],
            },
            Extras: {
                limit: 4,
                options: [
                    items.Extras['Buffet Plate'],
                    items.Extras.Cutlery,
                    items.Extras['Tissues'],
                    items.Extras['Water Bottle']
                ],
            }            
        }
    },
  ];