import React from 'react';
import ProductTable from '@/components/Products/ProductTable';

const FeaturedProductsPage = () => (
  <div className="space-y-4 text-sm">
    <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
      Manage Slots
    </button>
    <ProductTable initialFilter="featured" hideFilters />
  </div>
);

export default FeaturedProductsPage;
