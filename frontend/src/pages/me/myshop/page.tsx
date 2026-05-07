import CategoryTemplate from "@/menu/CategoryTemplate";
import { Sparkles, Monitor, Shirt,Home } from "lucide-react";

const iconMap: Record<string, any> = {
  beauty: Sparkles,
  electronics: Monitor,
  apparel: Shirt,
};

export default function DynamicCategoryPage({ params }: { params: { slug: string } }) {
  const Icon = iconMap[params.slug] || Home;
  return <CategoryTemplate slug={params.slug} Icon={Icon} />;
}