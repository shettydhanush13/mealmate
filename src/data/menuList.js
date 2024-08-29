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
            min: 10,
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
            min: 299,
            max: 349,
        },
        tags: ['Best Seller'],
        person : {
            min: 50,
            max: 750
        },
        image: "https://cf0316.s3.amazonaws.com/cookificom/cuisine/6-south-indian/cookificomcuisine6-south-indiansi-banner-3ba806-fbe8c3.jpg",
        name: 'South Indian Buffet ( Lunch )',
        sections : {}
    },
  ];