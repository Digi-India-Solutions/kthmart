"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubCategories } from "@/app/redux/features/getAllCategory/categorySlice";
import { serverUrl } from "@/app/redux/features/axiosInstance";
import CallBackImg from "../../Images/DBS/DBSLOGO.jpg";
import Image from "next/image";
import icon from '@/app/Images/DowloadImage/Menu.png'

export default function Sidebar({ categoryId, onSubcategorySelect }) {
  const dispatch = useDispatch();

  const { subCategories, loading, error } = useSelector(
    (state) => state.category
  );

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchSubCategories(categoryId));
    }
  }, [dispatch, categoryId]);

  if (loading) return <div className="p-4 text-gray-500">Loading subcategories...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading subcategories.</div>;

  return (
    <aside className="w-full bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Products</h2>
      {/* ✅ All Products Button */}
      <div className="flex items-center bg-gray-100 hover:bg-gray-200 p-2 rounded mb-3">
  <Image src={icon} alt="icon" className="allIconImg mr-2" height={50} width={50}/>
  <button
    onClick={() => onSubcategorySelect(null)}
    className="flex-1 text-left font-medium transition  p-2 rounded"
  >
    All
  </button>
</div>


      {(!subCategories || subCategories.length === 0) ? (
        <div className="p-4 text-gray-500">No subcategories found.</div>
      ) : (
        <ul className="space-y-2">
          {subCategories.map((sub) => (
            <li key={sub._id}>
              <button
                onClick={() => onSubcategorySelect(sub._id)}
                className="flex items-center w-full gap-2 p-2 rounded hover:bg-gray-100 transition text-left"
              >
                <img
                  src={
                    sub.categoryImage
                      ? `${serverUrl}/public/image/${sub.categoryImage}`
                      : CallBackImg
                  }
                  alt={sub.SubCategoryName}
                  className="w-10 h-10 object-cover rounded-full border border-gray-200"
                />
                <span className="text-gray-700 font-medium text-sm">
                  {sub.SubCategoryName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
