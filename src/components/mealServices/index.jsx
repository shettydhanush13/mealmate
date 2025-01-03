import React from "react";
import ServiceType from "../serviceType";
import { servicesData } from "../../data/servicesData";
import './styles.scss';

const MealServices = ({ title }) => {
  return <section className="landingSection">
    <h3 className="sectionTitle">{title}</h3>
    <section className="menu serviceTypeSection">
        {servicesData.map((service) => (
            <ServiceType key={service.id} service={service} />
        ))}
    </section>
  </section>
};

export default MealServices;

