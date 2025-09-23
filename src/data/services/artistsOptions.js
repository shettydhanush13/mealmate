// src/data/artistsOptions.js
import { v4 as uuidv4 } from "uuid";

export const artistsOptions = [
  {
    title: "Magic Show",
    image:
      "https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg",
    price: 5000,
    baseFare: 5000,
    baseHours: 2,
    extraPerHour: 1500,
    // keep consistent subOptions array (single fallback)
    subOptions: [
      {
        id: uuidv4(),
        label: "Magic Show - Standard",
        imgs: [
          "https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg",
        ],
        price: 5000,
        baseFare: 5000,
        baseHours: 2,
        extraPerHour: 1500,
        inclusions: [
          "30–45 minute magic performance",
          "Interactive tricks with audience participation",
          "Basic sound system & microphone",
          "One on-site magician",
        ],
        description:
          "A family-friendly magic show that blends close-up sleight-of-hand with stage illusions. Perfect for birthdays and small corporate gatherings.",
        thingsToRemember: [
          "Performance needs ~2.5m × 2.5m clear space",
          "Access to one power outlet preferred",
          "Avoid strong wind/exposure if outdoors without cover",
        ],
        whatYouCanExpect: [
          "Audience participation and lots of surprises",
          "Photo ops with the magician after the show",
          "Clean, family-appropriate humour and tricks",
        ],
        customerImages: ["https://images.unsplash.com/photo-1502920514313-52581002a659?w=800&q=60"],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Riya M.",
            rating: 5,
            text: "The magician made the party — kids were enthralled and adults were laughing. Highly recommended.",
            date: "2024-06-10",
          },
        ],
      },
    ],
  },

  {
    title: "Joker",
    image: "https://img.freepik.com/free-vector/colourful-clown-cartoon-character_1308-109181.jpg",
    price: 4000,
    baseFare: 4000,
    baseHours: 2,
    extraPerHour: 1200,
    subOptions: [
      {
        id: uuidv4(),
        label: "Joker / Clown - Standard",
        imgs: ["https://img.freepik.com/free-vector/colourful-clown-cartoon-character_1308-109181.jpg"],
        price: 4000,
        baseFare: 4000,
        baseHours: 2,
        extraPerHour: 1200,
        inclusions: [
          "45–60 minute interactive clown performance",
          "Balloon sculpting for kids (up to 20 items)",
          "Face-painting (simple designs)",
          "Props and costume",
        ],
        description:
          "A high-energy clown/joker act with silly stunts, balloon animals, and light crowd games — great for younger children and family events.",
        thingsToRemember: [
          "Best for indoor or calm outdoor settings",
          "Face-painting is done with hypoallergenic paints",
          "Prepare a small area for balloon sculpting",
        ],
        whatYouCanExpect: ["Lots of laughter, quick games and balloon giveaways", "A calm and friendly performer who engages children safely"],
        customerImages: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=60"],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Karthik R.",
            rating: 4,
            text: "Kids loved the balloons and the gentle humour. Great entertainer.",
            date: "2024-02-18",
          },
        ],
      },
    ],
  },

  {
    title: "Cartoonist",
    image:
      "https://png.pngtree.com/png-vector/20230728/ourlarge/pngtree-fyi-clipart-cartoon-character-artist-boy-painting-realistic-abstract-artwork-on-vector-png-image_6810455.png",
    price: 3500,
    baseFare: 3500,
    baseHours: 2,
    extraPerHour: 1000,
    subOptions: [
      {
        id: uuidv4(),
        label: "Cartoonist - Standard",
        imgs: [
          "https://png.pngtree.com/png-vector/20230728/ourlarge/pngtree-fyi-clipart-cartoon-character-artist-boy-painting-realistic-abstract-artwork-on-vector-png-image_6810455.png",
        ],
        price: 3500,
        baseFare: 3500,
        baseHours: 2,
        extraPerHour: 1000,
        inclusions: [
          "Live caricature / cartoon sketches for guests (up to 20 sketches per hour)",
          "Paper and markers supplied",
          "Digital copies on request",
        ],
        description:
          "A quick-sketch cartoonist who captures guests’ likenesses with humour — a memorable keepsake for parties and corporate events.",
        thingsToRemember: ["Indoor seating for artist recommended", "Allow ~6–8 minutes per sketch for good results"],
        whatYouCanExpect: ["Fun, light-hearted caricatures that guests take home", "Artist-friendly approach for all age groups"],
        customerImages: ["https://images.unsplash.com/photo-1520975918579-8b4a6b0a8f31?w=800&q=60"],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Meera S.",
            rating: 5,
            text: "Amazing cartoons — guests loved taking them home. Very professional.",
            date: "2024-04-03",
          },
        ],
      },
    ],
  },

  {
    title: "Tattoo Artist",
    image:
      "https://static.vecteezy.com/system/resources/previews/007/299/670/non_2x/female-tattoo-artist-making-tattoo-on-arm-concept-free-vector.jpg",
    price: 3200,
    baseFare: 3200,
    baseHours: 2,
    extraPerHour: 1200,
    subOptions: [
      {
        id: uuidv4(),
        label: "Temporary Tattoo Station",
        imgs: [
          "https://static.vecteezy.com/system/resources/previews/007/299/670/non_2x/female-tattoo-artist-making-tattoo-on-arm-concept-free-vector.jpg",
        ],
        price: 3200,
        baseFare: 3200,
        baseHours: 2,
        extraPerHour: 1200,
        inclusions: [
          "Temporary tattoo station (safe, non-permanent inks)",
          "Artist + assistant, sterilised tools",
          "Up to 3 small tattoo designs per guest (per appointment)",
        ],
        description:
          "Temporary (henna-style or airbrush) tattoos done by a trained artist — great for themed parties and experiential booths.",
        thingsToRemember: [
          "Temporary tattoos are not permanent — suitable for all ages",
          "Keep skin clean & dry before application",
          "Allergic patch testing available on request",
        ],
        whatYouCanExpect: ["Beautiful, short-term body art suitable for photos", "Hygienic setup with disposable supplies"],
        customerImages: ["https://images.unsplash.com/photo-1520975918579-8b4a6b0a8f31?w=800&q=60"],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Anil P.",
            rating: 5,
            text: "Temporary tattoos were a huge hit — clean setup and lovely designs.",
            date: "2024-07-21",
          },
        ],
      },
    ],
  },

  {
    title: "Host",
    image:
      "https://png.pngtree.com/png-clipart/20220123/original/pngtree-host-of-annual-party-png-image_7155525.png",
    // Host already had multiple subOptions — keep them and ensure each follows the same shape
    subOptions: [
      {
        id: "host_eng",
        label: "English Professional Host",
        imgs: [
          "https://png.pngtree.com/png-clipart/20230425/original/pngtree-host-or-master-of-ceremonies-speaking-on-stage-png-image_9080852.png",
        ],
        price: 6000,
        baseFare: 6000,
        baseHours: 2,
        extraPerHour: 2000,
        inclusions: ["Professional host/emcee for your event (2 hours)", "Pre-event script coordination", "Basic sound mic"],
        description: "A polished English-language host who keeps your schedule on track and the audience engaged.",
        thingsToRemember: ["Host requires a brief pre-event run-through", "Please share event timeline 48 hours in advance"],
        whatYouCanExpect: ["Smooth transitions between segments", "Clear announcements and crowd engagement"],
        customerImages: [],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Sana V.",
            rating: 5,
            text: "Very professional host — made the evening flow perfectly.",
            date: "2024-03-09",
          },
        ],
      },
      {
        id: "host_bi",
        label: "Bilingual Host (Local + English)",
        imgs: [
          "https://png.pngtree.com/png-vector/20240326/ourlarge/pngtree-young-man-in-suit-speaking-on-microphone-png-image_12191973.png",
        ],
        price: 7500,
        baseFare: 7500,
        baseHours: 3,
        extraPerHour: 2500,
        inclusions: ["Bilingual emcee (local language + English)", "Pre-event planning and bilingual announcements"],
        description: "A bilingual host to engage diverse audiences and keep bilingual segments smooth and inclusive.",
        thingsToRemember: ["Share language preferences and pronunciation notes ahead of time"],
        whatYouCanExpect: ["Comfortable switching between languages", "Audience-friendly hosting for mixed groups"],
        customerImages: [],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Rohan T.",
            rating: 5,
            text: "Perfect for our mixed-language crowd — very adaptable and charismatic.",
            date: "2024-05-12",
          },
        ],
      },
      {
        id: "host_ent",
        label: "Emcee + Entertainment Games Host",
        imgs: [
          "https://png.pngtree.com/png-vector/20230811/ourlarge/pngtree-young-man-as-stand-up-comedian-on-stage-png-image_9080851.png",
        ],
        price: 9000,
        baseFare: 9000,
        baseHours: 3,
        extraPerHour: 3000,
        inclusions: ["Emcee + on-stage games & icebreakers", "Small prizes for winners (up to 3)"],
        description: "An emcee who doubles as an energetic games host — great when you want structured audience participation.",
        thingsToRemember: ["Provide any branded prize details in advance", "Allow open floor time for games (20–40 minutes)"],
        whatYouCanExpect: ["High energy audience interaction and structured game flow"],
        customerImages: [],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Neha G.",
            rating: 5,
            text: "Superb energy — got everyone laughing and participating.",
            date: "2024-01-28",
          },
        ],
      },
      {
        id: "host_prem",
        label: "Premium Celebrity Host",
        imgs: [
          "https://png.pngtree.com/png-clipart/20230426/original/pngtree-male-singer-in-suit-holding-microphone-png-image_9080854.png",
        ],
        price: 10000,
        baseFare: 10000,
        baseHours: 2,
        extraPerHour: 4000,
        inclusions: ["Premium celebrity/familiar-face emcee (subject to availability)", "Pre-event coordination and rehearsal"],
        description: "A premium hosting option — booking depends on celebrity availability and may need additional confirmation.",
        thingsToRemember: ["Requires early booking and confirmation window", "May need contractual terms depending on celebrity"],
        whatYouCanExpect: ["High recognition-factor and photo opportunities", "Polished on-stage presence"],
        customerImages: [],
        customerReviews: [],
      },
    ],
  },

  {
    title: "Photographer",
    image:
      "https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png",
    price: 8000,
    baseFare: 8000,
    baseHours: 3,
    extraPerHour: 2500,
    subOptions: [
      {
        id: uuidv4(),
        label: "Photographer - 2 Hour Standard",
        imgs: ["https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png"],
        price: 8000,
        baseFare: 8000,
        baseHours: 3,
        extraPerHour: 2500,
        inclusions: ["2-hour coverage (standard package)", "One professional photographer", "Basic color correction and online gallery"],
        description:
          "A friendly photographer offering candid and posed shots — ideal for birthdays, corporate events and intimate gatherings.",
        thingsToRemember: ["Share the event schedule and priority shot-list ahead of time", "Additional hours billed at extraPerHour"],
        whatYouCanExpect: ["High-resolution images delivered via online gallery", "A mix of candid and posed photos"],
        customerImages: ["https://images.unsplash.com/photo-1487956387886-9f3bcb7aa8b8?w=800&q=60"],
        customerReviews: [
          {
            id: uuidv4(),
            name: "Vikram S.",
            rating: 5,
            text: "Great eye for moments — the gallery came back very quickly and looked professional.",
            date: "2024-09-01",
          },
        ],
      },
    ],
  },
];
