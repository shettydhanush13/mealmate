// src/data/regionsData.js
// Export the same shape you used earlier — city + regions object.
// Replace the sample content below with your real data (artists/props/liveCounters).

const regionsData = {
    city: "Bangalore",
    regions: {
      north: {
        artists: [
          {
            "title": "Magic Show",
            "image": "https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg",
            "price": 5000,
            "baseFare": 5000,
            "baseHours": 2,
            "extraPerHour": 1500,
            "subOptions": [
              {
                "id": "UUID-1",
                "label": "Magic Show - Standard",
                "imgs": [
                  "https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg"
                ],
                "price": 5000,
                "baseFare": 5000,
                "baseHours": 2,
                "extraPerHour": 1500,
                "inclusions": [
                  "30–45 minute magic performance",
                  "Interactive tricks with audience participation",
                  "Basic sound system & microphone",
                  "One on-site magician"
                ],
                "description": "A family-friendly magic show that blends close-up sleight-of-hand with stage illusions. Perfect for birthdays and small corporate gatherings.",
                "thingsToRemember": [
                  "Performance needs ~2.5m × 2.5m clear space",
                  "Access to one power outlet preferred",
                  "Avoid strong wind/exposure if outdoors without cover"
                ],
                "whatYouCanExpect": [
                  "Audience participation and lots of surprises",
                  "Photo ops with the magician after the show",
                  "Clean, family-appropriate humour and tricks"
                ],
                "customerImages": ["https://images.unsplash.com/photo-1502920514313-52581002a659?w=800&q=60"],
                "customerReviews": [
                  {
                    "id": "UUID-review-1",
                    "name": "Riya M.",
                    "rating": 5,
                    "text": "The magician made the party — kids were enthralled and adults were laughing. Highly recommended.",
                    "date": "2024-06-10"
                  }
                ]
              }
            ]
          },
          {
            "title": "Photographer",
            "image": "https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png",
            "price": 8000,
            "baseFare": 8000,
            "baseHours": 3,
            "extraPerHour": 2500,
            "subOptions": [
              {
                "id": "UUID-photo-1",
                "label": "Photographer - 2 Hour Standard",
                "imgs": [
                  "https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png"
                ],
                "price": 8000,
                "baseFare": 8000,
                "baseHours": 3,
                "extraPerHour": 2500,
                "inclusions": [
                  "2-hour coverage (standard package)",
                  "One professional photographer",
                  "Basic color correction and online gallery"
                ],
                "description": "A friendly photographer offering candid and posed shots — ideal for birthdays, corporate events and intimate gatherings.",
                "thingsToRemember": [
                  "Share the event schedule and priority shot-list ahead of time",
                  "Additional hours billed at extraPerHour"
                ],
                "whatYouCanExpect": ["High-resolution images delivered via online gallery", "A mix of candid and posed photos"],
                "customerImages": ["https://images.unsplash.com/photo-1487956387886-9f3bcb7aa8b8?w=800&q=60"],
                "customerReviews": [
                  {
                    "id": "UUID-photo-review-1",
                    "name": "Vikram S.",
                    "rating": 5,
                    "text": "Great eye for moments — the gallery came back very quickly and looked professional.",
                    "date": "2024-09-01"
                  }
                ]
              }
            ]
          }
        ],
        props: [
          /* optional: props for north */
        ],
        liveCounters: [
          /* optional: live counters for north */
        ]
      },
      south: {
        artists: [ /* ... */ ],
        props: [ /* ... */ ],
        liveCounters: [ /* ... */ ]
      },
      east: { artists: [], props: [], liveCounters: [] },
      west: { artists: [], props: [], liveCounters: [] },
      central: { artists: [], props: [], liveCounters: [] }
    }
  };
  
  export default regionsData;
  