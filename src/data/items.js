import { v4 as uuidv4 } from 'uuid';

export const categories = {
    'Breakfast' : [
        'Idly/Vada',
        'Dosa',
        'Bath',
        'Rotti',
        'Fried Breakfast',
        'Accompaniments',
        'Beverages',
        'Welcome Drink',
        'Additional Items',
        'Extras'
    ],
    'Lunch/Dinner' : [
        'Welcome Drink',
        'Soup',
        'Dry Item',
        'Breads',
        'Curries',
        'Rice',
        'Noodles',
        'Chinese',
        'Sweet',
        'Additional Items',
        'Extras'
    ],
    'Snacks': [
        'Idly/Vada',
        'Dosa',
        'Noodles',
        'Chinese',
        'Additional Items',
        'Extras'
    ]
};

export const items = {
    'Idly/Vada': {
        'Single Idly' : {
            name: 'Single Idly',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 15
        },
        'Idly' : {
            name: 'Idly',
            desc: '2 pcs',
            veg: true,
            id: uuidv4(),
            price: 30
        },
        'Button Idly' : {
            name: 'Button Idly',
            desc: '12 pcs',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Ghee Pudi Idly' : {
            name: 'Ghee Pudi Idly',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Rava Idly' : {
            name: 'Rava Idly',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 45
        },
        'Single Vada' : {
            name: 'Single Vada',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 35
        },
        'Vada' : {
            name: 'Vada',
            desc: '2 pc',
            veg: true,
            id: uuidv4(),
            price: 69
        },
        'Single Idly Vada' : {
            name: 'Single Idly Vada',
            desc: '1 pc each',
            veg: true,
            id: uuidv4(),
            price: 55
        },
        'Idly Vada' : {
            name: 'Idly Vada',
            desc: 'Idly (2 pc) Vada (1 pc)',
            veg: true,
            id: uuidv4(),
            price: 55
        },
    },
    'Dosa': {
        'Ghee Masala Dosa' : {
            name: 'Ghee Masala Dosa',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 89
        },
        'Set Dosa' : {
            name: 'Set Dosa',
            desc: '2 pcs',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mysore Masala Dosa' : {
            name: 'Mysore Masala Dosa',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 99
        },
        'Onion Dosa' : {
            name: 'Onion Dosa',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Mini Dosa' : {
            name: 'Mini Dosa',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 35
        },
    },
    'Accompaniments': {
        'Coconut Chutney' : {
            name: 'Coconut Chutney',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Corriander Chutney' : {
            name: 'Corriander Chutney',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Tomato Chutney' : {
            name: 'Tomato Chutney',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Sambar' : {
            name: 'Sambar',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Dal' : {
            name: 'Dal',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Boondi' : {
            name: 'Boondi',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        }
    },
    'Bath' : {
        'Kesari Bath' : {
            name: 'Kesari Bath',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 30
        },
        'Khara Bath' : {
            name: 'Khara Bath',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 30
        },
        'Chow Chow Bath' : {
            name: 'Chow Chow Bath',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 60
        },
        'Bisi Bele Bath' : {
            name: 'Bisi Bele Bath',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 50
        },
        'Pongal' : {
            name: 'Pongal',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 50
        },
        'Shavige Bath' : {
            name: 'Shavige Bath',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 45
        },
        'Rice Bath' : {
            name: 'Rice Bath',
            desc: 'Of your choice',
            veg: true,
            id: uuidv4(),
            price: 50
        }, 
    },
    'Rotti' : {
        'Akki Rotti' : {
            name: 'Akki Rotti',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 30
        },
        'Ragi Rotti' : {
            name: 'Ragi Rotti',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 30
        },
    },
    'Fried Breakfast': {
        'Mangalore Buns' : {
            name: 'Mangalore Buns',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 30
        },
        'Bonda' : {
            name: 'Bonda',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 10
        },
        'Bajji' : {
            name: 'Bajji',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 10
        },
        'Poori' : {
            name: 'Poori',
            desc: '2 Pcs',
            veg: true,
            id: uuidv4(),
            price: 49
        },
    },
    'Beverages': {
        'Coffee' : {
            name: 'Coffee',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 15
        },
        'Tea' : {
            name: 'Tea',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 15
        },
        'Badam Milk' : {
            name: 'Badam Milk',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 20
        },
    },
    'Pallya': {
        'Beans-Carrot' : {
            name: 'Beans-Carrot',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 15
        },
        'Thondekaayi-Cashew' : {
            name: 'Thondekaayi-Cashew',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 15
        },
        'Suvarnagadde-Kabul Chana' : {
            name: 'Suvarnagadde-Kabul Chana',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 20
        },
        'Aloo-Matar' : {
            name: 'Aloo-Matar',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 20
        },
        'Bendi dry' : {
            name: 'Bendi dry',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 20
        },
    },
    'Welcome Drink': {
        'Mint Lime' : {
            'name': 'Mint Lime',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 35
        },
        'Butterscotch' : {
            name: 'Butterscotch',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49,
            extraPricing: 15,
        },
        'Watermelon' : {
            name: 'Watermelon',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 35
        },
        'Muskmelon': {
            name: 'Muskmelon',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 40,
            extraPricing: 5,
        }
    },
    'Soup': {
        'Tomato' : {
            name: 'Tomato',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Veg Clear' : {
            name: 'Veg Clear',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Sweet Corn' : {
            name: 'Sweet Corn',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Hot and Sour' : {
            name: 'Hot and Sour',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Veg Manchow' : {
            name: 'Veg Manchow',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        }
    },
    'Dry Item': {
        'Gobi Manchurian' : {
            name: 'Gobi Manchurian',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Veg Ball Manchurian' : {
            name: 'Veg Ball Manchurian',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Gobi 65' : {
            name: 'Gobi 65',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Gobi Chilli' : {
            name: 'Gobi Chilli',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Babycorn Manchurian' : {
            name: 'Babycorn Manchurian',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Babycorn Chilli' : {
            name: 'Babycorn Chilli',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Babycorn Pepper Dry' : {
            name: 'Babycorn Pepper Dry',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Paneer Manchurian' : {
            name: 'Paneer Manchurian',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 75
        },
        'Paneer Chilli' : {
            name: 'Paneer Chilli',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 75
        },
        'Paneer Pepper Dry' : {
            name: 'Paneer Pepper Dry',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 75
        },
        'Paneer 65' : {
            name: 'Paneer 65',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 75
        },
        'Mushroom Manchurian' : {
            name: 'Mushroom Manchurian',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Mushroom Chilli' : {
            name: 'Mushroom Chilli',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Mushroom 65' : {
            name: 'Mushroom 65',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Mushroom Pepper Dry' : {
            name: 'Mushroom Pepper Dry',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Any Gobi Item' : {
            name: 'Any Gobi Item',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Any Babycorn Item' : {
            name: 'Any Babycorn Item',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Any Paneer Item' : {
            name: 'Any Paneer Item',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59,
            extraPricing: 30,
        },
    },
    'Breads': {
        'Single Kulcha' : {
            name: 'Single Kulcha',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Kulcha' : {
            name: 'Kulcha',
            desc: '2 pcs',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Naan' : {
            name: 'Naan',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Butter Naan' : {
            name: 'Butter Naan',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 55
        },
        'Tandoor Roti' : {
            name: 'Tandoor Roti',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 25
        },
        'Butter Tandoor Roti' : {
            name: 'Butter Tandoor Roti',
            desc: '1 pc',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 10
        },
        'Roti' : {
            name: 'Roti',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Rumali Roti' : {
            name: 'Rumali Roti',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        }
    }, 
    'Curries': {
        'Sagu' : {
            name: 'Sagu',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79
        },
        'Koot' : {
            name: 'Koot',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79
        },
        'Paneer Butter Masala' : {
            name: 'Paneer Butter Masala',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79,
            extraPricing: 30,
        },
        'Paneer Tikka Masala' : {
            name: 'Paneer Tikka Masala',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 89
        },
        'Kadai Paneer' : {
            name: 'Kadai Paneer',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79
        },
        'Palak Paneer' : {
            name: 'Palak Paneer',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 69,
            extraPricing: 30
        },
        'Matar Paneer' : {
            name: 'Matar Paneer',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79
        },
        'Shahi Paneer' : {
            name: 'Shahi Paneer',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 99
        },
        'Dal Tadka' : {
            name: 'Dal Tadka',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 79
        },
        'Dal Fry' : {
            name: 'Dal Fry',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 69
        },
        'Mix Veg' : {
            name: 'Mix Veg',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 65
        },
        'Green Peas Masala' : {
            name: 'Green Peas Masala',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Aloo Gobi' : {
            name: 'Aloo Gobi',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 59
        },
        'Mushroom Masala' : {
            name: 'Mushroom Masala',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 65
        },
        'Kadai Mushroom' : {
            name: 'Kadai Mushroom',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 75
        },
        'Veg Kofta' : {
            name: 'Veg Kofta',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 89
        },
        'Chana Masala' : {
            name: 'Chana Masala',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 69
        },
        'Veg Kurma' : {
            name: 'Veg Kurma',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
    },
    'Rice': {
        'Paneer Fried Rice' : {
            name: 'Paneer Fried Rice',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mushroom Fried Rice' : {
            name: 'Mushroom Fried Rice',
            desc: '',
            id: uuidv4(),
            price: 49
        },
        'Paneer Schezwan Fried Rice' : {
            name: 'Paneer Schezwan Fried Rice',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mushroom Schezwan Fried Rice' : {
            name: 'Mushroom Schezwan Fried Rice',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Veg Biriyani' : {
            name: 'Veg Biriyani',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Handi Biriyani' : {
            name: 'Handi Biriyani',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Palak Rice' : {
            name: 'Palak Rice',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mughlai Biriyani' : {
            name: 'Mughlai Biriyani',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Peas Pulav' : {
            name: 'Peas Pulav',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Tomato Rice' : {
            name: 'Tomato Rice',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Veg Pulav' : {
            name: 'Veg Pulav / Raitha',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Pudina Rice' : {
            name: 'Pudina Rice',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Lemon Rice' : {
            name: 'Lemon Rice',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Puliyogare' : {
            name: 'Puliyogare',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Ghee Rice' : {
            name: 'Ghee Rice / Veg Kurma',
            desc: '100g',
            veg: true,
            id: uuidv4(),
            price: 49
        },
    },
    'Noodles': {
        'Paneer Hakka Noodles' : {
            name: 'Paneer Hakka Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Paneer Schezwan Noodles' : {
            name: 'Paneer Schezwan Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Paneer Burnt Garlic Noodles' : {
            name: 'Paneer Burnt garlic Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mushroom Hakka Noodles' : {
            name: 'Mushroom Hakka Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mushroom Schezwan Noodles' : {
            name: 'Mushroom Schezwan Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
        'Mushroom Burnt Garlic Noodles' : {
            name: 'Mushroom Burnt garlic Noodles',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 49
        },
    },
    'Chinese': {
        'Honey Chilli Potato' : {
            name: 'Honey Chilli Potato',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'French Fries' : {
            name: 'French Fries',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Sweet Corn Spicy' : {
            name: 'Sweet Corn Spicy',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Manchurian Gravy' : {
            name: 'Manchurian Gravy',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        },
        'Schezwan Chutney' : {
            name: 'Schezwan Chutney',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 0
        }
    },
    'Sweet': {
        'Dry Jamoon' : {
            name: 'Dry Jamoon',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 19
        },
        'Champakali' : {
            name: 'Champakali',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 25
        },
        'Gulab Jamoon' : {
            name: 'Gulab Jamoon',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 19
        },
        'Ras Malai' : {
            name: 'Ras Malai',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 25
        },
        'Holige With Ghee' : {
            name: 'Holige With Ghee',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Payasa' : {
            name: 'Payasa',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Mysore Pak' : {
            name: 'Mysore Pak',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Malai Sandwich' : {
            name: 'Malai Sandwich',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Jahangir' : {
            name: 'Jahangir',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29
        },
        'Jalebi' : {
            name: 'Jalebi',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29
        },
    },
    'Extra Sweet': {
        'Dry Jamoon' : {
            name: 'Dry Jamoon',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 19,
            extraPricing: 20,
        },
        'Champakali' : {
            name: 'Champakali',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 25,
            extraPricing: 20,
        },
        'Gulab Jamoon' : {
            name: 'Gulab Jamoon',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 19,
            extraPricing: 20,
        },
        'Ras Malai' : {
            name: 'Ras Malai',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 25,
            extraPricing: 20,
        },
        'Holige With Ghee' : {
            name: 'Holige With Ghee',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
        'Payasa' : {
            name: 'Payasa',
            desc: '',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
        'Mysore Pak' : {
            name: 'Mysore Pak',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
        'Malai Sandwich' : {
            name: 'Malai Sandwich',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
        'Jahangir' : {
            name: 'Jahangir',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
        'Jalebi' : {
            name: 'Jalebi',
            desc: '1 piece',
            veg: true,
            id: uuidv4(),
            price: 29,
            extraPricing: 20,
        },
    },
    'Additional Items': {
        'Kosumbari' : {
            name: 'Kosumbari',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 10
        },
        'Raitha' : {
            name: 'Raitha',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 0
        },
        'Green Salad' : {
            name: 'Green Salad',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'White Rice' : {
            name: 'White Rice',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Rasam' : {
            name: 'Rasam',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Papad' : {
            name: 'Papad',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Curd Rice' : {
            name: 'Curd Rice / Curd',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Curd' : {
            name: 'Curd',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 10
        },
        'Pickle' : {
            name: 'Pickle',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Salt' : {
            name: 'Salt',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Banana' : {
            name: 'Banana',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Beeda' : {
            name: 'Sweet Beeda',
            desc: '',
            veg: true,
            fixed: true,
            id: uuidv4(),
            price: 49
        },
        'Ice Cream' : {
            name: 'Ice Cream',
            desc: '',
            veg: true,
            fixed: true,
            options: [],
            id: uuidv4(),
            price: 49,
            extraPricing: 20
        }
    },
    'Extras': {
        'Tissues' : {
            name: 'Tissues',
            desc: '2 Pcs',
            veg: null,
            id: uuidv4(),
            price: 0
        },
        'Cutlery' : {
            name: 'Cutlery',
            desc: '',
            veg: null,
            id: uuidv4(),
            price: 5,
            extraPricing: 5,
        },
        'Buffet Plate' :{
            name: 'Buffet Plate',
            desc: '',
            veg: null,
            id: uuidv4(),
            price: 10,
            extraPricing: 10,
        },
        'Water Bottle' : {
            name: 'Water Bottle',
            desc: '300ml',
            veg: null,
            id: uuidv4(),
            price: 10,
            extraPricing: 10,
        }
    },
}