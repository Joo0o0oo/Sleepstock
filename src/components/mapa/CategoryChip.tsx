import type { DreamCategory } from "@/hooks/use-mapa";

export function CategoryChip({ category }: { category: DreamCategory }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        background: `${category.color}22`,
        color: category.color,
        boxShadow: `inset 0 0 0 1px ${category.color}55`,
      }}
    >
      <span>{category.emoji}</span>
      <span>{category.name}</span>
    </span>
  );
}
