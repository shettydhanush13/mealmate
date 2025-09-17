// src/data/items.js
import { v4 as uuidv4 } from 'uuid';

export const categories = {
  Breakfast: [
    'Idly/Vada',
    'Dosa',
    'Bath',
    'Rotti',
    'Fried Breakfast',
    'Beverages'
  ],
  Snacks: [
    'Dry Item',
    'Chinese',
    'Noodles',
    'Additional Items',
    'Extras'
  ],
  Mains: [
    'Breads',
    'Curries',
    'Rice',
    'Welcome Drink'
  ],
  Desserts: [
    'Sweet',
    'Extra Sweet'
  ],
  Sides: [
    'Pallya'
  ],
  Beverages: [
    'Hot Drinks',
    'Cold Drinks'
  ],
  Extras: [
    'Cutlery & Service',
    'Packaging'
  ]
};

export const menuItems = {
  // --------------------
  // Breakfast
  // --------------------
  'Idly/Vada': {
    'Idly': { name: 'Idly', desc: '1 pc', veg: true, id: uuidv4(), price: 20 },
    'Button Idly': { name: 'Button Idly', desc: '12 pcs', veg: true, id: uuidv4(), price: 55 },
    'Ghee Pudi Idly': { name: 'Ghee Pudi Idly', desc: '1 pc', veg: true, id: uuidv4(), price: 55 },
    'Rava Idly': { name: 'Rava Idly', desc: '100g', veg: true, id: uuidv4(), price: 50 },
    'Vada': { name: 'Vada', desc: '2 pcs', veg: true, id: uuidv4(), price: 40 }
  },

  'Dosa': {
    'Ghee Masala Dosa': { name: 'Ghee Masala Dosa', desc: '1 pc', veg: true, id: uuidv4(), price: 110 },
    'Set Dosa': { name: 'Set Dosa', desc: '2 pcs', veg: true, id: uuidv4(), price: 75 },
    'Mysore Masala Dosa': { name: 'Mysore Masala Dosa', desc: '1 pc', veg: true, id: uuidv4(), price: 120 },
    'Onion Dosa': { name: 'Onion Dosa', desc: '1 pc', veg: true, id: uuidv4(), price: 80 },
    'Mini Dosa': { name: 'Mini Dosa', desc: '1 pc', veg: true, id: uuidv4(), price: 45 }
  },

  'Bath': {
    'Kesari Bath': { name: 'Kesari Bath', desc: '100g', veg: true, id: uuidv4(), price: 45 },
    'Khara Bath': { name: 'Khara Bath', desc: '100g', veg: true, id: uuidv4(), price: 45 },
    'Chow Chow Bath': { name: 'Chow Chow Bath', desc: '100g', veg: true, id: uuidv4(), price: 70 },
    'Bisi Bele Bath': { name: 'Bisi Bele Bath', desc: '100g', veg: true, id: uuidv4(), price: 65 },
    'Pongal': { name: 'Pongal', desc: '100g', veg: true, id: uuidv4(), price: 60 }
  },

  'Rotti': {
    'Akki Rotti': { name: 'Akki Rotti', desc: '1 pc', veg: true, id: uuidv4(), price: 40 },
    'Ragi Rotti': { name: 'Ragi Rotti', desc: '1 pc', veg: true, id: uuidv4(), price: 40 }
  },

  'Fried Breakfast': {
    'Mangalore Buns': { name: 'Mangalore Buns', desc: '1 pc', veg: true, id: uuidv4(), price: 40 },
    'Bonda': { name: 'Bonda', desc: '1 pc', veg: true, id: uuidv4(), price: 18 },
    'Bajji': { name: 'Bajji', desc: '1 pc', veg: true, id: uuidv4(), price: 18 },
    'Poori': { name: 'Poori', desc: '2 pcs', veg: true, id: uuidv4(), price: 65 }
  },

  'Beverages': {
    'Coffee': { name: 'Coffee', desc: 'Hot, 150ml', veg: true, id: uuidv4(), price: 25 },
    'Tea': { name: 'Tea', desc: 'Hot, 150ml', veg: true, id: uuidv4(), price: 20 },
    'Badam Milk': { name: 'Badam Milk', desc: '150ml', veg: true, id: uuidv4(), price: 45 }
  },

  // --------------------
  // Snacks
  // --------------------
  'Dry Item': {
    'Gobi Manchurian': { name: 'Gobi Manchurian', desc: '250g', veg: true, id: uuidv4(), price: 140 },
    'Chicken 65': { name: 'Chicken 65', desc: '250g', veg: false, id: uuidv4(), price: 200 },
    'Paneer Manchurian': { name: 'Paneer Manchurian', desc: '250g', veg: true, id: uuidv4(), price: 180 },
    'Fish Finger': { name: 'Fish Finger', desc: '6 pcs', veg: false, id: uuidv4(), price: 240 }
  },

  'Chinese': {
    'Honey Chilli Potato': { name: 'Honey Chilli Potato', desc: '250g', veg: true, id: uuidv4(), price: 120 },
    'Chilli Chicken': { name: 'Chilli Chicken', desc: '250g', veg: false, id: uuidv4(), price: 220 },
    'Sweet Corn Spicy': { name: 'Sweet Corn Spicy', desc: '250g', veg: true, id: uuidv4(), price: 130 }
  },

  'Noodles': {
    'Paneer Hakka Noodles': { name: 'Paneer Hakka Noodles', desc: '200g', veg: true, id: uuidv4(), price: 140 },
    'Chicken Hakka Noodles': { name: 'Chicken Hakka Noodles', desc: '200g', veg: false, id: uuidv4(), price: 170 },
    'Veg Schezwan Noodles': { name: 'Veg Schezwan Noodles', desc: '200g', veg: true, id: uuidv4(), price: 150 }
  },

  'Additional Items': {
    'Kosumbari': { name: 'Kosumbari', desc: '100g', veg: true, fixed: true, id: uuidv4(), price: 30 },
    'Green Salad': { name: 'Green Salad', desc: '100g', veg: true, fixed: true, id: uuidv4(), price: 60 },
    'Rasam': { name: 'Rasam', desc: '100g', veg: true, fixed: true, id: uuidv4(), price: 60 },
    'Curd Rice': { name: 'Curd Rice', desc: '100g', veg: true, fixed: true, id: uuidv4(), price: 60 }
  },

  'Extras': {
    'Tissues': { name: 'Tissues', desc: 'Pack', veg: null, id: uuidv4(), price: 0 },
    'Cutlery': { name: 'Cutlery', desc: 'Disposable set', veg: null, id: uuidv4(), price: 8, extraPricing: 8 },
    'Water Bottle': { name: 'Water Bottle', desc: '500ml', veg: null, id: uuidv4(), price: 20 }
  },

  // --------------------
  // Mains
  // --------------------
  'Breads': {
    'Naan': { name: 'Naan', desc: '1 pc', veg: true, id: uuidv4(), price: 45 },
    'Butter Naan': { name: 'Butter Naan', desc: '1 pc', veg: true, id: uuidv4(), price: 55 },
    'Tandoor Roti': { name: 'Tandoor Roti', desc: '1 pc', veg: true, id: uuidv4(), price: 30 },
    'Rumali Roti': { name: 'Rumali Roti', desc: '1 pc', veg: true, id: uuidv4(), price: 40 }
  },

  'Curries': {
    'Paneer Butter Masala': { name: 'Paneer Butter Masala', desc: '250g', veg: true, id: uuidv4(), price: 260 },
    'Butter Chicken': { name: 'Butter Chicken', desc: '250g', veg: false, id: uuidv4(), price: 320 },
    'Kadai Paneer': { name: 'Kadai Paneer', desc: '250g', veg: true, id: uuidv4(), price: 270 },
    'Mutton Rogan Josh': { name: 'Mutton Rogan Josh', desc: '250g', veg: false, id: uuidv4(), price: 380 },
    'Dal Tadka': { name: 'Dal Tadka', desc: '250g', veg: true, id: uuidv4(), price: 190 },
    'Chicken Chettinad': { name: 'Chicken Chettinad', desc: '250g', veg: false, id: uuidv4(), price: 300 }
  },

  'Rice': {
    'Veg Biryani': { name: 'Veg Biryani', desc: '200g', veg: true, id: uuidv4(), price: 180 },
    'Chicken Biryani': { name: 'Chicken Biryani', desc: '200g', veg: false, id: uuidv4(), price: 250 },
    'Mutton Biryani': { name: 'Mutton Biryani', desc: '200g', veg: false, id: uuidv4(), price: 320 },
    'Lemon Rice': { name: 'Lemon Rice', desc: '150g', veg: true, id: uuidv4(), price: 120 }
  },

  'Welcome Drink': {
    'Mint Lime': { name: 'Mint Lime', desc: '200ml', veg: true, id: uuidv4(), price: 45 },
    'Butterscotch Shake': { name: 'Butterscotch Shake', desc: '250ml', veg: true, id: uuidv4(), price: 65, extraPricing: 15 },
    'Watermelon Cooler': { name: 'Watermelon Cooler', desc: '200ml', veg: true, id: uuidv4(), price: 55 }
  },

  // --------------------
  // Desserts
  // --------------------
  'Sweet': {
    'Gulab Jamun': { name: 'Gulab Jamun', desc: '1 pc', veg: true, id: uuidv4(), price: 22 },
    'Ras Malai': { name: 'Ras Malai', desc: '1 pc', veg: true, id: uuidv4(), price: 40 },
    'Jalebi': { name: 'Jalebi', desc: '1 pc', veg: true, id: uuidv4(), price: 25 },
    'Mysore Pak': { name: 'Mysore Pak', desc: '1 pc', veg: true, id: uuidv4(), price: 35 }
  },

  'Extra Sweet': {
    'Dry Jamoon Premium': { name: 'Dry Jamoon Premium', desc: '1 pc', veg: true, id: uuidv4(), price: 40, extraPricing: 20 },
    'Malai Sandwich Premium': { name: 'Malai Sandwich Premium', desc: '1 pc', veg: true, id: uuidv4(), price: 45, extraPricing: 20 }
  },

  // --------------------
  // Live Stations
  // --------------------
  'Live Pizza': {
    'Margherita': { name: 'Margherita', desc: 'per slice', veg: true, id: uuidv4(), price: 220 },
    'Pepperoni': { name: 'Pepperoni', desc: 'per slice', veg: false, id: uuidv4(), price: 260 },
    'Veggie Special': { name: 'Veggie Special', desc: 'per slice', veg: true, id: uuidv4(), price: 230 }
  },

  'Live Momo': {
    'Veg Momo': { name: 'Veg Momo', desc: 'per piece', veg: true, id: uuidv4(), price: 18 },
    'Chicken Momo': { name: 'Chicken Momo', desc: 'per piece', veg: false, id: uuidv4(), price: 28 }
  },

  'Live BBQ': {
    'Chicken Skewers': { name: 'Chicken Skewers', desc: 'per piece', veg: false, id: uuidv4(), price: 75 },
    'Veg Skewers': { name: 'Veg Skewers', desc: 'per piece', veg: true, id: uuidv4(), price: 55 },
    'Prawn Skewers': { name: 'Prawn Skewers', desc: 'per piece', veg: false, id: uuidv4(), price: 120 }
  },

  // --------------------
  // Sides
  // --------------------
  'Pallya': {
    'Beans-Carrot': { name: 'Beans-Carrot', desc: '100g', veg: true, id: uuidv4(), price: 40 },
    'Aloo-Matar': { name: 'Aloo-Matar', desc: '100g', veg: true, id: uuidv4(), price: 45 }
  },

  // --------------------
  // Beverages
  // --------------------
  'Hot Drinks': {
    'Masala Chai': { name: 'Masala Chai', desc: '150ml', veg: true, id: uuidv4(), price: 25 },
    'Filter Coffee': { name: 'Filter Coffee', desc: '150ml', veg: true, id: uuidv4(), price: 30 }
  },

  'Cold Drinks': {
    'Soft Drink Can': { name: 'Soft Drink Can', desc: '330ml', veg: true, id: uuidv4(), price: 50 },
    'Fresh Lime Soda': { name: 'Fresh Lime Soda', desc: '250ml', veg: true, id: uuidv4(), price: 60 },
    'Mineral Water': { name: 'Mineral Water', desc: '500ml', veg: null, id: uuidv4(), price: 20 }
  },

  // --------------------
  // Extras
  // --------------------
  'Cutlery & Service': {
    'Disposable Cutlery Set': { name: 'Disposable Cutlery Set', desc: 'Fork + Spoon + Plate', veg: null, id: uuidv4(), price: 12 },
    'Buffet Plate Disposable': { name: 'Buffet Plate Disposable', desc: 'Single plate', veg: null, id: uuidv4(), price: 12, extraPricing: 12 }
  },

  'Packaging': {
    'Mealbox Per Pax': { name: 'Mealbox Per Pax', desc: 'Disposable box', veg: null, id: uuidv4(), price: 14 }
  }
};
