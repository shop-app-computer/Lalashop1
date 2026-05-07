import React from 'react';
import ShopTable from '@/components/Shops/ShopTable';

const PendingShops = () => (
  <div className="space-y-4 text-sm">
    <ShopTable initialFilter="pending" hideFilters />
  </div>
);

export default PendingShops;
