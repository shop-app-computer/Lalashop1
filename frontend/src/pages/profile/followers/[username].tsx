import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  ChevronLeft, 
  Search, 
  User as UserIcon,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { User } from "@/types";
import FollowButton from "@/pages/Social/components/FollowButton";
import BottomNav from "@/components/layout/BottomNav";

// Mock data generator
const generateMockUsers = (username: string): User[] => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    username: `follower_user_${i + 1}`,
    name: `Follower ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?u=follower_${i}_${username}`,
    isFollowing: Math.random() > 0.5,
    bio: `Quality wholesale supplier based in Asia. 📦`
  }));
};

export default function FollowersPage() {
  const router = useRouter();
  const { username } = router.query;
  const [searchQuery, setSearchQuery] = useState("");
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUserList(generateMockUsers(username as string));
        setLoading(false);
      }, 600);
    }
  }, [username]);

  const filteredUsers = userList.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!username && !loading) return null;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <Head>
        <title>Followers of @{username} | SupplyNet</title>
      </Head>

      {/* Header - Sticky & Responsive */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-border px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-light rounded-full transition-colors">
            <ChevronLeft size={28} className="text-dark" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-dark">Followers</h1>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">@{username}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-light rounded-full transition-colors">
          <MoreHorizontal size={24} className="text-dark" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full pt-4">
        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-light border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-dark"
            />
          </div>
        </div>

        {/* User List */}
        <div className="px-4 flex flex-col gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-light" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-light rounded w-32" />
                  <div className="h-3 bg-gray-light rounded w-48" />
                </div>
                <div className="w-24 h-9 bg-gray-light rounded-lg" />
              </div>
            ))
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Link 
                  href={`/profile/${user.username}`} 
                  className="flex items-center gap-3 flex-1 overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-border bg-gray-light flex-shrink-0 transition-transform group-hover:scale-105">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={28} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate text-dark leading-tight">{user.username}</span>
                    <span className="text-xs text-gray-500 truncate leading-tight">{user.name}</span>
                    <span className="text-[11px] text-gray-400 truncate mt-1">{user.bio}</span>
                  </div>
                </Link>
                <FollowButton
                  initialFollowing={user.isFollowing}
                  userId={String(user.id)}
                  className="h-9 px-5 text-xs font-bold"
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-light flex items-center justify-center mb-4">
                <Search size={32} strokeWidth={1.5} className="opacity-40" />
              </div>
              <p className="text-base font-bold text-dark mb-1">No results found</p>
              <p className="text-sm">Try searching for another name or username</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
