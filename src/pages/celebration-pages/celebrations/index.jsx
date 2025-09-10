import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../../components/wrapper";
import ProductCard from "../../../components/celebrationProductCard";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { getCelebrationStepsFor, eventTypeOptions } from "../../../data/celebrationsData";
import { FaArrowDown } from "react-icons/fa";
import "./styles.scss";

/* Keep serviceable pincodes and validators out of component to avoid recreating them on every render */
const serviceablePincodes = ["560001", "560002", "560003"];

const validateGuests = (value) => {
  const min = 30;
  const max = 500;
  if (value === "" || value === null || value === undefined) return "Please enter guest count.";
  if (isNaN(value)) return "Guests must be a number.";
  const n = Number(value);
  if (n < min) return `Minimum booking is ${min} guests.`;
  if (n > max) return `Maximum booking is ${max} guests.`;
  return "";
};

const validatePincode = (value) => {
  if (!value) return "Please enter pincode.";
  if (!/^\d{6}$/.test(value)) return "Pincode must be 6 digits.";
  if (!serviceablePincodes.includes(value)) return "Sorry — we don't currently service this pincode.";
  return "";
};

const Celebrations = () => {
  const navigate = useNavigate();

  // product selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsObj, setSelectedItemsObj] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);

  // new states
  const [guests, setGuests] = useState(30);
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState({});

  // get steps for the current event type (memoized)
  const steps = useMemo(() => getCelebrationStepsFor(selectedEvent), [selectedEvent]);

  /* product toggle using functional updates to avoid stale closures */
  const productAdded = useCallback((product) => {
    setSelectedItems((prevTitles) => {
      const exists = prevTitles.indexOf(product.title) > -1;
      if (exists) {
        return prevTitles.filter((t) => t !== product.title);
      }
      return [...prevTitles, product.title];
    });

    setSelectedItemsObj((prevObjs) => {
      const existsIndex = prevObjs.findIndex((o) => o.title === product.title);
      if (existsIndex > -1) {
        return prevObjs.filter((o) => o.title !== product.title);
      }
      return [...prevObjs, product];
    });
  }, []);

  // handlers using callbacks
  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  const onPincodeChange = useCallback((e) => {
    const v = e.target.value.trim();
    setPincode(v);
    setErrors((prev) => ({ ...prev, pincode: v.length >= 1 ? validatePincode(v) : "Pincode must be 6 digits." }));
  }, []);

  // aggregated validity (memoized)
  const allValid = useMemo(() => {
    const gErr = validateGuests(guests);
    const pErr = validatePincode(pincode);
    return { ok: !gErr && !pErr, details: { gErr, pErr } };
  }, [guests, pincode]);

  // footer disabled logic
  const isFooterDisabled = !allValid.ok;

  const addMeals = useCallback(() => {
    const gErr = validateGuests(guests);
    const pErr = validatePincode(pincode);
    const newErrors = {};
    if (gErr) newErrors.guests = gErr;
    if (pErr) newErrors.pincode = pErr;
    setErrors(newErrors);

    if (!gErr && !pErr) {
      navigate("/meal", {
        state: {
          products: selectedItemsObj,
          guests: Number(guests),
          pincode,
          eventType: selectedEvent,
        },
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [guests, pincode, selectedItemsObj, selectedEvent, navigate]);

  return (
    <>
      <Helmet>
        <title>Create a Celebration | CaterKart</title>
        <meta
          name="description"
          content="Plan your perfect event with CaterKart! Choose your event type, add services, and customize your celebration effortlessly."
        />
        <link rel="canonical" href="https:/caterkart.in/celebrations" />
      </Helmet>

      <Wrapper headerLeftType="home" headertext="CaterKart" footer={true}>
        <section className="pageDescSection">
          <header>
            <h1>CREATE A CELEBRATION</h1>
            <p>PICK YOUR EVENT TYPE AND REQUIRED SERVICES</p>
          </header>
        </section>

        <section className="celebrations-section">
          <h3 className="subSectionTitle">Pick Your Event Type</h3>
          <section className="optionsContainer">
            {eventTypeOptions.map((event) => (
              <p
                key={event}
                className={selectedEvent === event ? "eventType active-event-type" : "eventType"}
                onClick={() => setSelectedEvent(event)}
              >
                {event}
              </p>
            ))}
          </section>

          <h3 className="subSectionTitle">Add Services</h3>
          {steps.map((step) => (
            <Accordion key={step.icon} className="accordion">
              <AccordionSummary expandIcon={<FaArrowDown />}>
                <div className={`icon ${step.color}`}>{step.icon}</div>
                <h5>{step.text}</h5>
              </AccordionSummary>
              <AccordionDetails>
                <section className="optionsContainer">
                  {step.options.map((option) => (
                    <ProductCard product={option} selected={selectedItems.includes(option.title)} productAdded={() => productAdded(option)} displaySubOptions="modal" />
                  ))}
                </section>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Redesigned Event Details */}
          <section className="eventDetailsContainer">
            {/* Guests Section - Highlighted Card */}
            <div className="guests-card">
              <label className="guests-label">Number of Guests</label>
              <input
                type="number"
                min="30"
                max="500"
                value={guests}
                onChange={onGuestsChange}
                className="input"
              />
              {errors.guests && <div className="errorText">{errors.guests}</div>}
              <div className="guests-helper">Minimum 30 – Maximum 500 guests</div>
            </div>

            {/* Pincode stacked */}
            <div className="eventDetailsRight">
              <div className="fieldRow">
                <label>Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={onPincodeChange}
                  className="input"
                  placeholder="e.g. 560001"
                />
                {errors.pincode && <div className="errorText">{errors.pincode}</div>}
              </div>
            </div>
          </section>

          <footer
            className={`footer-next ${isFooterDisabled ? "disabled" : ""}`}
            onClick={() => {
              if (!isFooterDisabled) addMeals();
            }}
            role="button"
            aria-disabled={isFooterDisabled}
          >
            <span>Add Meal And Checkout</span>
          </footer>
        </section>
      </Wrapper>
    </>
  );
};

export default Celebrations;
