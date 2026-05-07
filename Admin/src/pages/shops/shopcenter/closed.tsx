import React from 'react';
import ShopTable from '@/components/Shops/ShopTable';

const ClosedShops = () => (
  <div className="space-y-4 text-sm">
    <ShopTable initialFilter="closed" hideFilters />
  </div>
);

export default ClosedShops;
