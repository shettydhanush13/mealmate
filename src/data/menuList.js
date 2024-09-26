export const menuList = [
    {
        id: 123,
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
                    {
                        name: 'idly',
                        desc: '2 pcs',
                        image: 'https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/ca91de461d1f77afcfbfd9fe02d5cd0d',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'vada',
                        desc: '1 pc',
                        image: 'https://firsttimercook.com/wp-content/uploads/2019/08/Medu2BVada2B3.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'kesari bath',
                        desc: '100g',
                        image: 'https://www.ticklingpalates.com/wp-content/uploads/2022/09/rava-kesari-recipe.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'upma',
                        desc: '100g',
                        image: 'https://myfoodstory.com/wp-content/uploads/2022/11/Vegetable-Upma-3.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            sides: {
                limit: 3,
                options: [
                    {
                        name: 'coconut chutney',
                        desc: '',
                        image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2010/07/coconut-chutney-easy-500x500.jpg',
                        veg: true,
                        id: 5
                    },
                    {
                        name: 'corriander chutney',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2021/07/coriander-coconut-chutney-recipe-featured.jpg',
                        veg: true,
                        id: 6
                    },
                    {
                        name: 'tomato chutney',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2020/06/onion-tomato-chutney-featured.jpg',
                        veg: true,
                        id: 7
                    },
                    {
                        name: 'sambar',
                        desc: '',
                        image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/05/sambar.jpg',
                        veg: true,
                        id: 8
                    }
                ],
            },
            beverages: {
                limit: 1,
                options: [
                    {
                        name: 'coffee',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQlOFVxj0MmE6LfG8GUkeouhcq58VHuW2Atw&s',
                        veg: true,
                        id: 9
                    },
                    {
                        name: 'tea',
                        desc: '',
                        image: 'https://static.toiimg.com/photo/83173328.cms',
                        veg: true,
                        id: 10
                    }
                ],
            },
            extras: {
                limit: 4,
                options: [
                    {
                        name: 'buffet plate',
                        desc: '',
                        image: 'https://rukminim2.flixcart.com/image/850/1000/j5h264w0/plate-tray-dish/p/r/b/arecanut-leaf-plates-12-pack-of-25-dinner-plates-beej-original-imaevzrgzyn7ewyf.jpeg?q=90&crop=false',
                        veg: null,
                        id: 11
                    },
                    {
                        name: 'cutlery',
                        desc: '',
                        image: 'https://www.jiomart.com/images/product/original/rvtgy0glpq/alu-freshh-wooden-spoons-200-pack-160mm-6-3-inch-spoons-biodegradable-spoons-utensils-for-party-food-grade-bamboo-spoon-big-size-use-throw-spoons-for-parties-weddings-travel-camping-events-product-images-orvtgy0glpq-p609400189-0-202406192042.jpg?im=Resize=(420,420)',
                        veg: null,
                        id: 12
                    },
                    {
                        name: 'tissues',
                        desc: '',
                        image: 'https://img1.exportersindia.com/product_images/bc-full/2021/10/8681472/tissue-paper-1634630746-6042901.jpeg',
                        veg: null,
                        id: 13
                    },
                    {
                        name: 'water bottle',
                        desc: '',
                        image: 'https://4.imimg.com/data4/UN/TI/MY-3286626/plastic-pet-bottle.jpg',
                        veg: null,
                        id: 14
                    }
                ],
            }
        }
    },
    {
        id: 234,
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
                    {
                        name: 'Pudina Lime',
                        desc: '',
                        image: 'https://thetravelbite.com/wp-content/uploads/2021/06/Mint-Lemonade-TheTravelBite.com-16-scaled.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Grape',
                        desc: '',
                        image: 'https://vaya.in/recipes/wp-content/uploads/2018/02/Grape-Juice.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Watermelon',
                        desc: '',
                        image: 'https://www.flavourstreat.com/wp-content/uploads/2022/08/homemade-watermelon-juice.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Pineapple',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/176851361/photo/pineapple-juice.jpg?s=612x612&w=0&k=20&c=glIriwCuCAoXZ2qjrtVJRFsMHwbf8w_zl5n7D-nIvvE=',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    {
                        name: 'Dry Jamoon',
                        desc: '',
                        image: 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/nithya.anantham/Dry_Jamun_Recipe.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Campakali',
                        desc: '',
                        image: 'https://kantis.in/Images/ShoppingPhotos/Champakali.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Gulab Jamoon',
                        desc: '',
                        image: 'https://static.toiimg.com/thumb/63799510.cms?imgsize=1091643&width=800&height=800',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Rasagulla',
                        desc: '',
                        image: 'https://www.thespruceeats.com/thmb/LRHVkNnPFRGjN5LixQWD1C9Pnjw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/rasgulla-indian-dessert-1957839-hero-01-7c3528a2d34a4f1b9248c7483a73d0a6.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    {
                        name: 'Tomato',
                        desc: '',
                        image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/tomato-soup.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Veg clear',
                        desc: '',
                        image: 'https://content.jwplatform.com/thumbs/KJzqk0nG-720.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Sweet Corn',
                        desc: '',
                        image: 'https://www.kuchpakrahahai.in/wp-content/uploads/2017/01/Sweet-Corn-Soup-Recipe-1-1.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Hout and Sour',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbjoYGU2Xp-sJtBTyqzhiupc0W20r0wyldZQ&s',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Dry Item': {
                limit: 1,
                options: [
                    {
                        name: 'Gobi Manchurian',
                        desc: '',
                        image: 'https://www.puvi.co/uploaded_images/1687763083.jpeg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Gobi 65',
                        desc: '',
                        image: 'https://traditionallymodernfood.com/wp-content/uploads/2023/08/gobi-65-cauliflower-65-restaurant-style-24-scaled.jpeg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Babycorn Manchurian',
                        desc: '',
                        image: 'https://i.pinimg.com/564x/3b/e4/56/3be456ebc1bcec183116434e53b82962.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Babycorn Chilli',
                        desc: '',
                        image: 'https://adm.fifthseason.com.sg//Dynamic/Products/18/Images/chrispy%20chilli%20baby%20corn%20.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    {
                        name: 'Kulcha',
                        desc: '',
                        image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2018/10/kulcha-recipe-1.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Naan',
                        desc: '',
                        image: 'https://images.kosher.com/details.slide/n/a/naan_shutterstock_364884215.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Tandoor Roti',
                        desc: '',
                        image: 'https://www.cookwithmanali.com/wp-content/uploads/2021/07/Tandoori-Roti.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Rumali roti',
                        desc: '',
                        image: 'https://mpbreakingnews.in/wp-content/uploads/2022/07/mpbreaking17984169.jpeg',
                        veg: true,
                        id: 4
                    }
                ],
            }, 
            'Curries': {
                limit: 1,
                options: [
                    {
                        name: 'Paneer butter masala',
                        desc: '',
                        image: 'https://homecookingcollective.com/wp-content/uploads/2024/01/Butter_Paneer_LEAD_1-2-2.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Mix veg',
                        desc: '',
                        image: 'https://shwetainthekitchen.com/wp-content/uploads/2023/03/mixed-vegetable-curry.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Green Peas masala',
                        desc: '',
                        image: 'https://savoryspin.com/wp-content/uploads/2023/06/30-minute-Green-Pea-Curry-with-frozen-green-peas.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Aloo Gobi',
                        desc: '',
                        image: 'https://www.seriouseats.com/thmb/gTVjyFHq-N3iyv08113cBQWCTv8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20220303-aloo-gobi-vicky-wasik-35-c9afccd574534761886e5964f34586e1.jpg',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Mushroom Masala',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlXOK2TQgRrZ3tQ2hlrh2cjqp7B2YXGMbzkg&s',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Palak Paneer',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/10/palak-paneer-recipe-featured.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Rice Specialities': {
                limit: 1,
                options: [
                    {
                        name: 'Veg Fried Rice',
                        desc: '',
                        image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2020/12/fried-rice.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Veg Biriyani',
                        desc: '',
                        image: 'https://slurrp.club/wp-content/uploads/2021/10/DSC_0037-2-750x541.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Handi Biriyani',
                        desc: '',
                        image: 'https://assets.limetray.com/assets/user_images/menus/compressed/1606114982_HyderabadiVeg.JPG',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Palak Rice',
                        desc: '',
                        image: 'https://data.thefeedfeed.com/static/2020/09/25/16010540885f6e258807132.jpg',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Mughlai Biriyani',
                        desc: '',
                        image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2015/12/mughlai-vegetable-biryani-recipe.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Peas Pulav',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9O2qP9R5bJD_gi0JXN6F08lAXq566pynDSxWZpJowOd9AnGX6ppLVXXJbjvfNTazKntc&usqp=CAU',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    {
                        name: 'Raitha',
                        desc: '',
                        image: 'https://www.ruchikrandhap.com/wp-content/uploads/2017/08/Cucumber-Onion-Raitha-2-1-1024x683.jpg',
                        veg: true,
                        fixed: true,
                        id: 1
                    },
                    {
                        name: 'Green Salad',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo4Vb6eqcQZUAOUdxGMqA3_gum5J-FukHssg&s',
                        veg: true,
                        fixed: true,
                        id: 2
                    },
                    {
                        name: 'White Rice',
                        desc: '',
                        image: 'https://www.allrecipes.com/thmb/RKpnSHLUDT2klppYgx8jAF47GyM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/52490-PuertoRicanSteamedRice-DDMFS-061-4x3-3c3da714aa614037ad1c135ec303526d.jpg',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Rasam',
                        desc: '',
                        image: 'https://aahaaramonline.com/wp-content/uploads/2023/12/Sathukudi_Rasam_Sweet_Lime_Rasam_Mosambi_Rasam.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Papad',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/666595984/photo/indian-snacks-deep-fried-crackers-or-papad-mung-dal-and-urad-dal-papad-an-indian-fried-dish.jpg?s=612x612&w=0&k=20&c=WNBWP2z6sXYhPSFbfxmVJe1oVkWtQHY-lc7RbWeM84o=',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Curd Rice',
                        desc: '',
                        image: 'https://www.chefkunalkapur.com/wp-content/uploads/2023/05/DSC09411-1300x731.jpg?v=1684031938',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Beeda',
                        desc: '',
                        image: 'https://maduraievents.in/wp-content/uploads/2014/03/beeda-shop-wedding.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Ice Cream',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/1179267189/photo/ice-cream-scoop-on-plate-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=42BfXbsindzgDjmiV3DtjbtjW1T7BhB5GzW-2GTXG78=',
                        veg: true,
                        fixed: true,
                        options: [],
                        id: 4
                    }
                ],
            },
            extras: {
                limit: 4,
                options: [
                    {
                        name: 'buffet plate',
                        desc: '',
                        image: 'https://rukminim2.flixcart.com/image/850/1000/j5h264w0/plate-tray-dish/p/r/b/arecanut-leaf-plates-12-pack-of-25-dinner-plates-beej-original-imaevzrgzyn7ewyf.jpeg?q=90&crop=false',
                        veg: null,
                        id: 11
                    },
                    {
                        name: 'cutlery',
                        desc: '',
                        image: 'https://www.jiomart.com/images/product/original/rvtgy0glpq/alu-freshh-wooden-spoons-200-pack-160mm-6-3-inch-spoons-biodegradable-spoons-utensils-for-party-food-grade-bamboo-spoon-big-size-use-throw-spoons-for-parties-weddings-travel-camping-events-product-images-orvtgy0glpq-p609400189-0-202406192042.jpg?im=Resize=(420,420)',
                        veg: null,
                        id: 12
                    },
                    {
                        name: 'tissues',
                        desc: '',
                        image: 'https://img1.exportersindia.com/product_images/bc-full/2021/10/8681472/tissue-paper-1634630746-6042901.jpeg',
                        veg: null,
                        id: 13
                    },
                    {
                        name: 'water bottle',
                        desc: '',
                        image: 'https://4.imimg.com/data4/UN/TI/MY-3286626/plastic-pet-bottle.jpg',
                        veg: null,
                        id: 14
                    }
                ],
            }            
        }
    },
    {
        id: 234,
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
                    {
                        name: 'Pudina Lime',
                        desc: '',
                        image: 'https://thetravelbite.com/wp-content/uploads/2021/06/Mint-Lemonade-TheTravelBite.com-16-scaled.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Grape',
                        desc: '',
                        image: 'https://vaya.in/recipes/wp-content/uploads/2018/02/Grape-Juice.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Watermelon',
                        desc: '',
                        image: 'https://www.flavourstreat.com/wp-content/uploads/2022/08/homemade-watermelon-juice.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Pineapple',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/176851361/photo/pineapple-juice.jpg?s=612x612&w=0&k=20&c=glIriwCuCAoXZ2qjrtVJRFsMHwbf8w_zl5n7D-nIvvE=',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Sweet': {
                limit: 2,
                options: [
                    {
                        name: 'Holige with ghee',
                        desc: '',
                        image: 'https://pbs.twimg.com/media/FZYKb26UUAARido.jpg:large',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Payasa',
                        desc: '',
                        image: 'https://i.pinimg.com/564x/dd/50/24/dd502431f66a9c4fba04c77ad460de6e.jpg',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Dry Jamoon',
                        desc: '',
                        image: 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/nithya.anantham/Dry_Jamun_Recipe.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Gulab Jamoon',
                        desc: '',
                        image: 'https://static.toiimg.com/thumb/63799510.cms?imgsize=1091643&width=800&height=800',
                        veg: true,
                        id: 3
                    },
                ],
            },
            'Mains': {
                limit: 1,
                options: [
                    {
                        name: 'Mini dosa',
                        desc: '',
                        image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCu0xaI3WqSLCRZwngAuTmVQBmeYk60g49GRHriVrCkr59Q7S3A-HJnkV6TNNpWwACN5IeFjsavqoQB8UjGI51MdjsLcSPWhctK-Qw25ErT708Tnpv08QoiQSJS9w2KIIxbcq9TQLrCeo/s1600/Multigrain+Mini+Dosa+1.JPG',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Poori',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2020/10/poori-recipe-featured.jpg',
                        veg: true,
                        id: 2
                    },
                ],
            },
            'Curries': {
                limit: 1,
                options: [
                    {
                        name: 'Veg kurma',
                        desc: '',
                        image: 'https://i0.wp.com/curryandvanilla.com/wp-content/uploads/2019/06/Tamil-Style-Vegatable-Kurma-4b.jpg?w=720&ssl=1',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Chana masala',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh0wY-WVTJ0X7box1spdWZHT-X8IbQ5gntdA&s',
                        veg: true,
                        id: 2
                    },
                ],
            },
            'Rice Specialities': {
                limit: 1,
                options: [
                    {
                        name: 'Tomato Rice',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7dX_aa-tXL4b8FUWC07vbkFC4r2B_P_XZJQ&s',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Veg Pulao',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2019/07/veg-pulao-featured.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Pudina rice',
                        desc: '',
                        image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2018/09/pudina-pulao-recipe-1-500x500.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Veg Biriyani',
                        desc: '',
                        image: 'https://slurrp.club/wp-content/uploads/2021/10/DSC_0037-2-750x541.jpg',
                        veg: true,
                        id: 2
                    },
                ],
            },
            'Pallya': {
                limit: 2,
                options: [
                    {
                        name: 'Pallya 1',
                        textField: true,
                        desc: '',
                        image: '',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Pallya 2',
                        textField: true,
                        desc: '',
                        image: '',
                        veg: true,
                        id: 2
                    },
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    {
                        name: 'Kosumbari',
                        desc: '',
                        image: 'https://traditionallymodernfood.com/wp-content/uploads/2023/04/kosumalli-recipe-kosambari-22-scaled.jpeg',
                        veg: true,
                        fixed: true,
                        id: 1
                    },
                    {
                        name: 'White Rice',
                        desc: '',
                        image: 'https://www.allrecipes.com/thmb/RKpnSHLUDT2klppYgx8jAF47GyM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/52490-PuertoRicanSteamedRice-DDMFS-061-4x3-3c3da714aa614037ad1c135ec303526d.jpg',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Rasam',
                        desc: '',
                        image: 'https://aahaaramonline.com/wp-content/uploads/2023/12/Sathukudi_Rasam_Sweet_Lime_Rasam_Mosambi_Rasam.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Papad',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/666595984/photo/indian-snacks-deep-fried-crackers-or-papad-mung-dal-and-urad-dal-papad-an-indian-fried-dish.jpg?s=612x612&w=0&k=20&c=WNBWP2z6sXYhPSFbfxmVJe1oVkWtQHY-lc7RbWeM84o=',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Curd Rice',
                        desc: '',
                        image: 'https://www.chefkunalkapur.com/wp-content/uploads/2023/05/DSC09411-1300x731.jpg?v=1684031938',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Pickle',
                        desc: '',
                        image: 'https://i0.wp.com/florafoods.in/wp-content/uploads/2019/11/Amla-Pickle-3.jpg?fit=800%2C800&ssl=1',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Salt',
                        desc: '',
                        image: 'https://jindalnaturecure.in/wp-content/uploads/2018/11/Beware-of-common-salt.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Banana',
                        desc: '',
                        image: 'https://th-thumbnailer.cdn-si-edu.com/Yick6se-AqxGPo1w2caBgFSgFsY=/fit-in/1200x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/20110721125011banana2.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Beeda',
                        desc: '',
                        image: 'https://maduraievents.in/wp-content/uploads/2014/03/beeda-shop-wedding.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Ice Cream',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/1179267189/photo/ice-cream-scoop-on-plate-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=42BfXbsindzgDjmiV3DtjbtjW1T7BhB5GzW-2GTXG78=',
                        veg: true,
                        fixed: true,
                        options: [],
                        id: 4
                    }
                ],
            },
        }
    },
    {
        id: 234,
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
                    {
                        name: 'Pudina Lime',
                        desc: '',
                        image: 'https://thetravelbite.com/wp-content/uploads/2021/06/Mint-Lemonade-TheTravelBite.com-16-scaled.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Grape',
                        desc: '',
                        image: 'https://vaya.in/recipes/wp-content/uploads/2018/02/Grape-Juice.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Watermelon',
                        desc: '',
                        image: 'https://www.flavourstreat.com/wp-content/uploads/2022/08/homemade-watermelon-juice.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Pineapple',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/176851361/photo/pineapple-juice.jpg?s=612x612&w=0&k=20&c=glIriwCuCAoXZ2qjrtVJRFsMHwbf8w_zl5n7D-nIvvE=',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Sweet': {
                limit: 1,
                options: [
                    {
                        name: 'Dry Jamoon',
                        desc: '',
                        image: 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/nithya.anantham/Dry_Jamun_Recipe.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Campakali',
                        desc: '',
                        image: 'https://kantis.in/Images/ShoppingPhotos/Champakali.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Gulab Jamoon',
                        desc: '',
                        image: 'https://static.toiimg.com/thumb/63799510.cms?imgsize=1091643&width=800&height=800',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Rasagulla',
                        desc: '',
                        image: 'https://www.thespruceeats.com/thmb/LRHVkNnPFRGjN5LixQWD1C9Pnjw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/rasgulla-indian-dessert-1957839-hero-01-7c3528a2d34a4f1b9248c7483a73d0a6.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Soup': {
                limit: 1,
                options: [
                    {
                        name: 'Tomato',
                        desc: '',
                        image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/tomato-soup.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Veg clear',
                        desc: '',
                        image: 'https://content.jwplatform.com/thumbs/KJzqk0nG-720.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Sweet Corn',
                        desc: '',
                        image: 'https://www.kuchpakrahahai.in/wp-content/uploads/2017/01/Sweet-Corn-Soup-Recipe-1-1.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Hout and Sour',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbjoYGU2Xp-sJtBTyqzhiupc0W20r0wyldZQ&s',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Dry Item': {
                limit: 1,
                options: [
                    {
                        name: 'Gobi Manchurian',
                        desc: '',
                        image: 'https://www.puvi.co/uploaded_images/1687763083.jpeg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Gobi 65',
                        desc: '',
                        image: 'https://traditionallymodernfood.com/wp-content/uploads/2023/08/gobi-65-cauliflower-65-restaurant-style-24-scaled.jpeg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Babycorn Manchurian',
                        desc: '',
                        image: 'https://i.pinimg.com/564x/3b/e4/56/3be456ebc1bcec183116434e53b82962.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Babycorn Chilli',
                        desc: '',
                        image: 'https://adm.fifthseason.com.sg//Dynamic/Products/18/Images/chrispy%20chilli%20baby%20corn%20.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Bread': {
                limit: 1,
                options: [
                    {
                        name: 'Poori',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2020/10/poori-recipe-featured.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Roti',
                        desc: '',
                        image: 'https://atastykitchen.com/wp-content/uploads/2022/08/Roti-500x500.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Akki roti',
                        desc: '',
                        image: 'https://myperfectrecipe.com/wp-content/uploads/2020/04/akki-roti.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Rumali roti',
                        desc: '',
                        image: 'https://www.greenchickchop.in/cdn/shop/files/RumaliRoti_result.webp?v=1682660083',
                        veg: true,
                        id: 4
                    }
                ],
            }, 
            'Curries': {
                limit: 1,
                options: [
                    {
                        name: 'Paneer butter masala',
                        desc: '',
                        image: 'https://homecookingcollective.com/wp-content/uploads/2024/01/Butter_Paneer_LEAD_1-2-2.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Mix veg',
                        desc: '',
                        image: 'https://shwetainthekitchen.com/wp-content/uploads/2023/03/mixed-vegetable-curry.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Green Peas masala',
                        desc: '',
                        image: 'https://savoryspin.com/wp-content/uploads/2023/06/30-minute-Green-Pea-Curry-with-frozen-green-peas.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Aloo Gobi',
                        desc: '',
                        image: 'https://www.seriouseats.com/thmb/gTVjyFHq-N3iyv08113cBQWCTv8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20220303-aloo-gobi-vicky-wasik-35-c9afccd574534761886e5964f34586e1.jpg',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Mushroom Masala',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlXOK2TQgRrZ3tQ2hlrh2cjqp7B2YXGMbzkg&s',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Palak Paneer',
                        desc: '',
                        image: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/10/palak-paneer-recipe-featured.jpg',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Rice Specialities': {
                limit: 1,
                options: [
                    {
                        name: 'Veg Fried Rice',
                        desc: '',
                        image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2020/12/fried-rice.jpg',
                        veg: true,
                        id: 1
                    },
                    {
                        name: 'Veg Biriyani',
                        desc: '',
                        image: 'https://slurrp.club/wp-content/uploads/2021/10/DSC_0037-2-750x541.jpg',
                        veg: true,
                        id: 2
                    },
                    {
                        name: 'Handi Biriyani',
                        desc: '',
                        image: 'https://assets.limetray.com/assets/user_images/menus/compressed/1606114982_HyderabadiVeg.JPG',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Palak Rice',
                        desc: '',
                        image: 'https://data.thefeedfeed.com/static/2020/09/25/16010540885f6e258807132.jpg',
                        veg: true,
                        id: 4
                    },
                    {
                        name: 'Mughlai Biriyani',
                        desc: '',
                        image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2015/12/mughlai-vegetable-biryani-recipe.jpg',
                        veg: true,
                        id: 3
                    },
                    {
                        name: 'Peas Pulav',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9O2qP9R5bJD_gi0JXN6F08lAXq566pynDSxWZpJowOd9AnGX6ppLVXXJbjvfNTazKntc&usqp=CAU',
                        veg: true,
                        id: 4
                    }
                ],
            },
            'Fixed Items': {
                limit: 1,
                fixed: true,
                options: [
                    {
                        name: 'Raitha',
                        desc: '',
                        image: 'https://www.ruchikrandhap.com/wp-content/uploads/2017/08/Cucumber-Onion-Raitha-2-1-1024x683.jpg',
                        veg: true,
                        fixed: true,
                        id: 1
                    },
                    {
                        name: 'Green Salad',
                        desc: '',
                        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo4Vb6eqcQZUAOUdxGMqA3_gum5J-FukHssg&s',
                        veg: true,
                        fixed: true,
                        id: 2
                    },
                    {
                        name: 'White Rice',
                        desc: '',
                        image: 'https://www.allrecipes.com/thmb/RKpnSHLUDT2klppYgx8jAF47GyM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/52490-PuertoRicanSteamedRice-DDMFS-061-4x3-3c3da714aa614037ad1c135ec303526d.jpg',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Rasam',
                        desc: '',
                        image: 'https://aahaaramonline.com/wp-content/uploads/2023/12/Sathukudi_Rasam_Sweet_Lime_Rasam_Mosambi_Rasam.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Papad',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/666595984/photo/indian-snacks-deep-fried-crackers-or-papad-mung-dal-and-urad-dal-papad-an-indian-fried-dish.jpg?s=612x612&w=0&k=20&c=WNBWP2z6sXYhPSFbfxmVJe1oVkWtQHY-lc7RbWeM84o=',
                        veg: true,
                        fixed: true,
                        id: 3
                    },
                    {
                        name: 'Curd Rice',
                        desc: '',
                        image: 'https://www.chefkunalkapur.com/wp-content/uploads/2023/05/DSC09411-1300x731.jpg?v=1684031938',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Beeda',
                        desc: '',
                        image: 'https://maduraievents.in/wp-content/uploads/2014/03/beeda-shop-wedding.jpg',
                        veg: true,
                        fixed: true,
                        id: 4
                    },
                    {
                        name: 'Ice Cream',
                        desc: '',
                        image: 'https://media.istockphoto.com/id/1179267189/photo/ice-cream-scoop-on-plate-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=42BfXbsindzgDjmiV3DtjbtjW1T7BhB5GzW-2GTXG78=',
                        veg: true,
                        fixed: true,
                        options: [],
                        id: 4
                    }
                ],
            },
            extras: {
                limit: 4,
                options: [
                    {
                        name: 'buffet plate',
                        desc: '',
                        image: 'https://rukminim2.flixcart.com/image/850/1000/j5h264w0/plate-tray-dish/p/r/b/arecanut-leaf-plates-12-pack-of-25-dinner-plates-beej-original-imaevzrgzyn7ewyf.jpeg?q=90&crop=false',
                        veg: null,
                        id: 11
                    },
                    {
                        name: 'cutlery',
                        desc: '',
                        image: 'https://www.jiomart.com/images/product/original/rvtgy0glpq/alu-freshh-wooden-spoons-200-pack-160mm-6-3-inch-spoons-biodegradable-spoons-utensils-for-party-food-grade-bamboo-spoon-big-size-use-throw-spoons-for-parties-weddings-travel-camping-events-product-images-orvtgy0glpq-p609400189-0-202406192042.jpg?im=Resize=(420,420)',
                        veg: null,
                        id: 12
                    },
                    {
                        name: 'tissues',
                        desc: '',
                        image: 'https://img1.exportersindia.com/product_images/bc-full/2021/10/8681472/tissue-paper-1634630746-6042901.jpeg',
                        veg: null,
                        id: 13
                    },
                    {
                        name: 'water bottle',
                        desc: '',
                        image: 'https://4.imimg.com/data4/UN/TI/MY-3286626/plastic-pet-bottle.jpg',
                        veg: null,
                        id: 14
                    }
                ],
            }            
        }
    },
  ];