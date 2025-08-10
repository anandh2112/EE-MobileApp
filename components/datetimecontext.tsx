import React, { createContext, useContext, useState } from 'react';

interface DateTimeContextType {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  format: (d: Date) => string;
}

const DateTimeContext = createContext<DateTimeContextType | undefined>(undefined);

export const DateTimeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const now = new Date();
  
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0, 0
  );

  const currentTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0, 0
  );

  const [startDate, setStartDate] = useState(startOfDay);
  const [endDate, setEndDate] = useState(currentTime);

  const format = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

  return (
    <DateTimeContext.Provider value={{ startDate, endDate, setStartDate, setEndDate, format }}>
      {children}
    </DateTimeContext.Provider>
  );
};

export const useDateTime = () => {
  const context = useContext(DateTimeContext);
  if (context === undefined) {
    throw new Error('useDateTime must be used within a DateTimeProvider');
  }
  return context;
};