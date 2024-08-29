import React from "react";
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPerson } from '@fortawesome/free-solid-svg-icons'
import DateTimePicker from '../../components/datePicker';
import "./styles.scss";

const Checkout = () => {
    const location = useLocation();
    const { selectedItems, menu } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);
    const serviceChargePax = 20;

    const [guests, setGuests] = useState(menu.person.min);
    const [pricepax] = useState(menu.price.max);
    const [isService, setIsService] = useState(true);

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
        <div className="wrapper checkoutPage">
            <DateTimePicker/>
            <section>
                <div className="guestCountSection">
                    <p>Guests : </p>
                    <input
                        type="number"
                        min={menu.person.min}
                        max={menu.person.max}
                        value={guests}
                        onChange={handleGuestCount}
                        defaultValue={menu.person.min}
                    />
                    <section>
                        <FontAwesomeIcon icon={faPerson} />
                        <FontAwesomeIcon icon={faPerson} />
                        <FontAwesomeIcon icon={faPerson} />
                        <span>&nbsp;&nbsp;Min {menu.person.min} - Max {menu.person.max}</span>
                    </section>
                </div>
            </section>
            <section>Price per plate : ₹{pricepax}</section>
            <section>
                <p>Selected menu</p>
                {selectedItemsCategory.map((category) => selectedItems[category].length ? <>
                    <p>{category}</p>
                    <ul>{selectedItems[category].map((item) => <li>{item}</li>)}</ul>
                </> : <></>)}
            </section>
            <section>
                <span>Need staff for service?</span>
                <input type="checkbox" name="Need service?" id="" onChange={handleService}/>
            </section>
            <section>
                <p>Food : ₹{guests * pricepax}</p>
                <p>Service : ₹{getServiceCharge()}</p>
                <p>Final price : ₹{getFinalPrice()}</p>
            </section>
            {/* <section>
                <button>Request demo plate</button>
            </section> */}
            <section>
                <p>Add address</p>
                <ul>
                    <li><input type="text" /></li>
                    <li><input type="text" /></li>
                    <li><input type="text" /></li>
                </ul>
            </section>
            <section>
                <button>Contact us for special request</button>
            </section>
            <section>
                <button>Pay ₹{Math.round(getFinalPrice()/10)} in advance to confirm the order</button>
            </section>
        </div>
    );
};

export default Checkout;
