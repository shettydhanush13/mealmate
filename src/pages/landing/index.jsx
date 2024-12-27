import React from "react";
import "./styles.scss";
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import AboutUs from "../../components/aboutUs";
import Contact from "../../components/contact";
import HowItWorks from "../../components/howItWorks";
import { v4 as uuidv4 } from "uuid";
import whatsapp from '../../assets/whatsapp.svg'

const Landing = () => {

  const servicesData = [
    {
      id: uuidv4(),
      title: "CHOOSE AND CUSTOMIZE YOUR CATERING MENU",
      tag: "",
      link: "menu",
      description:
        "Choose from our curated menu and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!",
      tagline: "Easy",
      banner:
        "https://static.vecteezy.com/system/resources/previews/046/342/870/non_2x/vegetable-thai-food-isolated-on-transparent-background-free-png.png",
    },
    {
      id: uuidv4(),
      title: "BULK ORDERING FOR BREAKFAST / SNACKS",
      tag: "",
      link: "bulk",
      description:
        "Enjoy authentic, delicious South Indian dishes, perfectly curated and customizable to meet your needs. Simplify your event planning and treat your guests to a taste of tradition!",
      tagline: "Coming Soon",
      banner:
        "https://static.vecteezy.com/system/resources/previews/048/051/110/non_2x/indian-food-on-transparent-background-png.png",
    },
    {
      id: uuidv4(),
      title: "PERSONALIZED MEALBOX",
      tag: "(coming soon)",
      link: "",
      description:
        "Design customizable mealboxes for any event or party. Select the type and number of items, with dynamic pricing that fits your needs and budget!",
      tagline: "Coming Soon",
      banner:
        "https://mldj1lkrrejs.i.optimole.com/w:435/h:272/q:mauto/process:2956/id:39cde310864fa92e7f1a531241a6c8f5/https://thefoodwork.com/Card__6_-removebg-preview.png",
    },
    {
      id: uuidv4(),
      title: "CREATE YOUR OWN MEAL",
      tag: "(coming soon)",
      link: "",
      description:
        "Craft your dream menu from scratch with our wide range of dishes. Tailor it to your event, and enjoy dynamic pricing that adjusts as you build the perfect feast!",
      tagline: "COMING SOON",
      banner:
        "https://png.pngtree.com/png-vector/20241020/ourmid/pngtree-d-vegetarian-food-thali-with-chapati-and-dal-on-transparent-background-png-image_14123135.png",
    },
  ];
  return (
    <Wrapper headertext="CaterKart" footer={false}>
      <section className="landingSection">
        <h3 className="sectionTitle">Our Services</h3>
        <section className="menu serviceTypeSection">
          {servicesData.map((service) => (
            <ServiceType key={service.id} service={service} />
          ))}
        </section>
      </section>
      <HowItWorks />
      <AboutUs />
      <Contact />
      <div className="chatBot">
        <img onClick={() => window.open('https://wa.me/message/NNNDW6NLLPBZK1', '_blank')} src={whatsapp} alt="" />
        <p>CHAT WITH US</p>
      </div>
    </Wrapper>
  );
};

export default Landing;
