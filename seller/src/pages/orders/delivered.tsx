import React from 'react';
import OrderTemplate from './OrderTemplate';

const Delivered = () => (
  <OrderTemplate
    title="Delivered"
    description="Successfully delivered orders."
    filter={(o) => o.status === 'delivered'}
  />
);

export default Delivered;
