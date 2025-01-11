import { v4 as uuidv4 } from "uuid";
import catering_menu from '../assets/catering_menu.webp';
import create_menu from '../assets/create_menu.webp';
import bulk from '../assets/bulk.webp';
import mealbox from '../assets/mealbox.webp';

export const servicesData = [
    {
      id: uuidv4(),
      title: "CHOOSE AND CUSTOMIZE YOUR CATERING MENU",
      tag: "",
      link: "/menu",
      description:
        "Choose from our curated menu and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!",
      tagline: "Easy",
      banner: catering_menu
    },
    {
      id: uuidv4(),
      title: "BULK ORDERING FOR BREAKFAST / SNACKS",
      tag: "",
      link: "/bulk",
      description:
        "Enjoy authentic, delicious South Indian dishes, perfectly curated and customizable to meet your needs. Simplify your event planning and treat your guests to a taste of tradition!",
      tagline: "Coming Soon",
      banner: bulk
    },
    {
      id: uuidv4(),
      title: "CREATE YOUR OWN MEAL",
      tag: "(coming soon)",
      link: "",
      description:
        "Craft your dream menu from scratch with our wide range of dishes. Tailor it to your event, and enjoy dynamic pricing that adjusts as you build the perfect feast!",
      tagline: "COMING SOON",
      banner: create_menu
    },
    {
      id: uuidv4(),
      title: "PERSONALIZED MEALBOX",
      tag: "(coming soon)",
      link: "",
      description:
        "Design customizable mealboxes for any event or party. Select the type and number of items, with dynamic pricing that fits your needs and budget!",
      tagline: "Coming Soon",
      banner: mealbox
    },
  ];