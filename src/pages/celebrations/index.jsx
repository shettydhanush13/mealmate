import React from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import ProductCard from '../../components/celebrationProductCard';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { celebrationSteps } from '../../data/celebrationsData';
import { FaArrowDown } from "react-icons/fa";
import './styles.scss';
import { useState } from "react";

const Celebrations = () => {
    const navigate = useNavigate();
    const [selectedItems, setSelctedItems] = useState([]);
    const [selectedItemsObj, setSelctedItemsObj] = useState([]);


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
        setSelctedItems(_selectedItems);
        setSelctedItemsObj(_selectedItemsObj);
    };

    const addMeals = () => {
        navigate('meal', { state : { products: selectedItemsObj } });
    };

    return (
        <Wrapper headertext="Create a Celebration!" footer={true}>
            <section className="celebrations-section">
                {celebrationSteps.map((step) => <Accordion
                    key={step.icon} className="accordion">
                        <AccordionSummary
                            expandIcon={<FaArrowDown/>}
                            aria-controls="panel1-content"
                            id="panel1-header">
                            <>
                                <div className={`icon ${step.color}`}>{step.icon}</div>
                                <h5>{step.text}</h5>
                            </>
                        </AccordionSummary>
                        <AccordionDetails>
                            <section className="optionsContainer">
                                {step.options.map((option) =>
                                    <ProductCard
                                        product={option}
                                        productAdded={() => productAdded(option)}
                                        selected={selectedItems.includes(option.title)}
                                    />
                                )}
                            </section>
                        </AccordionDetails>
                    </Accordion>
                )}
                <footer className="footer-next" onClick={() => addMeals()}>
                    <span>Add Meal And Checkout</span>
                </footer>
            </section>
        </Wrapper>
    );
};

export default Celebrations;
