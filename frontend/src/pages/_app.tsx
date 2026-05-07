import "@/pages/globals.css"; 
import type { AppProps } from "next/app";
import MainSidebar from "@/components/layout/MainSidebar";
import BottomNav from "@/components/layout/BottomNav";
import { LoadingProvider } from '../../LoadingContext';
import { useRouter } from "next/router";


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideSidebar = ["/login", "/register", "/Adminsell"].some(path => router.pathname.startsWith(path));
  const hideBottomNav = ["/login", "/register", "/Adminsell"].some(path => router.pathname.startsWith(path));

  return (
    <LoadingProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        {!hideSidebar && <MainSidebar />}
        <main className={`flex-1 ${!hideSidebar ? 'md:pl-[64px]' : ''} min-h-screen flex flex-col`}>
          <Component {...pageProps} />
        </main>
        {!hideBottomNav && <BottomNav />}
      </div>
    </LoadingProvider>
  );
}