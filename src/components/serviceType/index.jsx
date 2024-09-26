import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service }) => {
    
  const { type, image, link, descriptionRight, descriptionLeft, tagline } = service;
  const navigate = useNavigate();

  return <div className="serviceTypeContainer" onClick={() => navigate(link)}>
    <img src={image} alt="" />
    <h4>{type}</h4>
    <div className="priceSection">
      <p>{descriptionLeft}</p>
      <p><span>{descriptionRight}</span></p>
    </div>
  </div>
};

export default ServiceType;
