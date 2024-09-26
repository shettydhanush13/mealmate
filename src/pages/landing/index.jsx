import React from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";

const Landing = () => {
  const services = [
    {
        type: 'Customize Our Existing Menu',
        tag: '',
        image: 'https://media.istockphoto.com/id/1253203631/photo/south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=RTE240M3aX8cCjlYfsx-Z_ohtj4Cb_xGLNVk0GKuzO0=',
        link: 'menu',
        descriptionRight: '',
        descriptionLeft: 'Customize our existing menu according to your needs',
        tagline: 'Easy'
    },
    {
        type: 'Meal Boxes',
        tag: '',
        image: 'https://5.imimg.com/data5/ANDROID/Default/2020/8/VU/YQ/VV/40967555/img-20200811-wa0005-jpg.jpg',
        link: 'mealbox',
        descriptionRight: '',
        descriptionLeft: 'Choose No of dishes ( 3, 5 or 8 ). Choose Dishes. Boom!',
        tagline: ''
    },
    {
        type: 'Build Your Own Menu',
        tag: '',
        image: 'https://imgv3.fotor.com/images/side/menu-sideimage.jpg',
        link: 'create-menu',
        descriptionRight: '',
        descriptionLeft: 'Create your own menu from scratch',
        tagline: 'COMING SOON'
    }
  ]
  return (
    <Wrapper headertext='Choose Your Menu Type' footer={true}>
      <div className="menu">
        {services.map((service) => <>
            <ServiceType service={service}/>
        </>)}
      </div>
    </Wrapper>
  );
};

export default Landing;
