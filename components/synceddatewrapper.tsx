import React, { useState } from 'react';
import AnComp from './an-comp';
import DateRangeCard from './datepicker';

export default function SyncedDateWrapper() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const currentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

  const [startDate, setStartDate] = useState(startOfDay);
  const [endDate, setEndDate] = useState(currentTime);

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <>
      <AnComp
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />
      <DateRangeCard
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />
    </>
  );
}
