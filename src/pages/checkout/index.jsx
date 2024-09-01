import TextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faPerson } from '@fortawesome/free-solid-svg-icons'
import DateTimePicker from '../../components/datePicker';
import Wrapper from "../../components/wrapper";
import UnstyledTextareaIntroduction from '../../components/textArea';
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
        return (guests * pricepax + getServiceCharge()) - ((pricepax - getPricePax()) * guests);
    }

    const getPricePax = () => {
        const { price, person } = menu;
        const priceDiff = price.max - price.min;
        const personDiff = person.max - person.min;
        const priceDiffPerPerson = Math.floor((priceDiff/personDiff)*guests);
        return pricepax - priceDiffPerPerson;
    }

    const toINR = (number, fractionDigit = 2) => {
        return number.toLocaleString('en-IN', {
            maximumFractionDigits: fractionDigit,
            style: 'currency',
            currency: 'INR'
        });
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
                    <p className="key">
                        <span className="originalPrice">{toINR(pricepax)}</span>
                        <span className="discountedPrice">&nbsp;&nbsp;{toINR(getPricePax())}</span>
                    </p>
                </section>
                <section className="menuSection">
                    <p className="key">Selected menu</p>
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => selectedItems[category].length ? <>
                            <p>{category}</p>
                            <ul>{selectedItems[category].map((item) => <li>{item}</li>)}</ul>
                        </> : <></>)}
                    </div>
                    {UnstyledTextareaIntroduction()}
                </section>
                <section className="pricePaxSection isServiceSection">
                    <span className="key">Need staff for service?</span>
                    <Checkbox checked={isService} onChange={handleService}/>
                </section>
                <section className="pricingSection">
                    <div className="pricePaxSection">
                        <span className="key">
                            <span>Food </span>
                            <span className="subtext">&nbsp;&nbsp;{`${toINR(pricepax, 0)} x ${guests} guests`}</span>
                        </span>
                        <span>{toINR(guests * pricepax)}</span>
                    </div>
                    <div className="pricePaxSection">
                        <span className="key">
                            <span>Service </span>
                            <span className="subtext">&nbsp;&nbsp;{` ${isService ? `${toINR(20, 0)} / plate` : ''}`}</span>
                        </span>
                        <span>{toINR(getServiceCharge())}</span>
                    </div>
                    <div className="pricePaxSection discount">
                        <span className="key">
                            <span>Bulk order discount </span>
                            <span className="subtext">&nbsp;&nbsp;{`${toINR(pricepax - getPricePax(), 0)} / plate`}</span>
                        </span>
                        <span>- {toINR((pricepax - getPricePax()) * guests)}</span>
                    </div>
                    <hr />
                    <div className="pricePaxSection finalPriceSection">
                        <span className="key">Final price :</span>
                        <span className="key">{toINR(getFinalPrice())}</span>
                    </div>
                </section>
                {/* <section>
                    <button>Request demo plate</button>
                </section> */}
                <div className="addressSection">
                    <p>Add Your Details</p>
                    <ul>
                        <li><TextField label="Name" type="text" /></li>
                        <li><TextField label="Phone" type="phone" /></li>
                        <li><TextField label="Address" type="address" /></li>
                        <li><TextField label="Locality / Area" type="text" /></li>
                        <li><TextField label="Pincode" type="number" /></li>
                    </ul>
                </div>
                <div className="confirmSection">
                    <button>Confirm order</button>
                    <p>Our team will call you back shortly for confirmation.</p>
                    <br />
                    <br />
                </div>
            </div>
        </Wrapper>
    );
};

export default Checkout;
