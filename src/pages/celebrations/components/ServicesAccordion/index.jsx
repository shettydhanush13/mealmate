// src/pages/celebration-pages/celebrations/components/ServicesAccordion.jsx
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { FaArrowDown } from "react-icons/fa";
import ProductCard from "../../../../components/celebrationProductCard";
import "./styles.scss";

const ServicesAccordion = ({ steps = [], selectedItems = [], onProductClicked, loading, error }) => {
  return (
    <div className="servicesAccordion">
      <h3 className="subSectionTitle">Add Services</h3>

      {loading && (
        <div className="servicesState">
          {[0, 1, 2].map((i) => (
            <div key={i} className="serviceSkeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="servicesState servicesState--error">
          Couldn’t load services. Please try again.
        </div>
      )}

      {!loading && !error && steps.length === 0 && (
        <div className="servicesState servicesState--empty">
          No add-on services for this event — you can continue to the menu.
        </div>
      )}

      {!loading && !error && steps.map((step) => (
        <Accordion key={step.text || step.icon} className="serviceAccordionItem">
          <AccordionSummary expandIcon={<FaArrowDown />}>
            <div className={`stepIcon ${step.color}`}>{step.icon}</div>
            <h5 className="stepTitle">{step.text}</h5>
          </AccordionSummary>
          <AccordionDetails>
            <div className="optionsWrap">
              {Array.isArray(step.options) && step.options.map((option) => (
                <ProductCard
                  key={option.title}
                  product={option}
                  selected={selectedItems.includes(option.title)}
                  productAdded={(item) => onProductClicked(item)}
                  displaySubOptions="modal"
                />
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default ServicesAccordion;
