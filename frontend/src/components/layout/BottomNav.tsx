import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, ClipboardList, Store, User, UserSquare2, Globe } from "lucide-react";

const menuItems = [
  { icon: Home, href: "/" },
  { icon: Globe, href: "/social" },
  //{ icon: User, href: "/profile/profile" },
  { icon: UserSquare2, href: "/creator/creator" },
  { icon: ClipboardList, href: "/orders/orders" },
  { icon: Store, href: "/me/me" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = router.pathname;

  // Hide BottomNav on these pages
  if (["/login", "/register", "/posts/create-post"].includes(pathname)) return null;

  return (
    <nav className="mobile-bottom-nav">
      <div className="bottom-nav-container">
        {menuItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={index}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <item.icon
                className="nav-icon"
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}