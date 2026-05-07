"use client";
import { useRouter } from "next/router";
import { categories } from "@/menu/manu";
import CategoryTemplate from "@/menu/CategoryTemplate";
import { 
  Filter, Monitor, Home, 
  Shirt, Wrench, Car, Sparkles, Building, Dumbbell 
} from "lucide-react";

const iconMap: Record<string, any> = {
  Monitor, Home, Shirt, Wrench, Car, Sparkles, Building, Dumbbell
};

export default function DynamicCategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  if (!slug) return null;

  const currentSlug = Array.isArray(slug) ? slug[0] : slug;
  const category = categories?.find(c => c.slug === currentSlug);
  const Icon = category ? iconMap[category.icon] : Filter;

  return <CategoryTemplate slug={currentSlug} Icon={Icon} />;
}
