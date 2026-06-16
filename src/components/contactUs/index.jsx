import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUser, FaPhoneAlt, FaHome, FaMapMarkerAlt, FaMapPin, FaGift } from 'react-icons/fa';
import Modal from '../modal';
import OTPModal from '../otpModal';
import './styles.scss';
import { createOrder } from '../../services/order';
import { sendOTP, verifyOTP } from '../../services/otp';

// Fields where we must NOT force uppercase (keeps digits correct).
const NO_UPPERCASE_FIELDS = new Set(['phone', 'pincode']);

// Single source of truth for the form fields.
const FIELD = {
  name: { name: 'name', label: 'Name', icon: <FaUser />, type: 'text', placeholder: 'Your full name', autoComplete: 'name' },
  phone: { name: 'phone', label: 'Phone', icon: <FaPhoneAlt />, type: 'tel', inputMode: 'numeric', maxLength: 10, placeholder: '10-digit mobile number', prefix: '+91', autoComplete: 'tel' },
  address: { name: 'address', label: 'Address', icon: <FaHome />, type: 'text', placeholder: 'Flat / house no, building, street', autoComplete: 'street-address' },
  area: { name: 'area', label: 'Locality / Area', icon: <FaMapMarkerAlt />, type: 'text', placeholder: 'Area' },
  pincode: { name: 'pincode', label: 'Pincode', icon: <FaMapPin />, type: 'text', inputMode: 'numeric', maxLength: 6, placeholder: '560001', autoComplete: 'postal-code' },
};
const FULL_FIELDS = [FIELD.name, FIELD.phone, FIELD.address];
const ROW_FIELDS = [FIELD.area, FIELD.pincode];

const EMPTY_CUSTOMER = { name: '', phone: '', address: '', area: '', pincode: '' };

const isValidPhone = (p) => /^\d{10}$/.test(p);
const isValidPincode = (p) => /^\d{6}$/.test(p);

// Stable per-attempt key so a retry / double-submit (e.g. lost response after a
// successful write) doesn't create a duplicate order — the backend dedupes on it.
const newIdempotencyKey = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `ck-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/** A single labelled, icon-prefixed input. Memoised so untouched fields don't re-render. */
const Field = React.memo(function Field({ field, value, error, onChange }) {
  const { name, label, icon, prefix, ...inputProps } = field;
  return (
    <div className={`ckField ${error ? 'ckField--error' : ''}`}>
      <label className="ckField__label" htmlFor={`cd-${name}`}>
        {label} <span className="req">*</span>
      </label>
      <div className="ckField__control">
        <span className="ckField__icon" aria-hidden="true">{icon}</span>
        {prefix && <span className="ckField__prefix">{prefix}</span>}
        <input
          {...inputProps}
          id={`cd-${name}`}
          name={name}
          className="ckField__input"
          required
          aria-invalid={!!error}
          value={value}
          onChange={onChange}
        />
      </div>
      {error && <span className="ckField__err">{error}</span>}
    </div>
  );
});

export default function ContactUs({ orderData }) {
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const isMountedRef = useRef(true);
  // one idempotency key per checkout attempt; rotated after a successful order
  const idempotencyKeyRef = useRef(newIdempotencyKey());

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const next = NO_UPPERCASE_FIELDS.has(name) ? value : value.toUpperCase();
    setCustomerData((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  // Closing the confirmation is manual — return the user home.
  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    navigate('/');
  }, [navigate]);

  // Step 1 — validate, then request an OTP.
  const handleRequestOtp = useCallback(async (e) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!isValidPhone(customerData.phone)) nextErrors.phone = 'Enter a valid 10-digit phone number.';
    if (!isValidPincode(customerData.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    // A delivery date & time is mandatory so every order is scheduled.
    if (!orderData?.date) {
      setSubmitError('Please pick a delivery date & time above before placing your order.');
      return;
    }

    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      await sendOTP(customerData.phone);
      if (isMountedRef.current) setShowOtpModal(true);
    } catch (error) {
      console.error('sendOTP failed', error);
      if (isMountedRef.current) setSubmitError(getErrorMessage(error, 'Failed to send OTP. Please try again.'));
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [submitting, customerData.phone, customerData.pincode, orderData?.date]);

  // Step 2 — verify the OTP, then place the order.
  const handleVerifyAndOrder = useCallback(async (otp) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await verifyOTP(customerData.phone, otp);
      setShowOtpModal(false);
      await createOrder({ ...orderData, customerData, idempotencyKey: idempotencyKeyRef.current });
      // success — rotate the key so a brand-new order later isn't deduped away
      idempotencyKeyRef.current = newIdempotencyKey();
      if (isMountedRef.current) setShowSuccess(true);
    } catch (error) {
      console.error('OTP verify / order submit failed', error);
      if (isMountedRef.current) setSubmitError(getErrorMessage(error, 'Something went wrong. Please try again.'));
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [submitting, customerData, orderData]);

  const renderField = (field) => (
    <Field
      key={field.name}
      field={field}
      value={customerData[field.name]}
      error={errors[field.name] || ''}
      onChange={handleChange}
    />
  );

  return (
    <>
      <OTPModal
        showModal={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleVerifyAndOrder}
        phone={customerData.phone}
        loading={submitting}
      />
      <Modal
        showModal={showSuccess}
        title={<>Order request received <FaGift /></>}
        content="Thank you! Our team will reach out to you very soon to confirm the details of your order."
        type="success"
        closeLabel="Back to Home"
        onClose={handleSuccessClose}
      />

      <form className="ckForm" onSubmit={handleRequestOtp} noValidate>
        {FULL_FIELDS.map(renderField)}
        <div className="ckForm__row">{ROW_FIELDS.map(renderField)}</div>

        <button type="submit" className="ckForm__submit" disabled={submitting}>
          {submitting ? 'Please wait…' : 'Confirm order'}
          {!submitting && <FaArrowRight />}
        </button>

        {submitError && <div className="ckForm__error" role="alert">{submitError}</div>}
      </form>
    </>
  );
}
