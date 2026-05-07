import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Loader2,
  Grid3x3,
  Film,
  MessageCircle,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import SocialPost, { BackendPost } from "../Social/components/SocialPost";

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

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"grid" | "feed">("grid");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCurrentUserId(parsed?._id || null);
      }
    } catch {
      /* ignore */
    }
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
        <div className="w-7" />
      </header>

      <section className="max-w-3xl mx-auto px-5 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-slate-100">
            <img
              src={
                profile.profileImage ||
                `https://i.pravatar.cc/150?u=${profile._id}`
              }
              alt={handle}
              className="w-full h-full object-cover"
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
              { id: "feed" as const, label: "Feed", icon: Film },
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
        {posts.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400">
            No posts yet
          </div>
        ) : tab === "grid" ? (
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
        ) : (
          <div className="space-y-8 px-2 md:px-0">
            {posts.map((p) => (
              <SocialPost key={p._id} post={p} currentUserId={currentUserId || undefined} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
