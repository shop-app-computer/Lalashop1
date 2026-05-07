import React from 'react';
import WithdrawalsTable from '@/components/Withdrawals/WithdrawalsTable';

const SellerWithdrawals = () => (
  <div className="space-y-4 text-sm">
    <h2 className="text-[14px] font-semibold text-gray-900">Seller Withdrawals</h2>
    <WithdrawalsTable role="seller" defaultStatus="pending" />
  </div>
);

export default SellerWithdrawals;
