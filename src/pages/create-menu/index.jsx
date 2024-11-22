import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ItemCard from '../../components/itemCard';
import createMenuBanner from '../../assets/createMenuBanner.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import { items } from "../../data/items";
import './styles.scss';

const CreateMenu = () => {
    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState(null);

    useEffect(() => {
        if (items) {
            const sections = Object.keys(items);
            let _selectedItems = {};
            for(const section of sections) {
                _selectedItems[section] = [];
            }
            setSelectedItems(_selectedItems);
        }
    }, []);

    const getPricing = () => {
        navigate('/checkout', { state: { selectedItems, items } });
    };

    const handleAdd = (section, id) => {
        console.log({ section, id });
        let _selectedItems = {...selectedItems};
        const selectedItemsInSection = _selectedItems[section];
        if (selectedItemsInSection.includes(id)) {
            const index = selectedItemsInSection.indexOf(id);
            if (index > -1) {
                selectedItemsInSection.splice(index, 1);
            }
        } else {
            selectedItemsInSection.push(id);
        }
        setSelectedItems(_selectedItems);
        console.log({ _selectedItems });
      };

    return (
        <Wrapper headertext={'Create Your Menu'} footer={true}>
            <section className="createMenu">
                <img src={createMenuBanner} alt="" />
                {Object.keys(items).map((itemCategory) => <Accordion
                    key={itemCategory} className="accordion">
                        <AccordionSummary
                            expandIcon={<FontAwesomeIcon icon={faExpandArrowsAlt}/>}
                            aria-controls="panel1-content"
                            id="panel1-header">
                                <h3>{itemCategory}</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                            {Object.values(items[itemCategory]).map((item) =>
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => handleAdd(itemCategory, item.name)}
                                    selected={false}
                                />
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}
            </section>
            <footer className="footer-next" onClick={getPricing}>
                <span>Get Pricing</span>
            </footer>
        </Wrapper>
    );
};

export default CreateMenu;
