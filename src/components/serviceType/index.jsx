import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service }) => {
    
  const { title, banner, link, tag } = service;
  const navigate = useNavigate();

  return <div className="serviceTypeContainer" onClick={() => navigate(link)}>
    <img src={banner} alt="" />
    <p>{title} <span className="tag">{tag}</span></p>
  </div>
};

export default ServiceType;
