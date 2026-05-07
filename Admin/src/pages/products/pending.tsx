import React from 'react';
import ProductTable from '@/components/Products/ProductTable';

const PendingProductsPage = () => (
  <div className="space-y-4 text-sm">
    <ProductTable initialFilter="pending_review" hideFilters />
  </div>
);

export default PendingProductsPage;
