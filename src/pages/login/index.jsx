import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container } from '@mui/material';
import './styles.scss';

const OTPLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = () => {
    // Simulate OTP send logic
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <Container maxWidth="xs" className="otp-login-container">
      <Box className="otp-login-box" sx={{ boxShadow: 3 }}>
        <Typography variant="h5" component="h1" className="heading">
          Phone Number Login
        </Typography>
        
        {!otpSent ? (
          <>
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              margin="normal"
              type="tel"
              className="input-field"
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              className="send-otp-btn"
              sx={{ mt: 2 }}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Enter OTP"
              variant="outlined"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
              type="text"
              className="input-field"
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyOtp}
              className="verify-otp-btn"
              sx={{ mt: 2 }}
            >
              Verify OTP
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default OTPLogin;
