import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import emailjs from 'emailjs-com';
import TextField from "@mui/material/TextField";
import Modal from '../modal';
import OTPModal from '../otpModal';
import './styles.scss';
// import { sendOTP } from '../../services/otp';

export default function ContactUs({ orderData }) {
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '', area: '', pincode: ''});
  const [phoneError, setPhoneError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phone, setPhone] = useState(null);

  const handleChange = (value, key) => {
    const _customerData = {...customerData};
    _customerData[key] = value.target.value.toUpperCase();
    setCustomerData(_customerData);

    if (key === 'phone') {
      setPhoneError('');
    }
  };

  const isValidPhoneNumber = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const handleSubmit = () => {};

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!isValidPhoneNumber(customerData.phone)) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      return;
    }
    setPhone(customerData.phone);
    console.log({ ...orderData, customerData });
    // setShowOtpModal(true);
    // sendOTP(customerData.phone)
    try {
      // const result = await emailjs.send(
      //   'service_kxtrggs',
      //   'template_kmx497l',
      //   { ...orderData, customerData },
      //   '7XTZPmHeCCDqhVTGp'
      // );
      // console.log(result);
      modalOn();
    } catch (error) {
      console.log(error);
    }
  };

  const modalOn = () => {
    setShowModal(true);
    setTimeout(() => {
        setShowModal(false);
        navigate('/');
    }, 3000);
  };

  return (
    <>
      <OTPModal
        showModal={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleSubmit}
        phone={phone}
      />
      <Modal showModal={showModal} title='ORDER REQUEST RECEIVED' content='Our team will reach out to you very soon for the confirmation.' type='warning' />
      {customerData && <form onSubmit={sendEmail}>
        <ul>
            <li><TextField required label="Name" type="text" value={customerData.name} onChange={(e) => handleChange(e, 'name')} /></li>
            <li>
              <TextField
                required
                label="Phone"
                type="tel"
                value={customerData.phone}
                onChange={(e) => handleChange(e, 'phone')}
                error={!!phoneError}
                helperText={phoneError}
              />
            </li>
            <li><TextField required label="Address" type="address" value={customerData.address} onChange={(e) => handleChange(e, 'address')}/></li>
            <li><TextField required label="Locality / Area" type="text" value={customerData.area} onChange={(e) => handleChange(e, 'area')}/></li>
            <li><TextField required label="Pincode" type="number" value={customerData.pincode} onChange={(e) => handleChange(e, 'pincode')}/></li>
        </ul>
        <div className="confirmSection">
          <input type="submit" value='Confirm order' />
          {/* <p>Our Team will call you back shortly for confirmation.</p> */}
          <br />
          <br />
          <br />
        </div>
      </form>}
    </>
  );
}
