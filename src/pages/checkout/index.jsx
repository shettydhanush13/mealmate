import Checkbox from '@mui/material/Checkbox';
import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { toINR } from "../../helper";
import DateTimePicker from '../../components/datePicker';
import Wrapper from "../../components/wrapper";
import ContactUs from '../../components/contactUs';
import Pricing from '../../components/pricing';
import Textarea from '../../components/textArea';
import "./styles.scss";

const Checkout = () => {
    const location = useLocation();
    const { selectedItems, itemsWithPrice, menu } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);
    const serviceChargePax = 20;
    const [pricepax, setPricepax] = useState(menu.price.max);

    const [guests, setGuests] = useState(100);
    const [isService, setIsService] = useState(false);
    const [content, setContent] = useState('');

    useEffect(() => {
        let _additionaPrice = 0;
        for(const category of selectedItemsCategory) {
            for(const item of selectedItems[category]) {
                if (itemsWithPrice[item]) _additionaPrice += itemsWithPrice[item];
            }
        }
        setPricepax(pricepax => {
            if (pricepax === menu.price.max) return pricepax + _additionaPrice
            else return pricepax;
        });
        // eslint-disable-next-line
    }, [pricepax]);

    const getPricePax = useCallback(() => {
        let discountPercentage = 0;
        // Determine the discount based on the number of plates
        if (guests < 30) discountPercentage = 0; // No discount
        else discountPercentage = guests/15;
        // Calculate the discounted price per plate
        if (discountPercentage > 10) discountPercentage = 10;
        const discountedPrice = pricepax * (1 - discountPercentage / 100);
        // Calculate the total cost
        return Math.floor(discountedPrice);
    }, [guests, pricepax]);

    const [pricing, setPricing] = useState({
        pricepax : toINR(pricepax),
        totalFoodPrice: toINR(pricepax * guests),
        serviceCharge: toINR(isService ? serviceChargePax * guests : 0),
        totalPrice: toINR((pricepax * guests) + (isService ? serviceChargePax * guests : 0)),
        discountedPax: toINR(getPricePax()),
        discountPax: toINR(pricepax - getPricePax()),
        totalDiscount: toINR((pricepax - getPricePax()) * guests),
        finalPrice: toINR((pricepax * guests) + (isService ? serviceChargePax * guests : 0) - (0 *  guests)),
    });

    const getMenuSection = () => {
        const menu = [];
        const sections = Object.keys(selectedItems);
        for(let i=0; i<sections.length; i++) {
            const sectionData = `${sections[i].toUpperCase()} : ${selectedItems[sections[i]].join(', ')}`;
            menu.push(sectionData);
        }
        return menu;
    };

    const [orderData, setOrderData] = useState({
        people: guests,
        price: pricing,
        special_request: content,
        menu_sections: getMenuSection(),
        date: new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
    });

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handleGuestCount = (e) => {
        setGuests(e.target.value);
    }

    const onDateChange = (date) => {
        const _orderData = {...orderData};
        _orderData.date = date.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
        setOrderData(_orderData);
    }

    const updatePricing = useCallback(() => {
        const totalFoodPrice = pricepax * guests;
        const serviceCharge = isService ? serviceChargePax * guests : 0;
        const totalPrice = totalFoodPrice + serviceCharge;
        const discountedPax = getPricePax();
        const discountPax = pricepax - getPricePax();
        const totalDiscount = (pricepax - discountedPax) * guests;
        const finalPrice = totalPrice - totalDiscount;
        return {
            pricepax : toINR(pricepax),
            totalFoodPrice : toINR(totalFoodPrice),
            serviceCharge : toINR(serviceCharge),
            totalPrice : toINR(totalPrice),
            discountedPax : toINR(discountedPax),
            discountPax: toINR(discountPax),
            totalDiscount : toINR(totalDiscount),
            finalPrice  : toINR(finalPrice)
        };
    }, [guests, isService, pricepax, getPricePax]);

    useEffect(() => {
        const _updatedPricing = updatePricing();
        const _orderData = {...orderData};
        _orderData.price = _updatedPricing;
        _orderData.people = guests;
        setPricing(_updatedPricing);
        setOrderData(_orderData);      
    }, [guests, isService, orderData, updatePricing]);

    useEffect(() => {
        const _orderData = {...orderData};
        _orderData.special_request = content;
        setOrderData(_orderData);      
    }, [content, orderData]);

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage">
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
                    </div>
                </section>
                <section className="pricePaxSection">
                    <span className="key">Price per plate :</span>
                    <p className="key">
                        <span className="originalPrice">{toINR(pricepax)}</span>
                        <span className="discountedPrice">&nbsp;&nbsp;{pricing.discountedPax}</span>
                    </p>
                </section>
                <section className="menuSection">
                    <p className="key">Selected menu</p>
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => selectedItems[category].length ? <>
                            <p>{category}</p>
                            <ul>{selectedItems[category].map((item) => <li>
                                    <span>{item}</span>
                                </li>)}
                            </ul>
                        </> : <></>)}
                    </div>
                    <Textarea content={content} setContent={(e) => setContent(e.target.value)}/>
                </section>
                <section className="pricePaxSection isServiceSection">
                    <span className="key">Need staff for service?</span>
                    <Checkbox checked={isService} onChange={() => setIsService((checked) => !checked)}/>
                </section>
                {isService && <section className="pricePaxSection isServiceSection">
                    <span className="key">Our executive will discuss further about our service plans</span>
                </section>}
                <Pricing isService={false} pricepax={pricepax} pricing={pricing} guests={guests}/>
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <DateTimePicker onDateChange={onDateChange}/>
                    <ContactUs orderData={orderData}/>
                </div>
            </div>
        </Wrapper>
    );
};

export default Checkout;
