import React from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import existingMenuBanner from '../../assets/existingMenuBanner.png';
import createMenuBanner from '../../assets/createMenuBanner.png';
// import mealboxBanner from '../../assets/mealboxBanner.png';
import { v4 as uuidv4 } from 'uuid';

const Landing = () => {
  const services = [
    // {
    //   id: uuidv4(),
    //   type: 'Meal Boxes',
    //   tag: '',
    //   image: 'https://5.imimg.com/data5/ANDROID/Default/2020/8/VU/YQ/VV/40967555/img-20200811-wa0005-jpg.jpg',
    //   link: 'mealbox',
    //   description: 'Design your perfect mealbox for parties or corporate events! Choose from 3, 5, or 8 container mealboxes and customize your selections to suit your needs.',
    //   tagline: 'Coming Soon',
    //   banner: mealboxBanner
    // },
    {
      id: uuidv4(),
      type: 'Customize Our Existing Menu',
      tag: '',
      image: 'https://media.istockphoto.com/id/1253203631/photo/south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=RTE240M3aX8cCjlYfsx-Z_ohtj4Cb_xGLNVk0GKuzO0=',
      link: 'menu',
      description: `Customize your bulk party orders! Select from our menu and tailor dishes to fit your needs, ensuring every guest enjoys a personalized dining experience.`,
      tagline: 'Easy',
      banner: existingMenuBanner
    },
    {
      id: uuidv4(),
      type: 'Build Your Own Menu',
      tag: '',
      image: 'https://imgv3.fotor.com/images/side/menu-sideimage.jpg',
      link: 'create-menu',
      description: 'Create your perfect event menu! Choose from a wide variety of dishes and customize your selections to suit your party or event needs.',
      tagline: 'COMING SOON',
      banner: createMenuBanner
    },
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
