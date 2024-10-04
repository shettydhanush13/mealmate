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
            mains: {
                limit: 2,
                options: [
                    items.Breakfast.Idly,
                    items.Breakfast.Vada,
                    items.Breakfast['Kesari Bath'],
                    items.Breakfast.Upma
                ],
            },
            sides: {
                limit: 3,
                options: [
                    items.Accompaniments['Coconut Chutney'],
                    items.Accompaniments['Corriander Chutney'],
                    items.Accompaniments['Tomato Chutney'],
                    items.Accompaniments['Sambar']
                ],
            },
            beverages: {
                limit: 1,
                options: [
                    items.Beverages.Coffee,
                    items.Beverages.Tea
                ],
            },
            extras: {
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
                    items['Welcome Drink']['Grape'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Pineapple']
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    items.Sweet['Dry Jamoon'],
                    items.Sweet['Champakali'],
                    items.Sweet['Gulab Jamoon'],
                    items.Sweet['Rasagulla']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Veg clear'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hout and Sour']
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
                    items.Bread['Kulcha'],
                    items.Bread['Naan'],
                    items.Bread['Tandoor Roti'],
                    items.Bread['Rumali roti']
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
            'Rice Specialities': {
                limit: 1,
                options: [
                    items['Rice Specialities']['Panner Fried Rice'],
                    items['Rice Specialities']['Veg Biriyani'],
                    items['Rice Specialities']['Handi Biriyani'],
                    items['Rice Specialities']['Palak Rice'],
                    items['Rice Specialities']['Mughlai Biriyani'],
                    items['Rice Specialities']['Peas Pulav'],
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
            extras: {
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
                    items['Welcome Drink']['Grape'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Pineapple']
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
            // 'Mains': {
            //     limit: 1,
            //     options: [
            //         {
            //             name: 'Mini dosa',
            //             desc: '',
            //             image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCu0xaI3WqSLCRZwngAuTmVQBmeYk60g49GRHriVrCkr59Q7S3A-HJnkV6TNNpWwACN5IeFjsavqoQB8UjGI51MdjsLcSPWhctK-Qw25ErT708Tnpv08QoiQSJS9w2KIIxbcq9TQLrCeo/s1600/Multigrain+Mini+Dosa+1.JPG',
            //             veg: true,
            //             id: 1
            //         },
            //         {
            //             name: 'Poori',
            //             desc: '',
            //             image: 'https://www.indianveggiedelight.com/wp-content/uploads/2020/10/poori-recipe-featured.jpg',
            //             veg: true,
            //             id: 2
            //         },
            //     ],
            // },
            'Curries': {
                limit: 1,
                options: [
                    items.Curries['Veg Kurma'],
                    items.Curries['Chana Masala'],
                ],
            },
            'Rice Specialities': {
                limit: 1,
                options: [
                    items['Rice Specialities']['Tomato Rice'],
                    items['Rice Specialities']['Veg Pulav'],
                    items['Rice Specialities']['Pudina Rice'],
                    items['Rice Specialities']['Veg Biriyani'],
                ],
            },
            // 'Pallya': {
            //     limit: 2,
            //     options: [
            //         {
            //             name: 'Pallya 1',
            //             textField: true,
            //             desc: '',
            //             image: '',
            //             veg: true,
            //             id: 1
            //         },
            //         {
            //             name: 'Pallya 2',
            //             textField: true,
            //             desc: '',
            //             image: '',
            //             veg: true,
            //             id: 2
            //         },
            //     ],
            // },
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
            extras: {
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
                    items['Welcome Drink']['Grape'],
                    items['Welcome Drink']['Watermelon'],
                    items['Welcome Drink']['Pineapple']
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    items.Sweet['Dry Jamoon'],
                    items.Sweet['Champakali'],
                    items.Sweet['Gulab Jamoon'],
                    items.Sweet['Rasagulla']
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    items.Soup['Tomato'],
                    items.Soup['Veg clear'],
                    items.Soup['Sweet Corn'],
                    items.Soup['Hout and Sour']
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
                    items.Bread['Poori'],
                    items.Bread['Roti'],
                    items.Bread['Akki rotti'],
                    items.Bread['Rumali roti']
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
            'Rice Specialities': {
                limit: 1,
                options: [
                    items['Rice Specialities']['Panner Fried Rice'],
                    items['Rice Specialities']['Veg Biriyani'],
                    items['Rice Specialities']['Handi Biriyani'],
                    items['Rice Specialities']['Palak Rice'],
                    items['Rice Specialities']['Mughlai Biriyani'],
                    items['Rice Specialities']['Peas Pulav'],
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
            extras: {
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