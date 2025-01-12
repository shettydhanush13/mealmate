import React from "react";
import './styles.scss';
import { useNavigate } from 'react-router-dom';

const ServiceType = ({ service, fullWidth }) => {
  const { title, banner, link, tag } = service;
  const navigate = useNavigate();

  return (
    <div className={fullWidth ? 'serviceTypeContainer fullWidth' : 'serviceTypeContainer'} onClick={() => navigate(link)}>
      <img src={banner} alt={`Service: ${title}`} />
      {!fullWidth && <h3>{title}</h3>}
      {fullWidth && <br />}
      <p className="tag">{tag}</p>
      {fullWidth && <h3>ONE STOP SHOP FOR ALL YOUR CELEBRATION NEEDS</h3>}
    </div>
  );
};

export default ServiceType;
