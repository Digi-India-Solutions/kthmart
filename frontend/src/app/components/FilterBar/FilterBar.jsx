"use client";
import "./fiterbar.css";

export default function FilterBar() {
  const filters = [
    "Rated 4.0+",
    "Brand",
    "Mozzarella Cheese",
    "Cheese Blend",
    "Cream Cheese",
    "Cheese Slice",
    "Type",
  ];

  return (
    <div className="bg-white filterResponsive rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-3 sm:px-4 py-3">
      {filters.map((filter) => (
        <button
          key={filter}
          className="px-3 sm:px-4 py-1.5 border border-gray-200 rounded-full text-xs sm:text-sm md:text-base text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition whitespace-nowrap"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
