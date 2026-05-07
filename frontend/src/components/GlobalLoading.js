import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoading } from '../context/LoadingContext';

const GlobalLoading = () => {
  const { isLoading, loadingText } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-700 font-medium">{loadingText}</p>
      </div>
    </div>
  );
};

export default GlobalLoading;