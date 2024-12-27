import React from "react";
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaHome, FaArrowLeft } from 'react-icons/fa';
import './styles.scss';

const Header = ({ text }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    // Define home navigation behavior if needed
  };

  const handleWhatsappClick = () => {
    window.open('https://wa.me/message/NNNDW6NLLPBZK1', '_blank');
  };

  return (
    <header className="header">
      {text !== 'CaterKart' ? (
        <FaArrowLeft onClick={handleBackClick} />
      ) : (
        <FaHome onClick={handleHomeClick} />
      )}
      <p>{text}</p>
      <FaWhatsapp onClick={handleWhatsappClick} />
    </header>
  );
};

export default Header;
