import React, { useCallback, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { toINR } from "../../helper";
import DateTimePicker from '../../components/datePicker';
import Wrapper from "../../components/wrapper";
import ContactUs from '../../components/contactUs';
import Pricing from '../../components/pricing';
import Textarea from '../../components/textArea';
import "./styles.scss";

const MealBoxCheckout = () => {
    const location = useLocation();
    const { totalPrice, selectedItems, type } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);

    const [guests, setGuests] = useState(type === 'bulk' ? Object.values(selectedItems)[0][0].quantity : 10);
    const [content, setContent] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handleGuestCount = (e) => {
        setGuests(e.target.value);
    }

    const getMenuSection = () => {
        const menu = [];
        const sections = Object.keys(selectedItems);
        for(let i=0; i<sections.length; i++) {
            const sectionData = `${sections[i].toUpperCase()} : ${selectedItems[sections[i]].join(', ')}`;
            menu.push(sectionData);
        }
        return menu;
    };

    const getDiscountPrice = useCallback((price) => {
        let discount = 0;
        if (guests > 500) {
            discount = price * 0.3;
        } else {
            const discountPerIncrement = 30/500;
            discount = price * ((discountPerIncrement * guests) / 100);
        }
        return Math.ceil(discount);
    }, [guests]);

    const [pricing, setPricing] = useState({
        pricepax : toINR(totalPrice),
        totalFoodPrice: toINR(totalPrice * guests),
        serviceCharge: toINR(0),
        totalPrice: toINR((totalPrice * guests)),
        discountPax: toINR(getDiscountPrice(totalPrice)),
        totalDiscount: toINR((getDiscountPrice(totalPrice)) * guests),
        finalPrice: toINR((totalPrice * guests) - (getDiscountPrice(totalPrice) *  guests) + (10 * guests)),
    })

    const getPricing = useCallback(() => {
        const _pricing = {...pricing};
        _pricing.totalFoodPrice = toINR(totalPrice * guests);
        _pricing.totalPrice = toINR(totalPrice * guests);
        _pricing.discountPax = toINR(getDiscountPrice(totalPrice));
        _pricing.totalDiscount = toINR((getDiscountPrice(totalPrice)) * guests);
        _pricing.finalPrice = toINR((totalPrice * guests) - (getDiscountPrice(totalPrice) *  guests) + (type === 'mealbox' ? (10 * guests) : 0 ));
        setPricing(_pricing);
    }, [getDiscountPrice, totalPrice, guests, pricing]);

    useEffect(() => {
        getPricing()
        // eslint-disable-next-line
    }, [guests]);

    const [orderData, setOrderData] = useState({
        people: guests,
        price: {},
        special_request: content,
        menu_sections: getMenuSection(),
        date: new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
    });

    const onDateChange = (date) => {
        const _orderData = {...orderData};
        _orderData.date = date.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
        setOrderData(_orderData);
    }

    const getItemPricing = (price) => {
        return toINR(price);
    }

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage mealBoxCheckoutPage">
                <DateTimePicker onDateChange={onDateChange}/>
                {type !== 'bulk' && <section>
                    <div className="guestCountSection pricePaxSection">
                        <p className="key">{type === 'mealbox' ? 'Meal Boxes' : 'Guests'} :</p>
                        <input
                            type="number"
                            min={10}
                            max={500}
                            value={guests}
                            onChange={handleGuestCount}
                        />
                    </div>
                </section>}
                <section className="menuSection">
                    {type !== 'bulk' && <p className="key">Selected menu</p>}
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => selectedItems[category].length ? <>
                            <p>{category}</p>
                            <ul>{selectedItems[category].map((item) => <li key={item.id}>
                                <span>{item.name} {type === 'bulk' && <span className="quantityInfo">&nbsp;&nbsp;{getItemPricing(item.pricePerItem)} * {item.quantity}</span>} {item.desc ? <span className="menuPricing">&nbsp;&nbsp;( {item.desc} )</span> : ''}</span>
                                {type !== 'bulk' && <span className="menuPricing">{getItemPricing(item)}</span>}
                                {type === 'bulk' && <span className="menuPricing">{getItemPricing(item.price)}</span>}                                
                            </li>)}</ul>
                        </> : <></>)}
                    </div>
                </section>
                <section className="pricePaxSection">
                    {type === 'bulk' && <span className="key">Total Price :</span>}
                    {type !== 'bulk' && <span className="key">Price Per {type === 'mealbox' ? 'Box' : 'Guest'} :</span>}
                    <p className="key">
                        <span className="originalPrice">{toINR(totalPrice)}</span>
                        <span className="discountedPrice">&nbsp;&nbsp;{toINR(totalPrice - getDiscountPrice(totalPrice))}</span>
                    </p>
                </section>
                {type !== 'bulk' && <Pricing isService={false} type={type} pricepax={totalPrice} pricing={pricing} guests={guests}/>}
                <section className="menuSection">
                    <Textarea content={content} setContent={(e) => setContent(e.target.value)}/>
                </section>
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <ContactUs orderData={orderData}/>
                </div> 
            </div>
        </Wrapper>
    );
};

export default MealBoxCheckout;
