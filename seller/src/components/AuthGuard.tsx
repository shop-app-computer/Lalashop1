import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { useCurrentSeller } from '@/services/useCurrentSeller';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { seller, loading } = useCurrentSeller();

  useEffect(() => {
    if (loading) return;
    if (!seller) {
      const redirect = router.asPath !== '/' ? `?redirect=${encodeURIComponent(router.asPath)}` : '';
      router.replace(`/login${redirect}`);
      return;
    }
    if (!seller.isSeller) {
      router.replace('/login');
    }
  }, [loading, seller, router]);

  if (loading || !seller || !seller.isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
