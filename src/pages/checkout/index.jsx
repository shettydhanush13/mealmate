import { TextField } from "@mui/material";
import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faPerson } from '@fortawesome/free-solid-svg-icons'
import DateTimePicker from '../../components/datePicker';
import Wrapper from "../../components/wrapper";
import "./styles.scss";

const Checkout = () => {
    const location = useLocation();
    const { selectedItems, menu } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);
    const serviceChargePax = 20;

    const [guests, setGuests] = useState(menu.person.min);
    const [pricepax] = useState(menu.price.max);
    const [isService, setIsService] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

    const handleGuestCount = (e) => {
        // To-Do Add debouncing here
        setGuests(e.target.value);
    }

    const getServiceCharge = () => {
        if(isService) return serviceChargePax * guests;
        else return 0;
    }

    const getFinalPrice = () => {
        return guests * pricepax + getServiceCharge();
    }

    const handleService = (e) => setIsService(e.target.checked);
    
    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage">
                <DateTimePicker/>
                <section>
                    <div className="guestCountSection pricePaxSection">
                        <p className="key">Guests : </p>
                        <input
                            type="number"
                            min={menu.person.min}
                            max={menu.person.max}
                            value={guests}
                            onChange={handleGuestCount}
                            defaultValue={menu.person.min}
                        />
                        {/* <section>
                            <FontAwesomeIcon icon={faPerson} />
                            <FontAwesomeIcon icon={faPerson} />
                            <FontAwesomeIcon icon={faPerson} />
                            <span>&nbsp;&nbsp;Min {menu.person.min} - Max {menu.person.max}</span>
                        </section> */}
                    </div>
                </section>
                <section className="pricePaxSection">
                    <span className="key">Price per plate :</span>
                    <span>₹{pricepax}</span>
                </section>
                <section className="menuSection">
                    <p className="key">Selected menu</p>
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => selectedItems[category].length ? <>
                            <p>{category}</p>
                            <ul>{selectedItems[category].map((item) => <li>{item}</li>)}</ul>
                        </> : <></>)}
                    </div>
                </section>
                <section className="pricePaxSection">
                    <span className="key">Need staff for service?</span>
                    <input checked={isService} type="checkbox" name="Need service?" id="" onChange={handleService}/>
                </section>
                <section>
                    <div className="pricePaxSection">
                        <span className="key">Food :</span>
                        <span>₹{guests * pricepax}</span>
                    </div>
                    {<div className="pricePaxSection">
                        <span className="key">{`Service ${isService ? `( ₹20 / Plate )` : ''} :`}</span>
                        <span>₹{getServiceCharge()}</span>
                    </div>}
                    <hr />
                    <div className="pricePaxSection">
                        <span className="key">Final price :</span>
                        <span>₹{getFinalPrice()}</span>
                    </div>
                </section>
                {/* <section>
                    <button>Request demo plate</button>
                </section> */}
                <div className="addressSection">
                    <p>Add Details</p>
                    <ul>
                        <li><TextField label="Name" type="text" /></li>
                        <li><TextField label="Phone" type="phone" /></li>
                        <li><TextField label="Address" type="text" /></li>
                        <li><TextField label="Locality" type="text" /></li>
                        <li><TextField label="Pincode" type="number" /></li>
                    </ul>
                </div>
                <div className="confirmSection">
                    <button>Confirm order</button>
                    <p>Our team will call you back shortly for confirmation.</p>
                </div>
            </div>
        </Wrapper>
    );
};

export default Checkout;
