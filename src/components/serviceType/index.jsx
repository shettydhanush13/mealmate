import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service }) => {
    
  const { banner, link, description } = service;
  const navigate = useNavigate();

  return <div className="serviceTypeContainer" onClick={() => navigate(link)}>
    <img src={banner} alt="" />
    <div className="description">
      <p>{description}</p>
    </div>
  </div>
};

export default ServiceType;
