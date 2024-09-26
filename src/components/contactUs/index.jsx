import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import TextField from "@mui/material/TextField";
import './styles.scss';

export default function ContactUs({ orderData }) {

  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '', area: '', pincode: ''});

  const handleChange = (value, key) => {
    const _customerData = {...customerData};
    _customerData[key] = value.target.value.toUpperCase();
    setCustomerData(_customerData);
  }
  
  const sendEmail = async (e) => {
    try {
      e.preventDefault();
      const result = await emailjs.send(
        'service_kxtrggs',
        'template_kmx497l',
        { ...orderData, customerData },
        '7XTZPmHeCCDqhVTGp'
      );
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    customerData && <form onSubmit={sendEmail}>
      <ul>
          <li><TextField required label="Name" type="text" value={customerData.name} onChange={(e) => handleChange(e, 'name')} /></li>
          <li><TextField required label="Phone" type="phone" value={customerData.phone} onChange={(e) => handleChange(e, 'phone')}/></li>
          <li><TextField required label="Address" type="address" value={customerData.address} onChange={(e) => handleChange(e, 'address')}/></li>
          <li><TextField required label="Locality / Area" type="text" value={customerData.area} onChange={(e) => handleChange(e, 'area')}/></li>
          <li><TextField required label="Pincode" type="number" value={customerData.pincode} onChange={(e) => handleChange(e, 'pincode')}/></li>
      </ul>
      <div className="confirmSection">
        <input type="submit" value='Confirm order' />
        <p>Our Team will call you back shortly for confirmation.</p>
        <br />
        <br />
      </div>
    </form>
  );
}