import React from 'react';
import ShopTable from '@/components/Shops/ShopTable';

const ActiveShops = () => (
  <div className="space-y-4 text-sm">
    <ShopTable initialFilter="active" hideFilters />
  </div>
);

export default ActiveShops;
