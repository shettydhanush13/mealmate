import Checkbox from '@mui/material/Checkbox';
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { toINR, calculateProductPrice } from "../../../utils/util";
import DateTimePicker from '../../../components/datePicker';
import Wrapper from "../../../components/wrapper";
import ContactUs from '../../../components/contactUs';
import Pricing from '../../../components/pricing';
import Textarea from '../../../components/textArea';
import CelebrationItemsList from '../../../components/celebrationItemsList';

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
    const [celebrationProducts, setCelebrationProducts] = useState(null);
    const [productPricing, setProductPricing] = useState({
        total: 0,
        discount: 0,
        finalPrice: 0
    });

    // Initialize orderData state
    const [orderData, setOrderData] = useState({
        people: guests,
        price: {},
        special_request: content,
        menu_sections: Object.keys(selectedItems).map(
            (category) => `${category.toUpperCase()}: ${selectedItems[category].join(', ')}`
        ),
        date: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
    });

    useEffect(() => {
        const celebrationProducts = JSON.parse(localStorage.getItem('celebration-services'));
        if (celebrationProducts) setCelebrationProducts(celebrationProducts);
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let _additionalPrice = 0;
        for (const category of selectedItemsCategory) {
            for (const item of selectedItems[category]) {
                if (itemsWithPrice[item]) _additionalPrice += itemsWithPrice[item];
            }
        }
        setPricepax(prevPricepax => (prevPricepax === menu.price.max ? prevPricepax + _additionalPrice : prevPricepax));
    }, [selectedItemsCategory, selectedItems, itemsWithPrice, menu.price.max]);

    const getPricePax = useCallback(() => {
        let discountPercentage = guests < 30 ? 0 : Math.min(guests / 15, 10);
        const discountedPrice = pricepax * (1 - discountPercentage / 100);
        return Math.floor(discountedPrice);
    }, [guests, pricepax]);

    const pricing = useMemo(() => {
        const totalFoodPrice = pricepax * guests;
        const serviceCharge = isService ? serviceChargePax * guests : 0;
        const discountedPax = getPricePax();
        const discountPax = pricepax - discountedPax;
        const totalDiscount = discountPax * guests;
        const baseFinalPrice = totalFoodPrice + serviceCharge - totalDiscount;

        // Include celebration product pricing if it exists
        const finalPrice = celebrationProducts
            ? baseFinalPrice + productPricing.finalPrice
            : baseFinalPrice;

        return {
            pricepax: toINR(pricepax),
            totalFoodPrice: toINR(totalFoodPrice),
            serviceCharge: toINR(serviceCharge),
            totalPrice: toINR(totalFoodPrice + serviceCharge),
            discountedPax: toINR(discountedPax),
            discountPax: toINR(discountPax),
            totalDiscount: toINR(totalDiscount),
            finalPrice: toINR(finalPrice)
        };
    }, [guests, isService, pricepax, getPricePax, productPricing.finalPrice, celebrationProducts]);

    useEffect(() => {
        if (celebrationProducts) {
            const _productPricing = calculateProductPrice(celebrationProducts);
            setProductPricing(_productPricing);
        }
    }, [celebrationProducts]);

    useEffect(() => {
        setOrderData((prevData) => ({
            ...prevData,
            people: guests,
            price: pricing,
            special_request: content,
        }));
    }, [guests, pricing, content]);

    const handleGuestCount = (e) => {
        setGuests(e.target.value);
    };

    const onDateChange = (date) => {
        setOrderData((prevData) => ({
            ...prevData,
            date: date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
        }));
    };

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage">
                {/* Guests Section */}
                <section>
                    <div className="guestCountSection pricePaxSection">
                        <p className="key">Guests :</p>
                        <input
                            type="number"
                            min={menu.person.min}
                            max={menu.person.max}
                            value={guests}
                            onChange={handleGuestCount}
                        />
                    </div>
                </section>

                {/* Price per Plate Section */}
                <section className="pricePaxSection">
                    <span className="key">Price per plate :</span>
                    <p className="key">
                        <span className="originalPrice">{toINR(pricepax)}</span>
                        <span className="discountedPrice">&nbsp;&nbsp;{pricing.discountedPax}</span>
                    </p>
                </section>

                {/* Menu Section */}
                <section className="menuSection">
                    <p className="key">Selected menu</p>
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => (
                            selectedItems[category].length ? (
                                <>
                                    <p>{category}</p>
                                    <ul>
                                        {selectedItems[category].map((item) => (
                                            <li key={item}>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null
                        ))}
                        {celebrationProducts && (
                            <CelebrationItemsList products={celebrationProducts} />
                        )}
                    </div>
                    <Textarea content={content} setContent={(e) => setContent(e.target.value)} />
                </section>

                {/* Service Section */}
                <section className="pricePaxSection isServiceSection">
                    <p className="key">Need staff for service?</p>
                    <Checkbox checked={isService} onChange={() => setIsService((checked) => !checked)} />
                </section>
                {isService && (
                    <section className="pricePaxSection isServiceSection">
                        <span className="key">Our executive will discuss further about our service plans</span>
                    </section>
                )}

                {/* Pricing Section */}
                <Pricing
                    isService={isService}
                    productPricing={productPricing}
                    pricepax={pricepax}
                    pricing={pricing}
                    guests={guests}
                />

                {/* Contact Details Section */}
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <DateTimePicker onDateChange={onDateChange} />
                    <ContactUs orderData={orderData} />
                </div>
            </div>
        </Wrapper>
    );
};

export default Checkout;
