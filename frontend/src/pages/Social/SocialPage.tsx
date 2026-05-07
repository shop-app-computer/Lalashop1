import React, { useState, useEffect } from "react";
import {
  Heart,
  Send,
  Search,
  PlusSquare,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import SocialPost, { BackendPost } from "./components/SocialPost";
import MediaUpload from "./components/MediaUpload";
import ChatInterface from "./Chat/ChatInterface";
import { apiClient } from "@/services/apiClient";

type ViewType = "feed" | "chat";

interface MiniUser {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
}

export default function SocialPage() {
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [view, setView] = useState<ViewType>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MiniUser[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  const fetchFeed = async () => {
    setLoadingPosts(true);
    try {
      const res = await apiClient("/posts");
      setPosts(res?.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Build a story rail of distinct authors from the loaded feed.
  const storyAuthors: MiniUser[] = React.useMemo(() => {
    const map = new Map<string, MiniUser>();
    for (const p of posts) {
      if (p.user && !map.has(p.user._id)) map.set(p.user._id, p.user);
    }
    return Array.from(map.values()).slice(0, 12);
  }, [posts]);

  // Lightweight client-side search over the authors who posted.
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const filtered = storyAuthors.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      return name.includes(q) || username.includes(q) || u._id.includes(q);
    });
    setSearchResults(filtered);
    setShowResults(true);
  }, [searchQuery, storyAuthors]);

  const handleUpload = (newPostData: any) => {
    setShowUpload(false);
    if (newPostData?._id) {
      const normalized: BackendPost = {
        _id: newPostData._id,
        user: newPostData.user || {
          _id: currentUserId || "me",
          name: "Me",
          username: "me",
        },
        mediaUrl: newPostData.mediaUrl,
        mediaType: newPostData.mediaType,
        caption: newPostData.caption,
        likes: newPostData.likes || [],
        comments: newPostData.comments || [],
        createdAt: newPostData.createdAt || new Date().toISOString(),
      };
      setPosts((prev) => [normalized, ...prev]);
    } else {
      fetchFeed();
    }
  };

  if (view === "chat") {
    return (
      <div className="min-h-screen bg-white">
        <ChatInterface />
        <button
          onClick={() => setView("feed")}
          className="fixed bottom-24 left-4 bg-white shadow-lg p-3 rounded-full border border-gray-border md:hidden"
        >
          <ArrowLeft size={24} className="text-dark" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8 font-sans">
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-lg border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-5xl mx-auto w-full md:px-8 shadow-sm">
        <div className="flex-1 max-w-[240px] md:max-w-[320px] relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setShowResults(true)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none text-dark focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-border rounded-xl shadow-xl max-h-[400px] overflow-y-auto z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-gray-border flex justify-between items-center bg-gray-light/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Search Results
                </span>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-[10px] text-primary font-bold pr-2 hover:underline"
                >
                  Clear
                </button>
              </div>
              {searchResults.map((u) => (
                <Link
                  key={u._id}
                  href={`/u/${u._id}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-light transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-border bg-white flex-shrink-0">
                    <img
                      src={
                        u.profileImage ||
                        `https://i.pravatar.cc/150?u=${u._id}`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-dark truncate group-hover:text-primary transition-colors">
                      {u.username || u.name || "user"}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{u.name || ""}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-4">
          <PlusSquare
            size={24}
            className="cursor-pointer hover:text-primary transition-colors text-dark"
            onClick={() => setShowUpload(true)}
          />
          <Heart size={24} className="cursor-pointer hover:text-red-500 transition-colors text-dark hidden sm:block" />
          <Send
            size={24}
            className="cursor-pointer -rotate-12 transition-colors hover:text-primary text-dark"
            onClick={() => setView("chat")}
          />
        </div>
      </nav>

      {showResults && (
        <div className="fixed inset-0 z-[55] bg-transparent" onClick={() => setShowResults(false)} />
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 max-w-xl mx-auto lg:mx-0 w-full">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm hidden md:block">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={`https://i.pravatar.cc/150?u=${currentUserId || "current"}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 text-left px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                What's on your mind?
              </button>
            </div>
            <div className="flex items-center justify-around pt-3 border-t border-slate-50">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 text-slate-600 text-sm font-bold hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
              >
                <ImageIcon size={18} className="text-emerald-500" /> Photo
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 text-slate-600 text-sm font-bold hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
              >
                <Video size={18} className="text-rose-500" /> Video
              </button>
            </div>
          </div>

          {storyAuthors.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl mb-6 p-4 flex gap-4 overflow-x-auto no-scrollbar shadow-sm">
              {storyAuthors.map((u) => (
                <Link
                  key={u._id}
                  href={`/u/${u._id}`}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-primary ring-offset-2 group-hover:ring-accent transition-all duration-300">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                      <img
                        src={u.profileImage || `https://i.pravatar.cc/150?u=${u._id}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 truncate w-16 text-center">
                    {(u.username || u.name || "user").split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {loadingPosts ? (
              <div className="flex justify-center py-20">
                <Loader2 size={32} className="animate-spin text-slate-300" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center text-sm text-slate-400">
                No posts yet. Be the first to share something.
              </div>
            ) : (
              posts.map((post) => (
                <SocialPost key={post._id} post={post} currentUserId={currentUserId || undefined} />
              ))
            )}
          </div>
        </div>

        <aside className="hidden lg:block w-80 space-y-6 sticky top-24 self-start">
          <div className="bg-white border border-gray-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500">Suggested for you</span>
              <button className="text-xs font-bold text-dark hover:underline">See All</button>
            </div>

            <div className="space-y-4">
              {storyAuthors.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center justify-between group">
                  <Link href={`/u/${u._id}`} className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-border bg-white flex-shrink-0">
                      <img
                        src={u.profileImage || `https://i.pravatar.cc/150?u=${u._id}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-dark truncate group-hover:text-primary transition-colors">
                        {u.username || u.name || "user"}
                      </span>
                      <span className="text-[10px] text-gray-500">Suggested for you</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {showUpload && <MediaUpload onUpload={handleUpload} onCancel={() => setShowUpload(false)} />}
    </div>
  );
}
