import React from "react";
import { FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./styles.scss";

const Contact = () => {
    return (
        <div className="contact-us">
          <div className="contact-content">
              <div onClick={() => window.open('https://www.instagram.com/caterkart_official?igsh=MWZmOXVlYzVuY2Q1bg==', '_blank')}>
                <FaInstagram /> <span>caterkart_official</span>
              </div>
              <div>
                <FaPhoneAlt /> <span>+91 720 4242 111</span>
              </div>
              <div>
                <FaEnvelope /> <span>contact.caterkart@gmail.com</span>
              </div>
          </div>
        </div>
    );
};

export default Contact;
