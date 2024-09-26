import React from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPhone } from '@fortawesome/free-solid-svg-icons'
import logo from '../../assets/logo_white.png';
import './styles.scss';

const Header = ({ text }) => {
  const navigate = useNavigate();

  return <header className="header">
    <FontAwesomeIcon color='#fafafa' style={{ cursor: 'pointer' }} icon={faHome} onClick={() => navigate('/')}/>
    {/* <img src={logo} alt="" /> */}
    <p>{text}</p>
    <FontAwesomeIcon color='#fafafa' icon={faPhone} onClick={() => alert('Call 8971780778 for any query.')}/>
  </header>
};

export default Header;
