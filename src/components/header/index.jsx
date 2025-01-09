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
    let componant;
    headerLeftType !== 'home' ? 
      componant = <FaArrowLeft onClick={handleBackClick} />
      : 
      componant = <FaHome onClick={handleHomeClick} />
    return componant;
  }

  const getRightIcon = () => {
    let componant;
    headerRightType !== 'whatsapp' ? 
      componant = <FaShoppingBasket onClick={() => navigate('/my-orders')}  />
      :
      componant = <FaWhatsapp onClick={handleWhatsappClick} />
    return componant;
  }

  return (
    <header className="header">
      {getLeftIcon()}
      <p>{text}</p>
      {getRightIcon()}
    </header>
  );
};

export default Header;
