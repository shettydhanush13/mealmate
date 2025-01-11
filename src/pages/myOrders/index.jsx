import React, { useState, useRef, useEffect } from "react";
import Wrapper from "../../components/wrapper";
import OrderAccordion from "../../components/orderAccordion";
import { ordersData } from '../../data/ordersData';
import { Helmet } from "react-helmet";
import './styles.scss';

const MyOrders = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 1 && phoneInputRef.current) {
      phoneInputRef.current.focus();
    } else if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handlePhoneSubmit = () => {
    if (phone.match(/^\d{10}$/)) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 2000);
    } else {
      alert("Please enter a valid 10-digit phone number.");
    }
  };

  const handleOtpSubmit = () => {
    if (otp === '123456') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setProfile(ordersData.filter((profiles) => profiles.number === phone)?.[0]);
        setStep(3);
      }, 2000);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const resetSteps = () => {
    setLoading(false);
    setProfile(null);
    setStep(1);
    setPhone('');
    setOtp('');
  };

  return (
    <Wrapper headertext="My Orders" headerLeftType='home' footer={true}>
      <Helmet>
        <title>My Orders</title>
        <meta name="description" content="View and manage your orders with ease." />
        <meta name="keywords" content="orders, catering, meal orders, customized menu" />
      </Helmet>

      <section className="my-orders">
        {step === 1 && (
          <div className="phone-step">
            <h2>Enter Your Phone Number</h2>
            <input
              ref={phoneInputRef}
              type="number"
              placeholder=""
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
              ref={otpInputRef}
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
