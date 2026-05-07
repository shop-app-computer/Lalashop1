import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, ClipboardList, Store, UserSquare2, Globe } from "lucide-react";
import { useChat } from "@/components/chat/ChatContext";

export default function BottomNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const { unreadTotal } = useChat();

  const menuItems = [
    { icon: Home, href: "/", badge: 0 },
    { icon: Globe, href: "/Social/SocialPage", badge: unreadTotal },
    { icon: UserSquare2, href: "/creator/creator", badge: 0 },
    { icon: ClipboardList, href: "/orders/orders", badge: 0 },
    { icon: Store, href: "/me/me", badge: 0 },
  ];

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
              className={`nav-item ${isActive ? "active" : ""} relative`}
            >
              <span className="relative inline-flex">
                <item.icon
                  className="nav-icon"
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
