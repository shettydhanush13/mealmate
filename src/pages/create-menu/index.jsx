import React from "react";
import Wrapper from '../../components/wrapper';
import { items } from "../../data/items";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import ItemCard from '../../components/itemCard';
import './styles.scss';
import banner from '../../assets/banner.png';

const CreateMenu = () => {

    const getPricing = () => {

    }
    return (
        <Wrapper headertext={'Create Your Menu'} footer={true}>
            <div className="createMenu">
                <img src={banner} alt="" />
                {Object.keys(items).map((itemCategory) => <>
                <Accordion className="accordion">
                    <AccordionSummary
                        expandIcon={<FontAwesomeIcon icon={faExpandArrowsAlt}/>}
                        aria-controls="panel1-content"
                        id="panel1-header">
                        <h3>{itemCategory}</h3>
                    </AccordionSummary>
                    <AccordionDetails>
                        {Object.values(items[itemCategory]).map((item) => <ItemCard item={item}/>)}
                    </AccordionDetails>
                </Accordion>
                </>)}
            </div>
            <div className="footer-next" onClick={getPricing}>
                <p>Get Pricing</p>
            </div>
        </Wrapper>
    );
};

export default CreateMenu;
