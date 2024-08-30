import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.scss';

const DateTimePicker = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <section className="date-time-picker">
      <label className="label">Select Date :</label>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="date-picker-input"
      />
    </section>
  );
};

export default DateTimePicker;
