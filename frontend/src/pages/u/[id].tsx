import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Loader2,
  Grid3x3,
  ShoppingBag,
  MessageCircle,
  Star,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import Avatar from "@/components/ui/Avatar";
import ReportModal, { type ReportTargetType } from "@/components/ReportModal";
import { BackendPost } from "../Social/components/SocialPost";

interface ProfileUser {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  followers: any[];
  following: any[];
  isSeller?: boolean;
}

interface ShopProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string | string[];
  images?: string[];
  countInStock?: number;
  rating?: number;
  numReviews?: number;
  freeShipping?: boolean;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"grid" | "shop">("grid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTargetType>("user");
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const openReport = (type: ReportTargetType) => {
    setReportTarget(type);
    setMenuOpen(false);
    setReportOpen(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return;
    let cancelled = false;
    apiClient("/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res?._id) setCurrentUserId(res._id);
      })
      .catch(() => {
        /* unauthenticated viewer */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          apiClient(`/users/profile/${id}`),
          apiClient(`/posts/user/${id}`),
        ]);
        if (!mounted) return;
        const userData: ProfileUser | null = profileRes?.data || null;
        setProfile(userData);
        setPosts(postsRes?.data || []);
        if (userData && currentUserId) {
          setIsFollowing(
            (userData.followers || []).some((f: any) => {
              const fid = typeof f === "string" ? f : f?._id;
              return fid === currentUserId;
            })
          );
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, [id, currentUserId]);

  // Fetch this user's product catalog (for the Shop tab).
  useEffect(() => {
    if (!profile?._id) return;
    let cancelled = false;
    setShopLoading(true);
    apiClient(`/products/seller/${profile._id}`)
      .then((res) => {
        if (cancelled) return;
        const list = (res?.data ?? res ?? []) as ShopProduct[];
        setShopProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setShopProducts([]);
      })
      .finally(() => {
        if (!cancelled) setShopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?._id]);

  const isOwnProfile = useMemo(
    () => Boolean(currentUserId && profile && currentUserId === profile._id),
    [currentUserId, profile]
  );

  const toggleFollow = async () => {
    if (!profile || !currentUserId) {
      router.push("/login");
      return;
    }
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      const res = await apiClient(`/users/follow/${profile._id}`, { method: "POST" });
      if (typeof res?.isFollowing === "boolean") setIsFollowing(res.isFollowing);
      setProfile((prev) => {
        if (!prev) return prev;
        const followers = wasFollowing
          ? prev.followers.filter((f: any) => (typeof f === "string" ? f : f?._id) !== currentUserId)
          : [...prev.followers, currentUserId];
        return { ...prev, followers };
      });
    } catch (err: any) {
      setIsFollowing(wasFollowing);
      alert(err?.message || "Failed to update follow");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">User not found</p>
        <button onClick={() => router.back()} className="text-sm font-bold text-primary">
          Go back
        </button>
      </div>
    );
  }

  const handle = profile.username || profile.name || "user";

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft size={22} className="text-dark" />
        </button>
        <h1 className="text-base font-black text-slate-900">{handle}</h1>
        <div className="relative" ref={menuRef}>
          {!isOwnProfile ? (
            <>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Profile options"
              >
                <MoreHorizontal size={22} className="text-dark" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-40">
                  <button
                    onClick={() => openReport("user")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Flag size={14} /> Report user
                  </button>
                  {profile.isSeller && (
                    <button
                      onClick={() => openReport("shop")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Flag size={14} /> Report shop
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="w-7" />
          )}
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-slate-100">
            <Avatar
              src={profile.profileImage}
              name={profile.name}
              username={profile.username}
              userId={profile._id}
              size={112}
              className="rounded-full"
              alt={handle}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h2 className="text-lg md:text-xl font-bold truncate">{handle}</h2>
              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all flex items-center gap-1.5 ${
                    isFollowing
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-primary text-white shadow-md shadow-primary/30 hover:opacity-90"
                  } disabled:opacity-50`}
                >
                  {followLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck size={14} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} /> Follow
                    </>
                  )}
                </button>
              )}
              {!isOwnProfile && (
                <button className="px-4 py-1.5 rounded-lg text-xs font-black tracking-wide bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5">
                  <MessageCircle size={14} /> Message
                </button>
              )}
              {isOwnProfile && (
                <Link
                  href="/me"
                  className="px-4 py-1.5 rounded-lg text-xs font-black tracking-wide bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-slate-900">{posts.length}</p>
                <p className="text-xs text-slate-500">posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{profile.followers?.length || 0}</p>
                <p className="text-xs text-slate-500">followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{profile.following?.length || 0}</p>
                <p className="text-xs text-slate-500">following</p>
              </div>
            </div>
          </div>
        </div>

        {(profile.name || profile.bio) && (
          <div className="mt-4">
            {profile.name && profile.username && (
              <p className="text-sm font-bold text-slate-900">{profile.name}</p>
            )}
            {profile.bio && (
              <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{profile.bio}</p>
            )}
          </div>
        )}
      </section>

      <div className="border-t border-slate-100 mt-2 sticky top-[57px] bg-white z-20">
        <div className="max-w-3xl mx-auto px-2 flex">
          {(
            [
              { id: "grid" as const, label: "Posts", icon: Grid3x3 },
              { id: "shop" as const, label: "Shop", icon: ShoppingBag },
            ]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase relative ${
                tab === t.id ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {tab === t.id && (
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto pt-4">
        {tab === "grid" ? (
          posts.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">No posts yet</div>
          ) : (
            <div className="grid grid-cols-3 gap-1 px-1">
              {posts.map((p) => (
                <Link
                  key={p._id}
                  href={`/posts/${p._id}`}
                  className="aspect-square bg-slate-100 overflow-hidden relative group"
                >
                  {p.mediaType === "video" ? (
                    <video
                      src={p.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={p.mediaUrl}
                      alt={p.caption || "post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </Link>
              ))}
            </div>
          )
        ) : shopLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={28} className="animate-spin text-slate-300" />
          </div>
        ) : shopProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={28} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-slate-400 font-medium">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-2">
            {shopProducts.map((p) => {
              const cover =
                Array.isArray(p.images) && p.images.length
                  ? p.images[0]
                  : Array.isArray(p.image)
                  ? p.image[0]
                  : p.image;
              const rating = Number(p.rating) || 0;
              return (
                <Link
                  key={p._id}
                  href={`/product/${p._id}`}
                  className="block group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={32} strokeWidth={1.5} />
                      </div>
                    )}
                    {p.freeShipping && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">
                        Free shipping
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 min-h-[32px]">
                      {p.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-[#ffab00]">
                      <Star size={11} fill="currentColor" />
                      <span className="text-[10px] font-bold text-slate-700">
                        {rating > 0 ? rating.toFixed(1) : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-1">
                        ({Number(p.numReviews) || 0})
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        Stock {Number(p.countInStock) || 0}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-black text-primary">
                      ฿{Number(p.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType={reportTarget}
        targetId={profile._id}
        targetLabel={handle}
      />
    </div>
  );
}
