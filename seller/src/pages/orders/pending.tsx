import React from 'react';
import OrderTemplate from './OrderTemplate';

const Pending = () => (
  <OrderTemplate
    title="Pending payment"
    description="Orders waiting for the buyer to complete payment."
    filter={(o) => !o.isPaid && o.status === 'pending'}
  />
);

export default Pending;
