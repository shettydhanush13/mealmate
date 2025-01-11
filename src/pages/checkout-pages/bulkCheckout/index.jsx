import React, { useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../../utils/util";
import DateTimePicker from "../../../components/datePicker";
import Wrapper from "../../../components/wrapper";
import ContactUs from "../../../components/contactUs";
import Textarea from "../../../components/textArea";
import Pricing from "../../../components/pricing";
import Checkbox from "@mui/material/Checkbox";
import CelebrationItemsList from "../../../components/celebrationItemsList";
import "./styles.scss";

const BulkCheckout = () => {
  const location = useLocation();
  const { totalPrice, selectedItems } = location.state;
  const selectedItemsCategory = Object.keys(selectedItems);

  const [isService, setIsService] = useState(false);
  const [celebrationProducts, setCelebrationProducts] = useState(null);
  const [productPricing, setProductPricing] = useState({
    total: 0,
    discount: 0,
    finalPrice: 0,
  });

  const guests = 0;

  useEffect(() => {
    const storedCelebrationProducts = localStorage.getItem("celebration-services");
    if (storedCelebrationProducts) {
      setCelebrationProducts(JSON.parse(storedCelebrationProducts));
    }
    window.scrollTo(0, 0);
  }, []);

  const getMenuSection = () => selectedItems.Items.map(item => `${item.name} : ${item.quantity}`);

  const getDiscountPrice = useCallback(price => Math.ceil(price * 0.05), []);

  const initialPricing = {
    pricepax: toINR(0),
    totalFoodPrice: toINR(totalPrice),
    serviceCharge: toINR(0),
    totalPrice: toINR(totalPrice),
    discountPax: toINR(getDiscountPrice(totalPrice)),
    totalDiscount: toINR(getDiscountPrice(totalPrice)),
    finalPrice: toINR(totalPrice - getDiscountPrice(totalPrice)),
  };

  const [pricing, setPricing] = useState(initialPricing);

  useEffect(() => {
    if (celebrationProducts) {
      const updatedProductPricing = calculateProductPrice(celebrationProducts);
      const updatedFinalPrice = getDiscountPrice(totalPrice) + updatedProductPricing.finalPrice;
      setProductPricing(updatedProductPricing);
      setPricing(prev => ({
        ...prev,
        finalPrice: toINR(updatedFinalPrice),
      }));
    }
  }, [celebrationProducts, totalPrice, getDiscountPrice]);

  const [orderData, setOrderData] = useState({
    people: guests,
    price: pricing,
    special_request: "",
    menu_sections: getMenuSection(),
    date: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
  });

  const onDateChange = date => {
    setOrderData(prev => ({
      ...prev,
      date: date.toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
    }));
  };

  const onContentChange = content => {
    setOrderData(prev => ({
      ...prev,
      special_request: content,
    }));
  };

  return (
    <Wrapper headertext="Confirm your order" footer={false}>
      <div className="checkoutPage mealBoxCheckoutPage">
        <section className="menuSection">
          <div className="menuItemsSection">
            {selectedItemsCategory.map(category =>
              selectedItems[category].length ? (
                <div key={category}>
                  <p>{category}</p>
                  <ul>
                    {selectedItems[category].map(item => (
                      <li key={item.id}>
                        <span>
                          {item.name}
                          {item.desc && (
                            <span className="menuPricing">
                              &nbsp;&nbsp;({item.desc})
                            </span>
                          )}
                          <span className="quantityInfo">
                            &nbsp;&nbsp;x {item.quantity}
                          </span>
                        </span>
                        <span className="menuPricing">{toINR(item.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
            {celebrationProducts && <CelebrationItemsList products={celebrationProducts} />}
          </div>
        </section>
        <section className="pricePaxSection isServiceSection">
          <p className="key">Need staff for service?</p>
          <Checkbox checked={isService} onChange={() => setIsService(prev => !prev)} />
        </section>
        {isService && (
          <section className="pricePaxSection isServiceSection">
            <span className="key">
              Our executive will discuss further about our service plans
            </span>
          </section>
        )}
        <Pricing
          isService={false}
          type="bulk"
          productPricing={productPricing}
          pricing={pricing}
          guests={guests}
        />
        <section className="menuSection">
          <Textarea onChange={e => onContentChange(e.target.value)} />
        </section>
        <div className="contactSection">
          <p>Add Your Details</p>
          <DateTimePicker onDateChange={onDateChange} />
          <ContactUs orderData={orderData} />
        </div>
      </div>
    </Wrapper>
  );
};

export default BulkCheckout;
