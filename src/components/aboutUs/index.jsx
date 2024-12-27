import React from "react";
import "./styles.scss";

const AboutUs = () => {
  return (
    <section className="about-us landingSection whiteBG">
      <div className="about-container">
        <div className="about-text">
          <h3 className="sectionTitle">About Us</h3>
          <p>
            At <span className="highlight">CaterKart</span>, we are passionate about delivering exceptional catering solutions tailored to your needs. 
            Whether it's a small party or a corporate event, our meal boxes and catering services are designed to provide a hassle-free, delightful 
            experience. With a focus on quality, convenience, and customer satisfaction, we aim to make every occasion memorable.
          </p>

          <p>
            Our journey started with a simple idea – to make catering accessible, efficient, and delightful for everyone. Today, 
            we are here ensuring every meal is prepared with care and delivered with love.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
