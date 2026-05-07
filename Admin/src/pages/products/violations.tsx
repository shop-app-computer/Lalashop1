import React from 'react';
import ProductTable from '@/components/Products/ProductTable';

const ViolationsPage = () => (
  <div className="space-y-4 text-sm">
    <ProductTable initialFilter="violation" hideFilters showReportColumn />
  </div>
);

export default ViolationsPage;
