import React from 'react';
import OrderTemplate from './OrderTemplate';

const Processing = () => (
  <OrderTemplate
    title="Processing"
    description="Orders that are paid and ready to be packed and shipped."
    filter={(o) => o.isPaid && o.status === 'processing'}
  />
);

export default Processing;
