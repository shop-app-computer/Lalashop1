import React from 'react';
import OrderTable from '@/components/Orders/OrderTable';

const CancelledOrdersPage = () => (
  <div className="space-y-4 text-sm">
    <OrderTable initialFilter="cancelled" hideFilters />
  </div>
);

export default CancelledOrdersPage;
