"use client";
import { Monitor, Home, Shirt, Wrench, Car, Sparkles, Building2, Dumbbell, ChevronRight } from "lucide-react";
import { categories } from "@/menu/manu";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  Monitor, Home, Shirt, Wrench, Car, Sparkles,
  Building: Building2, Dumbbell,
};

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden self-start shadow-sm hidden lg:block">
      <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 mb-2">
        <h3 className="text-[11px] font-extrabold text-slate-500  tracking-widest">Market Categories</h3>
      </div>
      <div className="flex flex-col">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Monitor;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all duration-200 group hover:bg-cyan-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary transition-colors shadow-sm flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-600 group-hover:text-primary transition-colors line-clamp-1">{cat.name}</span>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-all" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
