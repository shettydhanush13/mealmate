import React, { useEffect, useState } from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import bulkorderBanner from '../../assets/bulkorderBanner.webp';
import existingMenuBanner from '../../assets/existingMenuBanner.webp';

import { v4 as uuidv4 } from 'uuid';
import AppLoader from "../../components/app-Loader";

const Landing = () => {

  const [isLoading, setIsLoading]  = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 4000);
  }, []);
  const services = [
    // {
    //   id: uuidv4(),
    //   title: 'Mealboxes, Made Your Way',
    //   tag: '',
    //   link: 'mealbox',
    //   description: 'Design customizable mealboxes for any event or party. Select the type and number of items, with dynamic pricing that fits your needs and budget!',
    //   tagline: 'Coming Soon',
    //   banner: mealboxBanner
    // },
    {
      id: uuidv4(),
      title: 'Our Menu, Your Way',
      tag: '',
      link: 'menu',
      description: `Choose from our curated menus and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!`,
      tagline: 'Easy',
      banner: existingMenuBanner
    },
    {
      id: uuidv4(),
      title: 'Breakfast Bites for Every Bash',
      tag: '',
      link: 'bulk',
      description: 'Enjoy authentic, delicious South Indian dishes, perfectly curated and customizable to meet your needs. Simplify your event planning and treat your guests to a taste of tradition!',
      tagline: 'Coming Soon',
      banner: bulkorderBanner
    },
    // {
    //   id: uuidv4(),
    //   title: 'Create, Customize, Celebrate',
    //   tag: '',
    //   link: 'create-menu',
    //   description: 'Craft your dream menu from scratch with our wide range of dishes. Tailor it to your event, and enjoy dynamic pricing that adjusts as you build the perfect feast!',
    //   tagline: 'COMING SOON',
    //   banner: createMenuBanner
    // },
  ]
  return (
    <Wrapper headertext='OUR SERVICES' footer={true}>
      {isLoading && <AppLoader/>}
      <section className="menu serviceTypeSection">
        {services.map((service) => <ServiceType key={service.id} service={service}/>)}
      </section>
    </Wrapper>
  );
};

export default Landing;
