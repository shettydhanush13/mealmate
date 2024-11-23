import React from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPhone } from '@fortawesome/free-solid-svg-icons'
import './styles.scss';

const Header = ({ text }) => {
  const navigate = useNavigate();

  return <header className="header">
    <FontAwesomeIcon color='#fafafa' style={{ cursor: 'pointer' }} icon={faHome} onClick={() => navigate('/')}/>
    <p>{text}</p>
    <FontAwesomeIcon color='#fafafa' icon={faPhone} onClick={() => <a href="tel:7204242111"> 7204242111 </a>}/>
  </header>
};

export default Header;
