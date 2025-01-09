import React, { useState } from "react";
import Wrapper from "../../components/wrapper";
// import Accordion from '@mui/material/Accordion';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import AccordionSummary from '@mui/material/AccordionSummary';
import OrderAccordion from "../../components/orderAccordion";
import { ordersData } from '../../data/ordersData';
// import { FaArrowDown } from "react-icons/fa";
import './styles.scss';

const MyOrders = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state

  const handlePhoneSubmit = () => {
    if (phone.match(/^\d{10}$/)) {
      setLoading(true); // Start loader
      setTimeout(() => {
        setLoading(false); // Stop loader after simulating API call
        setStep(2);
      }, 2000); // Simulate API delay
    } else {
      alert("Please enter a valid 10-digit phone number.");
    }
  };

  const handleOtpSubmit = () => {
    if (otp === '123456') {
      setLoading(true); // Start loader
      setTimeout(() => {
        setLoading(false); // Stop loader
        setProfile(ordersData.filter((profiles) => profiles.number === phone)?.[0]);
        setStep(3);
      }, 2000); // Simulate API delay
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const resetSteps = () => {
    setLoading(false); // Stop loader
    setProfile(null);
    setStep(1);
    setPhone('');
    setOtp('');
  }

  return (
    <Wrapper headertext="My Orders" headerLeftType='home' footer={true}>
      <section className="my-orders">
        {step === 1 && (
          <div className="phone-step">
            <h2>Enter Your Phone Number</h2>
            <input
              type="number"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.slice(0, 10))}
              maxLength={10}
            />
            <button onClick={handlePhoneSubmit} disabled={loading}>
              {loading ? <div className="loader"></div> : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="otp-step">
            <h2>Enter OTP</h2>
            <input
              type="number"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            />
            <button onClick={handleOtpSubmit} disabled={loading}>
              {loading ? <div className="loader"></div> : "Validate OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="orders-list">
            {profile ? (
              <>
                <p className="order-found-text">{`${profile.orders.length} Orders Found For ${phone}`}</p>
                {profile.orders.map((order) => <OrderAccordion order={order} />)}
              </>
            ) : (
              <>
                <p>{`No orders found for ${phone}`}</p>
                <button onClick={() => resetSteps()} disabled={loading}>
                  {loading ? <div className="loader"></div> : "TRY ANOTHER NUMBER"}
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </Wrapper>
  );
};

export default MyOrders;
