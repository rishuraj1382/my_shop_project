// frontend/src/OrderContext.js
import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [lastTrackedOrderId, setLastTrackedOrderId] = useState(null);

  const value = {
    lastTrackedOrderId,
    setLastTrackedOrderId,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
