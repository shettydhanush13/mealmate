import React from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faHome, faPhone } from '@fortawesome/free-solid-svg-icons'
import './styles.scss';

const Header = ({ text }) => {
  const navigate = useNavigate();

  return <header className="header">
    {text !== 'CaterKart' ? <FontAwesomeIcon color='#fafafa' style={{ cursor: 'pointer' }} icon={faArrowLeft} onClick={() => navigate(-1)}/>
      : <FontAwesomeIcon color='#fafafa' style={{ cursor: 'pointer' }} icon={faHome} onClick={() => {}}/>
    }
    <p>{text}</p>
    <a href="tel:7204242111"><FontAwesomeIcon color='#fafafa' icon={faPhone}/></a>
  </header>
};

export default Header;
