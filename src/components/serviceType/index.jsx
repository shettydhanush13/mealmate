import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service }) => {
    
  const { banner, link, descriptionRight, descriptionLeft } = service;
  const navigate = useNavigate();

  return <div className="serviceTypeContainer" onClick={() => navigate(link)}>
    <img src={banner} alt="" />
    <div className="priceSection">
      <p>{descriptionLeft}</p>
      <p><span>{descriptionRight}</span></p>
    </div>
  </div>
};

export default ServiceType;
