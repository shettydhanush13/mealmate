import React, { useCallback, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { toINR } from "../../../utils/util";
import DateTimePicker from '../../../components/datePicker';
import Wrapper from "../../../components/wrapper";
import ContactUs from '../../../components/contactUs';
import Pricing from '../../../components/pricing';
import Textarea from '../../../components/textArea';
import "./styles.scss";

const MealBoxCheckout = () => {
    const location = useLocation();
    const { totalPrice, selectedItems, type } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);

    const [guests, setGuests] = useState(10);
    const [content, setContent] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleGuestCount = (e) => {
        setGuests(e.target.value);
    };

    const getMenuSection = useCallback(() => {
        return Object.keys(selectedItems).map(
            (section) => `${section.toUpperCase()} : ${selectedItems[section].join(', ')}`
        );
    }, [selectedItems]);

    const getDiscountPrice = useCallback((price) => {
        return Math.ceil(price * 0.05);
    }, []);

    const [pricing, setPricing] = useState(() => {
        const initialPricing = {
            pricepax: toINR(totalPrice),
            totalFoodPrice: toINR(totalPrice * guests),
            serviceCharge: toINR(0),
            totalPrice: toINR(totalPrice * guests),
            discountPax: toINR(getDiscountPrice(totalPrice)),
            totalDiscount: toINR(getDiscountPrice(totalPrice) * guests),
            finalPrice: toINR(totalPrice * guests - getDiscountPrice(totalPrice) * guests + (type === 'mealbox' ? 10 * guests : 0))
        };
        return initialPricing;
    });

    const getPricing = useCallback(() => {
        setPricing((prevPricing) => {
            return {
                ...prevPricing,
                totalFoodPrice: toINR(totalPrice * guests),
                totalPrice: toINR(totalPrice * guests),
                discountPax: toINR(getDiscountPrice(totalPrice)),
                totalDiscount: toINR(getDiscountPrice(totalPrice) * guests),
                finalPrice: toINR(totalPrice * guests - getDiscountPrice(totalPrice) * guests + (type === 'mealbox' ? 10 * guests : 0))
            };
        });
    }, [getDiscountPrice, totalPrice, guests, type]);

    useEffect(() => {
        getPricing();
    }, [getPricing, guests]);

    const [orderData, setOrderData] = useState(() => ({
        people: guests,
        price: {},
        special_request: content,
        menu_sections: getMenuSection(),
        date: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
    }));

    const onDateChange = (date) => {
        setOrderData((prevOrderData) => ({
            ...prevOrderData,
            date: date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
        }));
    };

    const getItemPricing = (price) => toINR(price);

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage mealBoxCheckoutPage">
                <section>
                    <div className="guestCountSection pricePaxSection">
                        <p className="key">{'Meal Boxes'} :</p>
                        <input
                            type="number"
                            min={10}
                            max={500}
                            value={guests}
                            onChange={handleGuestCount}
                        />
                    </div>
                </section>
                <section className="menuSection">
                    <p className="key">Selected menu</p>
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => (
                            selectedItems[category].length ? (
                                <div key={category}>
                                    <p>{category}</p>
                                    <ul>
                                        {selectedItems[category].map((item) => (
                                            <li key={item.id}>
                                                <span>{item.name} {item.desc && <span className="menuPricing">&nbsp;&nbsp;( {item.desc} )</span>}</span>
                                                <span className="menuPricing">{getItemPricing(item.price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null
                        ))}
                    </div>
                </section>
                <section className="pricePaxSection">
                    <span className="key">Price Per Mealbox :</span>
                    <p className="key">
                        <span className="originalPrice">{toINR(totalPrice)}</span>
                        <span className="discountedPrice">&nbsp;&nbsp;{toINR(totalPrice - getDiscountPrice(totalPrice))}</span>
                    </p>
                </section>
                <Pricing isService={false} type={type} pricepax={totalPrice} pricing={pricing} guests={guests} />
                <section className="menuSection">
                    <Textarea content={content} setContent={(e) => setContent(e.target.value)} />
                </section>
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <DateTimePicker onDateChange={onDateChange} />
                    <ContactUs orderData={orderData} content={content} />
                </div>
            </div>
        </Wrapper>
    );
};

export default MealBoxCheckout;
