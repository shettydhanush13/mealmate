import React from "react";
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaHome, FaShoppingBasket, FaArrowLeft } from 'react-icons/fa';
import './styles.scss';

const Header = ({ text, headerLeftType, headerRightType }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    navigate('/')
  };

  const handleWhatsappClick = () => {
    window.open('https://wa.me/message/NNNDW6NLLPBZK1', '_blank');
  };

  const getLeftIcon = () => {
    return headerLeftType !== 'home'
      ? (
        <button type="button" className="hdrBtn" aria-label="Go back" onClick={handleBackClick}>
          <FaArrowLeft />
        </button>
      )
      : (
        <button type="button" className="hdrBtn" aria-label="Home" onClick={handleHomeClick}>
          <FaHome />
        </button>
      );
  };

  const getRightIcon = () => {
    return headerRightType !== 'whatsapp'
      ? (
        <button type="button" className="hdrBtn" aria-label="My orders" onClick={() => navigate('/my-orders')}>
          <FaShoppingBasket />
        </button>
      )
      : (
        <button type="button" className="hdrBtn hdrBtn--wa" aria-label="Chat on WhatsApp" onClick={handleWhatsappClick}>
          <FaWhatsapp />
        </button>
      );
  };

  return (
    <header className="header">
      <div className="headerInner">
        {getLeftIcon()}
        <p className="hdrBrand">{text}</p>
        {getRightIcon()}
      </div>
    </header>
  );
};

export default Header;
