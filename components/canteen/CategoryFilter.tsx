"use client";

const CATEGORIES = ["all", "breakfast", "lunch", "dinner", "snacks", "beverages"];
const CATEGORY_ICONS: Record<string, string> = {
  all: "🍽️", breakfast: "🌅", lunch: "☀️", dinner: "🌙", snacks: "🍟", beverages: "🥤",
};

interface Props { active: string; onChange: (cat: string) => void; }

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            active === cat
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
          }`}
        >
          <span>{CATEGORY_ICONS[cat]}</span>
          <span className="capitalize">{cat}</span>
        </button>
      ))}
    </div>
  );
}
