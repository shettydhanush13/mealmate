import React from "react";
import { FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./styles.scss";

const Contact = () => {
  return (
    <div className="contact-us">
      <div className="contact-content">
        {/* Instagram link */}
        <div onClick={() => window.open('https://www.instagram.com/caterkart_official?igsh=MWZmOXVlYzVuY2Q1bg==', '_blank')} className="contact-item">
          <FaInstagram />
          <span>caterkart_official</span>
        </div>

        {/* Phone number link */}
        <div className="contact-item">
          <FaPhoneAlt />
          <span>+91 720 4242 111</span>
        </div>

        {/* Email link */}
        <div className="contact-item">
          <FaEnvelope />
          <span>contact.caterkart@gmail.com</span>
        </div>
      </div>
    </div>
  );
};

export default Contact;
