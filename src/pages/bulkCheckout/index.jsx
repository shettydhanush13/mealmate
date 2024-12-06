import React, { useCallback, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { toINR } from "../../helper";
import DateTimePicker from '../../components/datePicker';
import Wrapper from "../../components/wrapper";
import ContactUs from '../../components/contactUs';
import Textarea from '../../components/textArea';
import Pricing from '../../components/pricing';
import "./styles.scss";

const BulkCheckout = () => {
    const location = useLocation();
    const { totalPrice, selectedItems, type } = location.state;
    const selectedItemsCategory = Object.keys(selectedItems);

    const guests = Object.values(selectedItems.Items)[0].quantity;

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const getMenuSection = () => {
        const menu = selectedItems.Items.map((item) => `${item.name} : ${item.quantity}`);
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

    const pricing = {
        pricepax : toINR(0),
        totalFoodPrice: toINR(totalPrice),
        serviceCharge: toINR(0),
        totalPrice: toINR((totalPrice)),
        discountPax: toINR(getDiscountPrice(totalPrice)),
        totalDiscount: toINR(getDiscountPrice(totalPrice)),
        finalPrice: toINR((totalPrice) - (getDiscountPrice(totalPrice))),
    };

    const [orderData, setOrderData] = useState({
        people: guests,
        price: pricing,
        special_request: '',
        menu_sections: getMenuSection(),
        date: new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
    });

    const onDateChange = (date) => {
        const _orderData = {...orderData};
        _orderData.date = date.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
        setOrderData(_orderData);
    }

    const onContentChange = (content) => {
        const _orderData = {...orderData};
        _orderData.special_request = content;
        setOrderData(_orderData);
    };

    const getItemPricing = (price) => {
        return toINR(price);
    }

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage mealBoxCheckoutPage">
                <DateTimePicker onDateChange={onDateChange}/>
                <section className="menuSection">
                    <div className="menuItemsSection">
                        {selectedItemsCategory.map((category) => selectedItems[category].length ? <div key={category}>
                            <p>{category}</p>
                            <ul>{selectedItems[category].map((item) => <li key={item.id}>
                                <span>{item.name} <span className="quantityInfo">&nbsp;&nbsp;{getItemPricing(item.pricePerItem)} * {item.quantity}</span> {item.desc ? <span className="menuPricing">&nbsp;&nbsp;( {item.desc} )</span> : ''}</span>                              
                                <span className="menuPricing">{getItemPricing(item.price)}</span>                                
                            </li>)}</ul>
                        </div> : <></>)}
                    </div>
                </section>
                <Pricing isService={false} type={type} pricepax={totalPrice} pricing={pricing} guests={guests}/>
                <section className="menuSection">
                    <Textarea onChange={(e) => onContentChange(e.target.value)}/>
                </section>
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <ContactUs orderData={orderData}/>
                </div> 
            </div>
        </Wrapper>
    );
};

export default BulkCheckout;
