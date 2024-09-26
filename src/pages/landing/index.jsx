import React from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import existingMenuBanner from '../../assets/existingMenuBanner.png';
import banner from '../../assets/banner.png';
import mealboxBanner from '../../assets/mealboxBanner.png';

const Landing = () => {
  const services = [
    {
        type: 'Customize Our Existing Menu',
        tag: '',
        image: 'https://media.istockphoto.com/id/1253203631/photo/south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=RTE240M3aX8cCjlYfsx-Z_ohtj4Cb_xGLNVk0GKuzO0=',
        link: 'menu',
        descriptionRight: '',
        descriptionLeft: 'Customize our existing menu according to your needs',
        tagline: 'Easy',
        banner: existingMenuBanner
    },
    {
        type: 'Build Your Own Menu',
        tag: '',
        image: 'https://imgv3.fotor.com/images/side/menu-sideimage.jpg',
        link: 'create-menu',
        descriptionRight: '',
        descriptionLeft: 'Create your own menu from scratch',
        tagline: 'COMING SOON',
        banner: banner
    },
    {
        type: 'Meal Boxes',
        tag: '',
        image: 'https://5.imimg.com/data5/ANDROID/Default/2020/8/VU/YQ/VV/40967555/img-20200811-wa0005-jpg.jpg',
        link: 'mealbox',
        descriptionRight: '',
        descriptionLeft: 'Choose No of dishes ( 3, 5 or 8 ). Choose Dishes. Boom!',
        tagline: 'Coming Soon',
        banner: mealboxBanner
    },
  ]
  return (
    <Wrapper headertext='Cater Kart' footer={true}>
      <div className="menu serviceTypeSection">
        <h2>OUR SERVICES</h2>
        {services.map((service) => <>
            <ServiceType service={service}/>
        </>)}
      </div>
    </Wrapper>
  );
};

export default Landing;
