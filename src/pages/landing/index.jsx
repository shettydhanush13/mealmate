import React, { useEffect, useState } from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import AboutUs from "../../components/aboutUs";
import { v4 as uuidv4 } from 'uuid';
import AppLoader from "../../components/app-Loader";

const Landing = () => {

  const [isLoading, setIsLoading]  = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 4000);
  }, []);
  const services = [
    {
      id: uuidv4(),
      title: 'PICK AND PERSONALIZE YOUR MEAL',
      tag: '',
      link: 'menu',
      description: `Choose from our curated menu and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!`,
      tagline: 'Easy',
      banner: 'https://static.vecteezy.com/system/resources/previews/046/342/870/non_2x/vegetable-thai-food-isolated-on-transparent-background-free-png.png'
    },
    {
      id: uuidv4(),
      title: 'BULK BREAKFAST / SNACKS ORDERING',
      tag: '',
      link: 'bulk',
      description: 'Enjoy authentic, delicious South Indian dishes, perfectly curated and customizable to meet your needs. Simplify your event planning and treat your guests to a taste of tradition!',
      tagline: 'Coming Soon',
      banner: 'https://static.vecteezy.com/system/resources/previews/048/051/110/non_2x/indian-food-on-transparent-background-png.png'
    },
    {
      id: uuidv4(),
      title: 'PERSONALIZED MEALBOXES (Coming Soon)',
      tag: '',
      link: '',
      description: 'Design customizable mealboxes for any event or party. Select the type and number of items, with dynamic pricing that fits your needs and budget!',
      tagline: 'Coming Soon',
      banner: 'https://mldj1lkrrejs.i.optimole.com/w:435/h:272/q:mauto/process:2956/id:39cde310864fa92e7f1a531241a6c8f5/https://thefoodwork.com/Card__6_-removebg-preview.png'
    },
    // {
    //   id: uuidv4(),
    //   title: 'CATERKART CELEBRATIONS (Coming Soon)',
    //   tag: '',
    //   link: 'bulk',
    //   description: 'Enjoy authentic, delicious South Indian dishes, perfectly curated and customizable to meet your needs. Simplify your event planning and treat your guests to a taste of tradition!',
    //   tagline: 'Coming Soon',
    //   banner: 'https://static.vecteezy.com/system/resources/thumbnails/048/027/888/small_2x/large-family-has-dinner-together-after-completing-religious-fast-sitting-around-table-with-food-happy-seniors-with-children-and-granddaughter-having-thanksgiving-dinner-eating-turkey-meat-png.png'
    // },
    {
      id: uuidv4(),
      title: 'CREATE YOUR OWN MEAL (Coming Soon)',
      tag: '',
      link: '',
      description: 'Craft your dream menu from scratch with our wide range of dishes. Tailor it to your event, and enjoy dynamic pricing that adjusts as you build the perfect feast!',
      tagline: 'COMING SOON',
      banner: 'https://png.pngtree.com/png-vector/20241020/ourmid/pngtree-d-vegetarian-food-thali-with-chapati-and-dal-on-transparent-background-png-image_14123135.png'
    },
  ]
  return (
    <Wrapper headertext='CaterKart' footer={true}>
      {isLoading && <AppLoader/>}
      <p className="sectionTitle">Our Services</p>
      <section className="menu serviceTypeSection">
        {services.map((service) => <ServiceType key={service.id} service={service}/>)}
      </section>
      <AboutUs/>
    </Wrapper>
  );
};

export default Landing;
