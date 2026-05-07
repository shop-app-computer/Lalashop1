import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Layout/AdminLayout";

const AUTH_ROUTES = ["/login", "/forgot-password", "/2fa"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthRoute = AUTH_ROUTES.includes(router.pathname);

  if (isAuthRoute) {
    return <Component {...pageProps} />;
  }

  return (
    <AdminLayout>
      <Component {...pageProps} />
    </AdminLayout>
  );
}
