import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import DateTimePicker from '../../../components/datePicker';
import Wrapper from "../../../components/wrapper";
import ContactUs from '../../../components/contactUs';
import Textarea from '../../../components/textArea';
import CelebrationItemsList from "../../../components/celebrationItemsList";
import { calculateProductPrice, toINR } from "../../../utils/util";
import "./styles.scss";

const CelebrationsCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [content, setContent] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [pricing, setPricing] = useState({ total: 0, discount: 0, finalPrice: 0 });

    useEffect(() => {
        window.scrollTo(0, 0);

        if (!location?.state?.products) {
            navigate('/celebrations');
            return;
        }

        const calculatedPricing = calculateProductPrice(location?.state?.products);
        setPricing(calculatedPricing);
    }, [location, navigate]);

    useEffect(() => {
        if (orderData) {
            setOrderData(prevOrderData => ({
                ...prevOrderData,
                special_request: content,
            }));
        }
    }, [content, orderData]);

    const handleDateChange = (date) => {
        setOrderData(prevOrderData => ({
            ...prevOrderData,
            date: date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
        }));
    };

    return (
        <Wrapper headertext='Confirm your order' footer={false}>
            <div className="checkoutPage celebrationsCheckoutPage">
                <section className="menuSection">
                    <div className="menuItemsSection">
                        <CelebrationItemsList products={location?.state?.products} />
                    </div>
                    <Textarea content={content} setContent={setContent} />
                </section>
                <section className="pricingSection">
                    <div className="pricePaxSection">
                        <span className="key">Total</span>
                        <span>{toINR(pricing.total)}</span>
                    </div>
                    <div className="pricePaxSection discount">
                        <span className="key">Discount</span>
                        <span>- {toINR(pricing.discount)}</span>
                    </div>
                    <hr />
                    <div className="pricePaxSection finalPriceSection">
                        <span className="key">Final price :</span>
                        <span>{toINR(pricing.finalPrice)}</span>
                    </div>
                </section>
                <div className="contactSection">
                    <p>Add Your Details</p>
                    <DateTimePicker onDateChange={handleDateChange} />
                    <ContactUs orderData={orderData} />
                </div>
            </div>
        </Wrapper>
    );
};

export default CelebrationsCheckout;
