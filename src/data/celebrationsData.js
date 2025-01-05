import { v4 as uuidv4 } from "uuid";

export const celebrationsData = [
    {
      id: uuidv4(),
      title: "INTRODUCING",
      tag: "CELEBRATIONS by CATERKART",
      link: "celebrations",
      description:
        "Choose from our curated menu and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!",
      tagline: "Easy",
      banner: 'https://media.istockphoto.com/id/1152814001/vector/group-of-kids-celebrating-a-party.jpg?s=612x612&w=0&k=20&c=JLiuqc-5v-kiYnXj6EBnVOv_G6XpCgrJ4lBXGDPCSIc='
    },
  ];

export const eventTypeOptions = ['Birthday Party', 'House Party', 'Corporate Event', 'Kitty Party'];

const liveCounterOptions = [
    {
        title: 'Live Pizza',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://png.pngtree.com/png-vector/20240317/ourmid/pngtree-restaurant-team-engaged-in-pizza-making-process-png-image_11995539.png'
    },
    {
        title: 'Live Chats',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://www.creativehatti.com/wp-content/uploads/2024/01/Indian-vendor-character-selling-panipuri-snack-on-stall-Small.jpg'
    },
    {
        title: 'Live MOMO',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://cdni.iconscout.com/illustration/premium/thumb/male-chef-making-momos-illustration-download-in-svg-png-gif-file-formats--cooking-expert-professional-masterchef-food-pack-restaurants-bar-illustrations-4946000.png?f=webp'
    },
    {
        title: 'Live BBQ',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://png.pngtree.com/png-vector/20240315/ourmid/pngtree-summer-barbecue-grill-cartoon-png-image_11969568.png'
    },
    {
        title: 'Turkish Ice cream',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://static.vecteezy.com/system/resources/thumbnails/004/599/874/small_2x/turkish-ice-cream-man-selling-traditional-ice-cream-from-turkey-in-cartoon-flat-illustration-isolated-in-white-background-vector.jpg'
    },
    {
        title: 'Cocktail / Mocktail',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://i.pinimg.com/736x/7b/6e/df/7b6edf838c3d51a46c4c884e635bd7a2.jpg'
    }
    
]

const artistsOptions = [
    {
        title: 'Magician',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg'
    },
    {
        title: 'Joker',
        price: {
            max: 4500,
            min: 3500
        },
        image: 'https://img.freepik.com/free-vector/colourful-clown-cartoon-character_1308-109181.jpg'
    },
    {
        title: 'Cartoonist',
        price: {
            max: 4000,
            min: 3000
        },
        image: 'https://png.pngtree.com/png-vector/20230728/ourlarge/pngtree-fyi-clipart-cartoon-character-artist-boy-painting-realistic-abstract-artwork-on-vector-png-image_6810455.png'
    },
    {
        title: 'Tattoo Artist',
        price: {
            max: 3500,
            min: 3000
        },
        image: 'https://static.vecteezy.com/system/resources/previews/007/299/670/non_2x/female-tattoo-artist-making-tattoo-on-arm-concept-free-vector.jpg'
    },
    {
        title: 'Host / Anchor',
        price: {
            max: 7000,
            min: 6000
        },
        image: 'https://png.pngtree.com/png-clipart/20220123/original/pngtree-host-of-annual-party-png-image_7155525.png'
    },
    {
        title: 'Photographer',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png'
    }
]

const propsOptions = [
    {
        title: 'Photo booth',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://www.shutterstock.com/image-vector/photo-booth-quick-photos-near-260nw-2322920289.jpg'
    },
    {
        title: 'Console Games',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://img.freepik.com/free-vector/people-with-gaming-icons-illustration_53876-43138.jpg'
    },
    {
        title: 'Board & Card Games',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://img.freepik.com/premium-vector/gradient-board-game-illustration_23-2151861986.jpg'
    },
    {
        title: 'Balloon Decoration',
        price: {
            max: 8500,
            min: 7000
        },
        image: 'https://img.freepik.com/premium-photo/birthday-background-with-balloons-illustration-ai-generative_115919-6041.jpg'
    }
]

export const celebrationSteps = [
    // { icon: "🎉", color: "purple-icon", text: "Pick the Event Type – Let's Party!" , options: eventTypeOptions },
    { icon: "🪅", color: "pink-icon", text: "Decor Your Way – Props, Fun & Games!", options: propsOptions },
    { icon: "🧑‍🍳", color: "pink-icon", text: "Add Live Stations – Fresh & Fun!", options: liveCounterOptions },
    { icon: "🎭", color: "pink-icon", text: "Spice It Up – Artists & Entertainment!", options: artistsOptions },
    // { icon: "🍴", color: "pink-icon", text: "Choose the Feast – Make It Yours!", options: [] },
    // { icon: "📍", color: "yellow-icon", text: "Find the Perfect Venue – We’ve Got Options!", options: product },
];