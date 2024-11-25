import React from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
// import existingMenuBanner from '../../assets/existingMenuBanner.png';
// import createMenuBanner from '../../assets/createMenuBanner.png';
// import mealboxBanner from '../../assets/mealboxBanner.png';
import bulkorderBanner from '../../assets/bulkorderBanner.png';
import { v4 as uuidv4 } from 'uuid';

const Landing = () => {
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
      title: 'Feast Without the Fuss',
      tag: '',
      link: 'bulk',
      description: 'Simplify your party planning with bulk food orders tailored for any gathering, from cozy house parties to grand celebrations. Deliciously easy, perfectly portioned!',
      tagline: 'Coming Soon',
      banner: bulkorderBanner
    },
    // {
    //   id: uuidv4(),
    //   title: 'Your Menu, Your Wa',
    //   tag: '',
    //   link: 'menu',
    //   description: `Choose from our curated menus and customize them to fit your gathering. Perfect for creating a spread that suits every taste and occasion!`,
    //   tagline: 'Easy',
    //   banner: existingMenuBanner
    // },
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
      <section className="menu serviceTypeSection">
        {services.map((service) => <ServiceType key={service.id} service={service}/>)}
      </section>
    </Wrapper>
  );
};

export default Landing;
