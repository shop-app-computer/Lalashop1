import "../styles/globals.css";
import type { AppProps } from "next/app";
import SellerLayout from "@/components/Layout/SellerLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SellerLayout>
      <Component {...pageProps} />
    </SellerLayout>
  );
}
