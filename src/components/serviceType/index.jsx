import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service }) => {
    
  const { type, banner, link, descriptionLeft } = service;
  const navigate = useNavigate();

  return <div className="serviceTypeContainer" onClick={() => navigate(link)}>
    <img src={banner} alt="" />
    <h4>{type}</h4>
    <div className="priceSection">
      <p>{descriptionLeft}</p>
    </div>
  </div>
};

export default ServiceType;
