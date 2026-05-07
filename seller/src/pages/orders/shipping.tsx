import React from 'react';
import OrderTemplate from './OrderTemplate';

const Shipping = () => (
  <OrderTemplate
    title="Shipping"
    description="Orders currently in transit to the customer."
    filter={(o) => o.status === 'shipped'}
  />
);

export default Shipping;
