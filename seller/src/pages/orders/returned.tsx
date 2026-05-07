import React from 'react';
import OrderTemplate from './OrderTemplate';

const Returned = () => (
  <OrderTemplate
    title="Returned / Refunded"
    description="Paid orders that were cancelled (proxy for refund until a dedicated Dispute model is added)."
    filter={(o) => o.status === 'canceled' && o.isPaid}
  />
);

export default Returned;
