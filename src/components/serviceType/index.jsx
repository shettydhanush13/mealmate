import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service, fullWidth }) => {
  const { title, banner, link, tag } = service;
  const navigate = useNavigate();

  return (
    <div className={fullWidth ? 'serviceTypeContainer fullWidth' : 'serviceTypeContainer'} onClick={() => navigate(link)}>
      <img src={banner} alt={`Service: ${title}`} />
      <h3>{title}</h3>
      <p className="tag">{tag}</p>
    </div>
  );
};

export default ServiceType;
