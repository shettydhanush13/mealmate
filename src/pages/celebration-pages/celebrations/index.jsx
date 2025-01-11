import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../../components/wrapper";
import ProductCard from "../../../components/celebrationProductCard";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { celebrationSteps, eventTypeOptions } from "../../../data/celebrationsData";
import { FaArrowDown } from "react-icons/fa";
import "./styles.scss";

const Celebrations = () => {
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemsObj, setSelectedItemsObj] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);

    const productAdded = (product) => {
        const _selectedItems = [...selectedItems];
        const _selectedItemsObj = [...selectedItemsObj];
        const index = _selectedItems.indexOf(product.title);
        if (index > -1) {
            _selectedItems.splice(index, 1);
            _selectedItemsObj.splice(index, 1);
        } else {
            _selectedItems.push(product.title);
            _selectedItemsObj.push(product);
        }
        setSelectedItems(_selectedItems);
        setSelectedItemsObj(_selectedItemsObj);
    };

    const addMeals = () => {
        if (selectedItemsObj.length) {
            navigate("meal", { state: { products: selectedItemsObj } });
        }
    };

    return (
        <>
            <Helmet>
                <title>Create a Celebration | CaterKart</title>
                <meta
                    name="description"
                    content="Plan your perfect event with CaterKart! Choose your event type, add services, and customize your celebration effortlessly."
                />
                <meta
                    name="keywords"
                    content="CaterKart, Celebration Planning, Event Services, Customized Celebrations, Party Planning"
                />
                <meta name="author" content="CaterKart Team" />
                <meta property="og:title" content="Create a Celebration | CaterKart" />
                <meta
                    property="og:description"
                    content="Plan your special event with CaterKart. Select your event type, add services, and make your celebration unforgettable."
                />
                <meta property="og:image" content="/path/to/celebrations-banner.jpg" />
                <meta property="og:url" content="https://caterkart.in/celebrations" />
                <meta property="og:type" content="website" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https:/caterkart.in/celebrations" />
            </Helmet>
            <Wrapper headertext="Create a Celebration!" footer={true}>
                <section className="celebrations-section">
                    <h3 className="subSectionTitle">Pick Your Event Type</h3>
                    <section className="optionsContainer">
                        {eventTypeOptions.map((event) => (
                            <p
                                key={event}
                                className={selectedEvent === event ? "eventType active-event-type" : "eventType"}
                                onClick={() => setSelectedEvent(event)}
                            >
                                {event}
                            </p>
                        ))}
                    </section>
                    <h3 className="subSectionTitle">Add Services</h3>
                    {celebrationSteps.map((step) => (
                        <Accordion key={step.icon} className="accordion">
                            <AccordionSummary
                                expandIcon={<FaArrowDown />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                            >
                                <>
                                    <div className={`icon ${step.color}`}>{step.icon}</div>
                                    <h5>{step.text}</h5>
                                </>
                            </AccordionSummary>
                            <AccordionDetails>
                                <section className="optionsContainer">
                                    {step.options.map((option) => (
                                        <ProductCard
                                            key={option.title}
                                            product={option}
                                            productAdded={() => productAdded(option)}
                                            selected={selectedItems.includes(option.title)}
                                        />
                                    ))}
                                </section>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    <footer className="footer-next" onClick={() => addMeals()}>
                        <span>Add Meal And Checkout</span>
                    </footer>
                </section>
            </Wrapper>
        </>
    );
};

export default Celebrations;
