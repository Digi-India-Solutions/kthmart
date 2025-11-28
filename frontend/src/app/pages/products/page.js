import FilterBar from '@/app/components/FilterBar/FilterBar';
import FilterCategories from '@/app/components/FilterCategories/FilterCategories';
import ProductCard from '@/app/components/ProductCards/ProductCards';
import Sidebar from '@/app/components/SideBar/SideBar';
import React from 'react';
import item1 from '@/app/Images/DowloadImage/item1.webp';
import item2 from '@/app/Images/DowloadImage/item2.jpg';
import item3 from '@/app/Images/DowloadImage/item3.png';
import item4 from '@/app/Images/DowloadImage/item4.jpg';
import './productpage.css';





export default function ProductsPage() {
  const products = [
    {
      name: "Milky Mist - Cheese (Diced Mozzarella), 2 Kg",
      price: 779,
      oldPrice: 1142.86,
      discount: "32% OFF",
      img: item1,
      rating: 4.9,
    },
    {
      name: "John - Cheese (Mozzarella & Cheddar), 1 Kg",
      price: 452,
      oldPrice: 558.1,
      discount: "19% OFF",
      img: item2,
      rating: 4.8,
    },
    {
      name: "D’lecta - Cream Cheese, 1 Kg",
      price: 662,
      oldPrice: 809.52,
      discount: "18% OFF",
      img: item3,
      rating: 4.9,
    },
    {
      name: "D’lecta - Cream Cheese, 1 Kg",
      price: 662,
      oldPrice: 809.52,
      discount: "18% OFF",
      img: item4,
      rating: 4.9,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen mt-16 bg-gray-50">
      {/* Sidebar (fixed on desktop, collapsible on mobile) */}
      <div className="md:w-1/5 w-full flex justify-center">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4">
        {/* Filter Categories */}
        <FilterCategories />

        {/* Filter Bar */}
        <FilterBar />

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((p, index) => (
            <ProductCard key={index} {...p} />
          ))}
        </div>
      </main>
    </div>
  );
}
