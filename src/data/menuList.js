import { items } from "./items";
import { v4 as uuidv4 } from 'uuid';

export const menuList = [
    {
        id: uuidv4(),
        image: 'https://media.istockphoto.com/id/1253203631/photo/south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=RTE240M3aX8cCjlYfsx-Z_ohtj4Cb_xGLNVk0GKuzO0=',
        name: 'Classic South Indian ( Breakfast )',
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
            Mains: {
                limit: 2,
                options: [
                    items['Idly/Vada'].Idly,
                    items['Idly/Vada'].Vada,
                    items.Bath['Kesari Bath'],
                    items.Bath['Khara Bath'],
                ],
            },
            Accompaniments: {
                limit: 3,
                options: [
                    items.Accompaniments['Coconut Chutney'],
                    items.Accompaniments['Corriander Chutney'],
                    items.Accompaniments['Tomato Chutney'],
                    items.Accompaniments['Sambar']
                ],
            },
            Beverages: {
                limit: 1,
                options: [
                    items.Beverages.Coffee,
                    items.Beverages.Tea
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
    {
        id: uuidv4(),
        price: {
            min: 329,
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
                    items['Welcome Drink']['Pudina Lime'],
                    items['Welcome Drink']['Butterscotch'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon']
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    items.Sweet['Dry Jamoon'],
                    items.Sweet['Champakali'],
                    items.Sweet['Gulab Jamoon'],
                    items.Sweet['Ras Malai']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Veg Clear'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hot and Sour']
                ],
            },
            'Dry Item': {
                limit: 1,
                options: [
                    items['Dry Item']['Gobi Manchurian'],
                    items['Dry Item']['Gobi 65'],
                    items['Dry Item']['Babycorn Manchurian'],
                    items['Dry Item']['Babycorn Chilli']
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    items.Breads['Kulcha'],
                    items.Breads['Naan'],
                    items.Breads['Tandoor Roti'],
                    items.Breads['Rumali Roti']
                ],
            }, 
            'Curry': {
                limit: 1,
                options: [
                    items.Curries['Paneer Butter Masala'],
                    items.Curries['Mix Veg'],
                    items.Curries['Green Peas Masala'],
                    items.Curries['Aloo Gobi'],
                    items.Curries['Mushroom Masala'],
                    items.Curries['Palak Paneer'],
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
                    items['Additional Items']['Ice Cream'],
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
    {
        id: uuidv4(),
        price: {
            min: 249,
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
                    items['Welcome Drink']['Pudina Lime'],
                    items['Welcome Drink']['Butterscotch'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon']
                ],
            },
            'Sweet': {
                limit: 2,
                options: [
                    items.Sweet['Holige With Ghee'],
                    items.Sweet['Payasa'],
                    items.Sweet['Dry Jamoon'],
                    items.Sweet['Gulab Jamoon']
                ],
            },
            'Mains': {
                limit: 1,
                options: [
                    items.Dosa['Mini Dosa'],
                    items['Fried Breakfast'].Poori
                ],
            },
            'Accompaniments': {
                limit: 1,
                options: [
                    items.Curries['Veg Kurma'],
                    items.Curries['Chana Masala'],
                    items.Accompaniments.Sambar,
                    items.Accompaniments["Coconut Chutney"],
                ],
            },
            'Rice': {
                limit: 1,
                options: [
                    items['Rice']['Tomato Rice'],
                    items['Rice']['Veg Pulav'],
                    items['Rice']['Pudina Rice'],
                    items['Rice']['Veg Biriyani'],
                ],
            },
            'Pallya': {
                limit: 2,
                options: [
                    items.Choice["Of Your Choice"],
                    items.Choice["Of Your Choice"],
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    items['Additional Items']['Kosumbari'],
                    items['Additional Items']['White Rice'],
                    items['Additional Items']['Rasam'],
                    items['Additional Items']['Papad'],
                    items['Additional Items']['Curd Rice'],
                    items['Additional Items']['Pickle'],
                    items['Additional Items']['Salt'],
                    items['Additional Items']['Banana'],
                    items['Additional Items']['Beeda'],
                    items['Additional Items']['Ice Cream'],
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
    {
        id: uuidv4(),
        price: {
            min: 399,
            max: 449,
        },
        tags: ['Best Seller'],
        person : {
            min: 30,
            max: 500
        },
        image: "https://miro.medium.com/v2/resize:fit:1031/1*DhXClQKaca5BDvGK1KxX7Q.png",
        name: 'South & North Buffet',
        sections : {
            'Welcome Drink': {
                limit: 1,
                options: [
                    items['Welcome Drink']['Pudina Lime'],
                    items['Welcome Drink']['Butterscotch'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Muskmelon']
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    items.Sweet['Dry Jamoon'],
                    items.Sweet['Champakali'],
                    items.Sweet['Gulab Jamoon'],
                    items.Sweet['Ras Malai']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Veg Clear'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hot and Sour']
                ],
            },
            'Dry Item': {
                limit: 1,
                options: [
                    items['Dry Item']['Gobi Manchurian'],
                    items['Dry Item']['Gobi 65'],
                    items['Dry Item']['Babycorn Manchurian'],
                    items['Dry Item']['Babycorn Chilli']
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    items['Fried Breakfast']['Poori'],
                    items.Rotti['Akki Rotti'],
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
                    items['Additional Items']['Pickle'],
                    items['Additional Items']['Salt'],
                    items['Additional Items']['Beeda'],
                    items['Additional Items']['Ice Cream'],
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