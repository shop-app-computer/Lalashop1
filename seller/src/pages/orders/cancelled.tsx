import React from 'react';
import OrderTemplate from './OrderTemplate';

const Cancelled = () => (
  <OrderTemplate
    title="Cancelled"
    description="Orders that were cancelled before delivery."
    filter={(o) => o.status === 'canceled' && !o.isPaid}
  />
);

export default Cancelled;
