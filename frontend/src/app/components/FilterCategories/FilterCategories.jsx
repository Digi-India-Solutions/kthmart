"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/redux/features/getAllCategory/categorySlice";

export default function FilterCategories({ onCategorySelect, subcategoryId }) {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);

  const [activeCategory, setActiveCategory] = useState({ _id: subcategoryId } || null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (onCategorySelect) {
      onCategorySelect(cat); // Send selected category to parent
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm flex items-center gap-3 overflow-x-auto no-scrollbar px-3 sm:px-4 py-3 sm:py-4">
      {categories?.map((cat) => (
        <button
          key={cat._id}
          onClick={() => handleCategoryClick(cat)}
          className={`whitespace-nowrap text-xs sm:text-sm md:text-base px-3 py-1.5 font-medium transition-all rounded-md ${activeCategory?._id === cat._id
            ? "text-black border-b-2 border-black"
            : "text-gray-600 hover:text-black"
            }`}
        >
          {cat.Parent_name}
        </button>
      ))}
    </div>
  );
}























// "use client";
// import { useState } from "react";
// import "./FilterCategories.css";

// export default function FilterCategories() {
//   const categories = [
//     "Dairy",
//     "Masala, Salt & Sugar",
//     "Packaging Material",
//     "Sauces & Seasoning",
//     "Canned & Imported Items",
//     "Chicken & Eggs",
//   ];

//   const [active, setActive] = useState("Dairy");

//   return (
//     <div className="bg-white rounded-xl shadow-sm flex items-center gap-3 overflow-x-auto no-scrollbar px-3 sm:px-4 py-3 sm:py-4">
//       {categories.map((cat) => (
//         <button
//           key={cat}
//           onClick={() => setActive(cat)}
//           className={`whitespace-nowrap text-xs sm:text-sm md:text-base px-3 py-1.5 font-medium transition-all rounded-md ${
//             active === cat
//               ? "text-black border-b-2 border-black"
//               : "text-gray-600 hover:text-black"
//           }`}
//         >
//           {cat}
//         </button>
//       ))}
//     </div>
//   );
// }
