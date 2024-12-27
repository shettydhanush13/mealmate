import React from "react";
import { Helmet } from "react-helmet";
import "./styles.scss";
import Wrapper from "../../components/wrapper";
import ServiceType from "../../components/serviceType";
import AboutUs from "../../components/aboutUs";
import Contact from "../../components/contact";
import HowItWorks from "../../components/howItWorks";
import { FaWhatsapp } from "react-icons/fa";
import { servicesData } from "../../data/servicesData";

const Landing = () => {

  const structuredData = {    
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CaterKart",
    "url": "https://www.caterkart.in",
    "logo": "https://caterkart.in/favicon.png",
    "description": "CaterKart offers customized catering services for events. Choose, customize, and enjoy authentic meals tailored to your taste and occasion.",
    "sameAs": [
      "https://www.facebook.com/caterkart_official",
      "https://www.instagram.com/caterkart_official",
    ]
  };

  return (
    <Wrapper headertext="CaterKart" footer={false}>
      <Helmet>
        <title>CaterKart - Premuim Catering at your fingertips</title>
        <meta
          name="description"
          content="CaterKart offers customized catering services for events. Choose, customize, and enjoy authentic meals tailored to your taste and occasion."
        />
        <meta
          name="keywords"
          content="catering, custom catering, personalized meals, event catering, mealboxes"
        />
        <meta name="author" content="CaterKart" />
        <link rel="canonical" href="https://caterkart.in" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
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
      <div className="chatBot" onClick={() =>
            window.open('https://wa.me/message/NNNDW6NLLPBZK1', '_blank')
          }>
        <FaWhatsapp/>
        <p>CHAT WITH US</p>
      </div>
    </Wrapper>
  );
};

export default Landing;
