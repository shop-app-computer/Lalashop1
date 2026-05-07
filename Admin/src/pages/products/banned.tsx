import React from 'react';
import ProductTable from '@/components/Products/ProductTable';

const BannedProductsPage = () => (
  <div className="space-y-4 text-sm">
    <ProductTable initialFilter="banned" hideFilters showReportColumn />
  </div>
);

export default BannedProductsPage;
