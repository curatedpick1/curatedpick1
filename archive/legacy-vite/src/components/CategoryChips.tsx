import React from 'react';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-4 px-4 md:px-8 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-bold text-[#000c1b] dark:text-slate-100">
          Browse Categories
        </h3>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs text-[#006b5b] dark:text-[#26fedc] hover:underline font-medium cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              id={`chip-${category.toLowerCase()}`}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#26fedc] text-[#000c1b] shadow-xs font-bold scale-105'
                  : 'bg-[#dce9ff] dark:bg-slate-800 text-[#0b1c30] dark:text-slate-200 hover:bg-[#26fedc]/70 hover:text-[#000c1b] dark:hover:bg-[#26fedc] dark:hover:text-[#000c1b]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
};
